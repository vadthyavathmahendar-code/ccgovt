import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../pages/Profile'; // Import new modal
import toast from 'react-hot-toast'; // Import Toast

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workerDetails, setWorkerDetails] = useState({ name: '', email: '' });
  
  // Workflow States
  const [resolvingId, setResolvingId] = useState(null);
  const [notes, setNotes] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  
  // UI States
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); 

  const navigate = useNavigate();

  // --- 1. INITIAL FETCH ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/'); return; }

      // Check Role
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'employee') { navigate('/'); return; }

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
    if (!email) return;
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('assigned_to', email)
      .order('created_at', { ascending: false });

    if (error) console.error("Fetch Error:", error.message);
    
    // Smart Sorting: Urgent > Oldest > Newest
    const sortedData = (data || []).sort((a, b) => {
        const isUrgentA = a.title?.includes('⚠️') || false;
        const isUrgentB = b.title?.includes('⚠️') || false;
        if (isUrgentA && !isUrgentB) return -1;
        if (!isUrgentA && isUrgentB) return 1;
        return new Date(b.created_at) - new Date(a.created_at);
    });
    setTasks(sortedData);
  };

  // --- 2. ACTIONS ---
  const startWork = async (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'In Progress' } : t));
    await supabase.from('complaints').update({ status: 'In Progress' }).eq('id', id);
    toast.success("Task Started! 🚧");
  };

  const handleProofSelect = (e) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setProofImage(file);
          setProofPreview(URL.createObjectURL(file));
      }
  };

  const submitResolution = async (id) => {
    if (!notes || !proofImage) return toast.error("⚠️ Please provide notes and a photo.");
    setSubmitting(true);
    const loadingToast = toast.loading("Submitting resolution...");
    
    try {
      const fileName = `proof_${Date.now()}_${proofImage.name.replace(/\s/g, '')}`;
      const { error: uploadError } = await supabase.storage.from('complaint_images').upload(fileName, proofImage);
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      
      const { error } = await supabase.from('complaints').update({ 
        status: 'Resolved', 
        admin_reply: notes, 
        resolve_image_url: data.publicUrl 
      }).eq('id', id);

      if(error) throw error;

      toast.success("Resolution Submitted! ✅", { id: loadingToast });
      setResolvingId(null); setNotes(''); setProofImage(null); setProofPreview(null);
      fetchTasks(workerDetails.email);

    } catch (err) {
      toast.error("Error: " + err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const openMaps = (loc) => {
    if(!loc) return;
    const coords = loc.match(/-?\d+(\.\d+)?/g); 
    if(coords && coords.length >= 2) {
        window.open(`https://www.google.com/maps?q=${coords[0]},${coords[1]}`, '_blank');
    } else {
        toast.error("Invalid GPS format");
    }
  };

  const getDaysOld = (dateString) => {
      const days = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
      if (days === 0) return { label: 'Today', color: '#166534', bg: '#dcfce7' };
      if (days > 5) return { label: `${days} Days Old`, color: '#991b1b', bg: '#fee2e2' }; 
      return { label: `${days} Days Ago`, color: '#475569', bg: '#f1f5f9' };
  };

  const displayedTasks = tasks.filter(t => activeTab === 'active' ? t.status !== 'Resolved' : t.status === 'Resolved');
  
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Assigned' || t.status === 'Pending').length,
    inProgress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Resolved').length
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* GLOBAL STYLES FOR ANIMATIONS */}
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes pulse-red { 0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); } }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        .urgent-card { border: 2px solid #ef4444 !important; animation: pulse-red 2s infinite; }
        .tab-btn { transition: all 0.2s ease; border-bottom: 3px solid transparent; }
        .tab-btn:hover { background: #f8fafc; }
        .tab-active { border-bottom: 3px solid #2563eb; color: #2563eb; font-weight: bold; background: #eff6ff; }
      `}</style>

      {/* NEW PROFILE MODAL */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.5rem' }}>👷‍♂️</div>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize:'1.5rem' }}>Field Officer Portal</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>ID: {workerDetails.name.toUpperCase()}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setShowProfile(true)} className="btn btn-outline" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>Profile</button>
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn btn-primary" style={{ background: '#ef4444', borderColor:'#ef4444' }}>Logout</button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', margin: '20px 0' }}>
        <StatCard label="Total Assignments" value={stats.total} color="#2563eb" bg="#eff6ff" />
        <StatCard label="Pending Action" value={stats.pending} color="#d97706" bg="#fffbeb" />
        <StatCard label="In Progress" value={stats.inProgress} color="#059669" bg="#ecfdf5" />
        <StatCard label="Jobs Completed" value={stats.completed} color="#475569" bg="#f1f5f9" />
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button 
            className={`tab-btn ${activeTab === 'active' ? 'tab-active' : ''}`} 
            onClick={() => setActiveTab('active')}
            style={styles.tab}
        >
          📋 Current Work
        </button>
        <button 
            className={`tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`} 
            onClick={() => setActiveTab('history')}
            style={styles.tab}
        >
          ✅ History
        </button>
      </div>

      {/* TASK LIST */}
      <div style={{ padding: '10px 0' }}>
        {loading ? (
             <>
                <SkeletonCard />
                <SkeletonCard />
            </>
        ) : displayedTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎉</div>
              <div style={{ color: '#64748b' }}>All caught up! No tasks in this section.</div>
          </div>
        ) : (
          displayedTasks.map(t => {
            const isUrgent = t.title.includes('⚠️');
            const age = getDaysOld(t.created_at);

            return (
                <div key={t.id} className={`gov-card fade-in ${isUrgent ? 'urgent-card' : ''}`} style={styles.taskCard}>
                
                {/* URGENT HEADER */}
                {isUrgent && (
                    <div style={{ background: '#ef4444', color: 'white', padding: '8px 20px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚠️ SAFETY HAZARD - HIGH PRIORITY</span>
                    </div>
                )}

                {/* META STRIP */}
                <div style={styles.cardStrip}>
                    <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                        <span style={{fontWeight:'bold', color:'#64748b', fontFamily:'monospace'}}>#{String(t.id).slice(0,4)}</span>
                        <span style={{ fontSize:'0.75rem', fontWeight:'bold', color: age.color, background: age.bg, padding:'2px 8px', borderRadius:'6px' }}>{age.label}</span>
                    </div>
                    <span style={styles.statusBadge(t.status)}>{t.status.toUpperCase()}</span>
                </div>

                <div style={{ padding: '25px', display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
                    
                    {/* LEFT: DETAILS */}
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                             <h3 style={{ margin: '0 0 10px', color: '#0f172a', fontSize:'1.25rem' }}>
                                {t.title.replace('⚠️ [URGENT] ', '')} 
                            </h3>
                            <span style={{ fontSize:'0.75rem', fontWeight:'bold', color:'#2563eb', background:'#eff6ff', padding:'4px 10px', borderRadius:'15px' }}>{t.category}</span>
                        </div>
                        
                        <p style={{ color: '#475569', marginBottom: '20px', lineHeight:'1.6' }}>{t.description}</p>
                        
                        <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                            <button onClick={() => openMaps(t.location)} style={styles.mapBtn}>
                                📍 Get Directions
                            </button>
                        </div>

                        <div style={{marginTop:'10px', borderRadius:'8px', overflow:'hidden', border:'1px solid #e2e8f0', width:'fit-content'}}>
                            {t.image_url ? <img src={t.image_url} alt="Problem" style={{ width: '120px', height: '120px', objectFit: 'cover' }} /> : <div style={{width:'120px', height:'120px', background:'#f1f5f9', display:'flex', alignItems:'center', justifyContent:'center', color:'#94a3b8', fontSize:'0.8rem'}}>No Photo</div>}
                        </div>
                    </div>

                    {/* RIGHT: ACTION PANEL */}
                    {activeTab === 'active' && (
                    <div style={styles.actionPanel}>
                        {t.status === 'Assigned' || t.status === 'Pending' ? (
                        <div style={{textAlign:'center', padding:'30px 20px'}}>
                            <div style={{fontSize:'2rem', marginBottom:'10px'}}>🚀</div>
                            <div style={{marginBottom:'15px', color:'#64748b', fontSize:'0.9rem'}}>New assignment available</div>
                            <button onClick={() => startWork(t.id)} className="btn btn-primary" style={{width:'100%'}}>Accept Assignment</button>
                        </div>
                        ) : resolvingId === t.id ? (
                        <div className="fade-in">
                            <h4 style={{marginTop:0, marginBottom:'15px', color:'#0f172a'}}>Submit Resolution</h4>
                            
                            {/* Drag & Drop Proof */}
                            <div style={styles.uploadBox} onClick={() => document.getElementById(`file-${t.id}`).click()}>
                                {proofPreview ? 
                                    <div style={{position:'relative'}}>
                                        <img src={proofPreview} alt="Preview" style={{width:'100%', height:'150px', objectFit:'cover', borderRadius:'6px'}} />
                                        <div style={{position:'absolute', bottom:0, left:0, right:0, background:'rgba(0,0,0,0.6)', color:'white', fontSize:'0.8rem', padding:'5px'}}>Click to Change</div>
                                    </div>
                                    : 
                                    <div style={{padding:'30px 10px', color:'#64748b'}}>
                                        <span style={{fontSize:'1.5rem'}}>📸</span><br/>Click to Upload Proof
                                    </div>
                                }
                                <input id={`file-${t.id}`} type="file" onChange={handleProofSelect} style={{display:'none'}} />
                            </div>

                            <textarea placeholder="Officer notes (e.g. Pothole filled with asphalt)..." value={notes} onChange={e => setNotes(e.target.value)} style={styles.textarea} />
                            
                            <div style={{display:'flex', gap:'10px'}}>
                                <button onClick={() => submitResolution(t.id)} className="btn btn-primary" style={{flex:2, background:'#16a34a', borderColor:'#16a34a'}} disabled={submitting}>{submitting ? 'Uploading...' : '✅ Mark Resolved'}</button>
                                <button onClick={() => { setResolvingId(null); setProofPreview(null); }} className="btn btn-outline" style={{flex:1, color:'#64748b', borderColor:'#cbd5e1'}}>Cancel</button>
                            </div>
                        </div>
                        ) : (
                        <div style={{textAlign:'center', padding:'20px'}}>
                            <div style={styles.wipBadge}>🚧 IN PROGRESS</div>
                            <p style={{fontSize:'0.9rem', color:'#64748b', margin:'15px 0'}}>Work started. When you are finished, upload a photo to close the ticket.</p>
                            <button onClick={() => setResolvingId(t.id)} className="btn btn-primary" style={{width:'100%', background:'#0f172a', borderColor:'#0f172a'}}>📷 Complete Job</button>
                        </div>
                        )}
                    </div>
                    )}

                    {/* HISTORY VIEW (READ ONLY) */}
                    {activeTab === 'history' && (
                    <div style={{ flex: 1, borderLeft: '4px solid #f1f5f9', paddingLeft: '25px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
                        <h4 style={{margin:'0 0 15px', color:'#166534', display:'flex', alignItems:'center', gap:'5px'}}>✅ Resolution Report</h4>
                        
                        <div style={{background:'#f0fdf4', padding:'15px', borderRadius:'8px', marginBottom:'15px', border:'1px solid #bbf7d0'}}>
                            <span style={{fontSize:'0.75rem', fontWeight:'bold', color:'#166534', letterSpacing:'0.5px'}}>OFFICER NOTES</span>
                            <p style={{margin:'5px 0', fontSize:'0.95rem', color:'#14532d'}}>{t.admin_reply}</p>
                        </div>

                        {t.resolve_image_url && (
                            <div>
                                <span style={{fontSize:'0.75rem', fontWeight:'bold', color:'#64748b', marginBottom:'5px', display:'block'}}>PROOF OF WORK</span>
                                <img src={t.resolve_image_url} alt="Proof" style={{ width: '100%', maxHeight:'150px', objectFit: 'cover', borderRadius: '8px', border:'1px solid #e2e8f0' }} />
                            </div>
                        )}
                    </div>
                    )}

                </div>
                </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---
const SkeletonCard = () => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', border: '1px solid #f1f5f9', marginBottom:'20px' }}>
        <div className="skeleton" style={{ width: '120px', height: '120px' }}></div>
        <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '15px' }}></div>
            <div className="skeleton" style={{ width: '80%', height: '15px', marginBottom: '10px' }}></div>
            <div className="skeleton" style={{ width: '60%', height: '15px' }}></div>
        </div>
    </div>
);

const StatCard = ({ label, value, color, bg }) => (
    <div className="gov-card" style={{ textAlign: 'center', background: bg, borderLeft: `4px solid ${color}`, padding: '20px', borderRadius:'12px', boxShadow:'0 2px 4px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: 0, fontSize: '2rem', color: color }}>{value}</h3>
        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight:'600', textTransform:'uppercase' }}>{label}</span>
    </div>
);

// --- STYLES OBJECT ---
const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px' },
  tab: { flex: 1, padding: '15px', cursor: 'pointer', background: 'none', border: 'none', fontSize: '1rem', color: '#64748b' },
  
  taskCard: { background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '25px', overflow: 'hidden', border: '1px solid #e2e8f0' },
  cardStrip: { background: '#f8fafc', padding: '12px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' },
  
  statusBadge: (s) => ({ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', background: s==='Resolved'?'#dcfce7':s==='In Progress'?'#fef9c3':'#e2e8f0', color: s==='Resolved'?'#166534':s==='In Progress'?'#854d0e':'#475569', letterSpacing:'0.5px' }),
  wipBadge: { color:'#854d0e', background:'#fef9c3', padding:'8px 15px', borderRadius:'20px', display:'inline-block', fontWeight:'bold', fontSize:'0.85rem', letterSpacing:'0.5px' },

  mapBtn: { background: 'white', color: '#0f172a', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 1px 2px rgba(0,0,0,0.05)' },
  
  actionPanel: { flex: 1, minWidth: '300px', background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  uploadBox: { border: '2px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', marginBottom: '15px', cursor: 'pointer', background: '#f8fafc', overflow:'hidden', transition:'all 0.2s' },
  textarea: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', minHeight:'80px', fontSize:'0.95rem', fontFamily:'inherit' },
};

export default EmployeeDashboard;