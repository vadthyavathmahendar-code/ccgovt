import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile'; 

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workerDetails, setWorkerDetails] = useState({ name: '', email: '' });
  
  // Workflow States
  const [resolvingId, setResolvingId] = useState(null);
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState(null);
  
  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); 

  const navigate = useNavigate();

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');

      // Check Role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'employee') return navigate('/');

      const email = session.user.email;
      setWorkerDetails({ name: email.split('@')[0], email: email });
      fetchTasks(email);
      setLoading(false);
    };
    init();

    const sub = supabase.channel('employee_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
           if(session) fetchTasks(session.user.email);
        });
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [navigate]);

  const fetchTasks = async (email) => {
    if (!email) return; // Prevent 400 Error by ensuring email exists
    
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('assigned_to', email)
      .order('created_at', { ascending: false });

    if (error) console.error("Fetch Error:", error.message);
    setTasks(data || []);
  };

  // --- 2. ACTIONS ---
  const startWork = async (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'In Progress' } : t));
    await supabase.from('complaints').update({ status: 'In Progress' }).eq('id', id);
  };

  const submitResolution = async (id) => {
    if (!notes || !proofImage) return alert("⚠️ Please provide notes and a photo.");
    setSubmitting(true);
    
    try {
      const fileName = `proof_${Date.now()}_${proofImage.name.replace(/\s/g, '')}`;
      await supabase.storage.from('complaint_images').upload(fileName, proofImage);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      
      const { error } = await supabase.from('complaints').update({ 
        status: 'Resolved', 
        admin_reply: notes, 
        resolve_image_url: data.publicUrl 
      }).eq('id', id);

      if(error) throw error;

      alert("✅ Resolution Submitted!");
      setResolvingId(null); setNotes(''); setProofImage(null);
      fetchTasks(workerDetails.email);

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openMaps = (loc) => {
    if(!loc) return;
    const coords = loc.replace('Lat: ', '').replace('Long: ', '').replace(' ', '');
    window.open(`https://www.google.com/maps?q=${coords}`, '_blank');
  };

  // --- 3. FILTERING ---
  const displayedTasks = tasks.filter(t => 
    activeTab === 'active' ? t.status !== 'Resolved' : t.status === 'Resolved'
  );
  
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Assigned' || t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Resolved').length
  };

  if (loading) return <div style={styles.loading}>Authenticating Field Officer...</div>;

  return (
    <div className="fade-in" style={styles.container}>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', textTransform: 'uppercase' }}>Field Officer Portal</h2>
          <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>ID: {workerDetails.name.toUpperCase()}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
         
          <button onClick={() => setShowProfile(true)} className="btn-gov" style={{padding:'8px 12px'}}>Profile</button>
          <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} className="btn-gov" style={{background:'#dc3545', padding:'8px 12px'}}>Logout</button>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsBar}>
        <StatBox label="Total" value={stats.total} color="#007bff" />
        <StatBox label="Pending" value={stats.pending} color="#dc3545" />
        <StatBox label="Active" value={stats.inProgress} color="#ffc107" textColor="black" />
        <StatBox label="Done" value={stats.completed} color="#28a745" />
      </div>

      {/* TABS (FIXED STYLE WARNING) */}
      <div style={styles.tabs}>
        <button 
          style={activeTab === 'active' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('active')}
        >
          📋 Current Work
        </button>
        <button 
          style={activeTab === 'history' ? styles.activeTab : styles.tab} 
          onClick={() => setActiveTab('history')}
        >
          ✅ History
        </button>
      </div>

      {/* LIST */}
      <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        {displayedTasks.length === 0 ? (
          <div style={styles.emptyState}>No tasks found in this section.</div>
        ) : (
          displayedTasks.map(t => (
            <div key={t.id} style={styles.taskCard}>
              
              {/* HEADER STRIP */}
              <div style={{ ...styles.cardStrip, borderLeft: `5px solid ${getPriorityColor(t.priority)}` }}>
                {/* 🔴 FIX: Convert ID to String before slicing to prevent crash */}
                <span style={{fontWeight:'bold'}}>#{String(t.id).slice(0,6)}</span>
                <span style={styles.statusBadge(t.status)}>{t.status.toUpperCase()}</span>
              </div>

              <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* DETAILS */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <h3 style={{ margin: '0 0 10px', color: '#0056b3' }}>{t.title} <span style={{fontSize:'0.8rem', color:'#666'}}>({t.category})</span></h3>
                  <p style={{ color: '#444', marginBottom: '15px' }}>{t.description}</p>
                  
                  <div style={styles.infoRow} onClick={() => openMaps(t.location)}>
                    <span>📍</span> <span>{t.location || 'No GPS'}</span>
                  </div>
                  <div style={{marginTop:'10px'}}>
                     {t.image_url ? <img src={t.image_url} alt="Problem" style={styles.thumbnail} /> : <span style={{fontSize:'0.8rem', color:'#999'}}>No Image Provided</span>}
                  </div>
                </div>

                {/* ACTIONS */}
                {activeTab === 'active' && (
                  <div style={styles.actionPanel}>
                    {t.status === 'Assigned' || t.status === 'Pending' ? (
                      <div style={{textAlign:'center', padding:'20px'}}>
                        <button onClick={() => startWork(t.id)} style={styles.startBtn}>🚀 Accept & Start</button>
                      </div>
                    ) : resolvingId === t.id ? (
                      <div className="fade-in">
                        <h4 style={{marginTop:0}}>Upload Proof</h4>
                        <input type="file" onChange={e => setProofImage(e.target.files[0])} style={{width:'100%', marginBottom:'10px'}} />
                        <textarea placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px'}} />
                        <button onClick={() => submitResolution(t.id)} style={styles.submitBtn} disabled={submitting}>{submitting ? '...' : 'Mark Resolved'}</button>
                        <button onClick={() => setResolvingId(null)} style={styles.cancelBtn}>Cancel</button>
                      </div>
                    ) : (
                      <div style={{textAlign:'center', padding:'10px'}}>
                        <div style={styles.wipBadge}>🚧 IN PROGRESS</div>
                        <button onClick={() => setResolvingId(t.id)} style={styles.resolveBtn}>📷 Complete Job</button>
                      </div>
                    )}
                  </div>
                )}

                {/* HISTORY NOTE */}
                {activeTab === 'history' && (
                  <div style={{ flex: 1, borderLeft: '1px solid #eee', paddingLeft: '20px' }}>
                    <h4 style={{margin:'0 0 10px', color:'green'}}>Resolution</h4>
                    <p style={{fontSize:'0.9rem'}}>{t.admin_reply}</p>
                    {t.resolve_image_url && <img src={t.resolve_image_url} alt="Proof" style={styles.thumbnail} />}
                  </div>
                )}

              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- STYLES ---
const getPriorityColor = (p) => p === 'High' ? '#dc3545' : p === 'Medium' ? '#ffc107' : '#28a745';

const StatBox = ({ label, value, color, textColor='white' }) => (
  <div style={{ flex: 1, background: color, color: textColor, padding: '15px', borderRadius: '8px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
    <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{value}</div>
    <div style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>{label}</div>
  </div>
);

const styles = {
  container: { background: '#f4f6f9', minHeight: '100vh', paddingBottom:'50px' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0056b3', fontWeight: 'bold' },
  header: { background: '#0056b3', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
  
  notifBadge: { position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  statsBar: { display: 'flex', gap: '15px', padding: '20px', maxWidth: '1000px', margin: '0 auto', flexWrap: 'wrap' },
  
  // 🔴 FIX: Separated Border Properties to stop React Warning
  tabs: { display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' },
  tab: { padding: '10px 20px', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '3px solid transparent', background: 'none', cursor: 'pointer', color: '#666' },
  activeTab: { padding: '10px 20px', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '3px solid #0056b3', background: 'none', cursor: 'pointer', color: '#0056b3', fontWeight: 'bold' },
  
  emptyState: { textAlign: 'center', padding: '50px', color: '#999', fontSize: '1.1rem' },
  taskCard: { background: 'white', borderRadius: '10px', boxShadow: '0 3px 10px rgba(0,0,0,0.05)', marginBottom: '20px', overflow: 'hidden' },
  cardStrip: { background: '#f8f9fa', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' },
  
  statusBadge: (s) => ({ padding: '4px 10px', borderRadius: '15px', fontSize: '0.75rem', fontWeight: 'bold', background: s==='Resolved'?'#d1e7dd':s==='In Progress'?'#fff3cd':'#e2e3e5', color: s==='Resolved'?'#0f5132':s==='In Progress'?'#856404':'#383d41' }),
  wipBadge: { color:'#856404', background:'#fff3cd', padding:'10px', borderRadius:'5px', marginBottom:'15px', fontWeight:'bold' },

  infoRow: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: '#555', marginBottom: '8px', cursor:'pointer' },
  thumbnail: { width: '80px', height: '80px', objectFit: 'cover', borderRadius: '5px', border: '1px solid #ddd', marginTop: '10px' },
  
  actionPanel: { flex: 1, minWidth: '280px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #eee' },
  startBtn: { width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  resolveBtn: { width: '100%', padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  submitBtn: { width: '100%', padding: '10px', background: '#198754', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginBottom: '10px' },
  cancelBtn: { width: '100%', padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
};

export default EmployeeDashboard;