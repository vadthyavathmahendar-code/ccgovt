import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile'; // Ensure correct path

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workerDetails, setWorkerDetails] = useState({ name: '', email: '' });
  const [resolvingId, setResolvingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, completed: 0 });
  
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return navigate('/'); }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'employee') return navigate('/');

      const email = session.user.email;
      setWorkerDetails({ name: email.split('@')[0], email: email });
      fetchTasks(email);
      setLoading(false);
    };

    checkUser();

    // Real-time listener
    const subscription = supabase
      .channel('employee_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
           if(session) fetchTasks(session.user.email);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [navigate]);

  const fetchTasks = async (email) => {
    // Fetch assigned tasks (Pending & In Progress)
    const { data: activeData } = await supabase
      .from('complaints')
      .select('*')
      .eq('assigned_to', email)
      .neq('status', 'Resolved')
      .order('created_at', { ascending: false });
    
    // Fetch completed count for stats
    const { count } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', email)
      .eq('status', 'Resolved');

    setTasks(activeData || []);
    setStats({ 
      pending: activeData?.length || 0, 
      completed: count || 0 
    });
  };

  const handleResolveSubmit = async (id) => {
    if (!replyText || !proofImage) return alert("⚠️ ATR Error: Please provide remarks and photo evidence.");
    setSubmitting(true);
    
    try {
      const fileName = `atr_${Date.now()}_${proofImage.name}`;
      await supabase.storage.from('complaint_images').upload(fileName, proofImage);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      
      const { error } = await supabase.from('complaints').update({ 
        status: 'Resolved', 
        admin_reply: replyText, 
        resolve_image_url: data.publicUrl 
      }).eq('id', id);

      if(error) throw error;

      setTasks(tasks.filter(t => t.id !== id));
      setStats(prev => ({ ...prev, pending: prev.pending - 1, completed: prev.completed + 1 }));
      
      alert("✅ Action Taken Report (ATR) Submitted Successfully.");
      setResolvingId(null); setReplyText(''); setProofImage(null);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openMaps = (locationStr) => {
    if (!locationStr) return;
    const coordinates = locationStr.replace('Lat: ', '').replace('Long: ', '').replace(', ', ',');
    window.open(`https://www.google.com/maps?q=${coordinates}`, '_blank');
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: '#0056b3'}}>Authenticate Officer...</div>;

  return (
    <div className="container fade-in">
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* 1. OFFICIAL HEADER STRIP */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '3px solid #0056b3', paddingBottom: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0056b3', textTransform: 'uppercase', fontSize: '1.4rem' }}>Field Officer Portal</h2>
          <p style={{ margin: 0, color: '#555', fontSize: '0.9rem' }}>
            <strong>Officer ID:</strong> {workerDetails.name.toUpperCase()} | <strong>Zone:</strong> Hyderabad Central
          </p>
        </div>
        
        <button onClick={() => setShowProfile(true)} className="btn-gov" style={{ background: '#0056b3', padding: '8px 15px' }}>
          👤 My Official ID
        </button>
      </div>

      {/* 2. INTERNAL TICKER (For Employees Only) */}
      <div style={{ background: '#e2e3e5', color: '#383d41', padding: '8px', border: '1px solid #d6d8db', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '25px', display: 'flex' }}>
        <strong style={{ marginRight: '10px', color: '#dc3545' }}>🔴 DEPT NOTICE:</strong>
        <marquee scrollamount="6">
          All pending pothole repairs must be cleared before Monsoon Phase II. • Submit daily reports by 6:00 PM. • Use GPS camera for all evidence uploads.
        </marquee>
      </div>

      {/* 3. PERFORMANCE STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div className="gov-card" style={{ padding: '15px', background: '#0056b3', color: 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.9 }}>Active Work Orders</div>
        </div>
        <div className="gov-card" style={{ padding: '15px', background: 'white', borderLeft: '4px solid #198754', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{stats.completed}</div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666' }}>Jobs Closed</div>
        </div>
        <div className="gov-card" style={{ padding: '15px', background: 'white', borderLeft: '4px solid #fd7e14', textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>98%</div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#666' }}>Efficiency Score</div>
        </div>
      </div>
      
      {/* 4. WORK ORDERS LIST */}
      <h3 style={{ borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '20px', color: '#333' }}>📋 Assigned Grievances (Work Orders)</h3>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: '#f8f9fa', borderRadius: '8px', border: '2px dashed #ccc' }}>
          <h3>✅ No Pending Work Orders</h3>
          <p style={{ color: '#666' }}>You have cleared your queue. Standby for new assignments.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {tasks.map((t, index) => (
            <div key={t.id} className="gov-card" style={{ padding: '0', border: '1px solid #ddd', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              
              {/* TICKET HEADER */}
              <div style={{ padding: '12px 15px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#475569' }}>#{String(t.id).padStart(6, '0')}</span>
                <span style={{ 
                  background: '#fff3cd', color: '#856404', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #ffeeba' 
                }}>
                  OPEN TICKET
                </span>
              </div>

              <div style={{ padding: '20px' }}>
                {/* ISSUE DETAILS */}
                <h4 style={{ margin: '0 0 5px', color: '#0056b3' }}>{t.category}</h4>
                <p style={{ fontSize: '0.95rem', color: '#333', marginBottom: '15px', lineHeight: '1.5' }}>{t.description}</p>
                
                {t.image_url && (
                  <div style={{ marginBottom: '15px', border: '1px solid #eee', padding: '4px', borderRadius: '4px' }}>
                    <img src={t.image_url} alt="Evidence" style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '2px' }} />
                    <div style={{ fontSize: '0.7rem', textAlign: 'center', color: '#888', padding: '2px' }}>Citizen Uploaded Evidence</div>
                  </div>
                )}
                
                {/* LOCATION BOX */}
                <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #e9ecef' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', marginBottom: '5px' }}>INCIDENT LOCATION</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1, fontSize: '0.85rem', fontFamily: 'monospace' }}>{t.location || 'No GPS Data'}</div>
                    <button onClick={() => openMaps(t.location)} className="btn-gov" style={{ padding: '5px 10px', fontSize: '0.75rem', background: '#333' }}>
                      Navigate ↗
                    </button>
                  </div>
                </div>

                {/* ACTION AREA */}
                {resolvingId === t.id ? (
                  <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '6px', border: '1px solid #bbf7d0', marginTop: '10px' }}>
                    <h5 style={{ margin: '0 0 10px', color: '#166534' }}>📝 Action Taken Report (ATR)</h5>
                    
                    <label style={{fontSize: '0.75rem', fontWeight: 'bold', color:'#555'}}>Official Remarks</label>
                    <textarea 
                      placeholder="Describe resolution details..." 
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)} 
                      rows="3" 
                      style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc', borderRadius:'4px' }} 
                    />
                    
                    <label style={{fontSize: '0.75rem', fontWeight: 'bold', color:'#555'}}>Upload Proof of Work</label>
                    <input type="file" onChange={e => setProofImage(e.target.files[0])} style={{ marginBottom: '10px', fontSize: '0.8rem', width:'100%' }} />
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleResolveSubmit(t.id)} className="btn-gov" style={{ flex: 1, background: '#198754', padding:'8px' }} disabled={submitting}>
                        {submitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                      <button onClick={() => setResolvingId(null)} className="btn-gov" style={{ background: '#6c757d', padding:'8px' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setResolvingId(t.id)} 
                    className="btn-gov" 
                    style={{ width: '100%', background: '#0056b3', marginTop: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <span>⚡</span> Initiate Resolution
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;