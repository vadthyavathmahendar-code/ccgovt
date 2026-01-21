import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile'; 

const EmployeeDashboard = () => {
  // --- STATE ---
  const [tasks, setTasks] = useState([]);
  const [workerDetails, setWorkerDetails] = useState({ name: '', email: '' });
  const [resolvingId, setResolvingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'
  const [stats, setStats] = useState({ pending: 0, completed: 0 });
  const [showProfile, setShowProfile] = useState(false);

  const navigate = useNavigate();

  // --- INITIALIZATION ---
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

  // --- FETCH DATA ---
  const fetchTasks = async (email) => {
    // Fetch ALL tasks assigned to this employee
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .eq('assigned_to', email)
      .order('created_at', { ascending: false });
    
    const allTasks = data || [];
    setTasks(allTasks);

    // Calculate Stats
    setStats({ 
      pending: allTasks.filter(t => t.status !== 'Resolved').length, 
      completed: allTasks.filter(t => t.status === 'Resolved').length 
    });
  };

  // --- ACTIONS ---
  const handleResolveSubmit = async (id) => {
    if (!replyText || !proofImage) return alert("⚠️ ATR Error: Please provide remarks and photo evidence.");
    setSubmitting(true);
    
    try {
      const fileName = `atr_${Date.now()}_${proofImage.name.replace(/\s/g, '')}`;
      await supabase.storage.from('complaint_images').upload(fileName, proofImage);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      
      const { error } = await supabase.from('complaints').update({ 
        status: 'Resolved', 
        admin_reply: replyText, 
        resolve_image_url: data.publicUrl 
      }).eq('id', id);

      if(error) throw error;

      alert("✅ Action Taken Report (ATR) Submitted Successfully.");
      setResolvingId(null); 
      setReplyText(''); 
      setProofImage(null);
      
      // Refresh list locally
      const updatedTasks = tasks.map(t => 
        t.id === id ? { ...t, status: 'Resolved', admin_reply: replyText, resolve_image_url: data.publicUrl } : t
      );
      setTasks(updatedTasks);
      setStats(prev => ({ pending: prev.pending - 1, completed: prev.completed + 1 }));

    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const openMaps = (locationStr) => {
    if (!locationStr) return;
    // Clean string "Lat: 17.123, Long: 78.123" -> "17.123,78.123"
    const coordinates = locationStr.replace('Lat: ', '').replace('Long: ', '').replace(', ', ',');
    // Correct Google Maps URL
    window.open(`https://www.google.com/maps?q=${coordinates}`, '_blank');
  };

  // --- FILTERING ---
  const visibleTasks = tasks.filter(t => {
    if (activeTab === 'active') return t.status !== 'Resolved';
    if (activeTab === 'history') return t.status === 'Resolved';
    return true;
  });

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', color:'#0056b3', fontWeight:'bold'}}>Authenticating Officer...</div>;

  return (
    <div className="container fade-in" style={{ paddingBottom: '50px' }}>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* 1. HEADER */}
      <div style={{ background: 'white', padding: '15px 20px', borderBottom: '4px solid #0056b3', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0056b3', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>FIELD OFFICER</h2>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>ID: <strong>{workerDetails.name.toUpperCase()}</strong></div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowProfile(true)} className="btn-gov" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>👤 Profile</button>
          <button onClick={handleLogout} className="btn-gov" style={{ background: '#dc3545', padding: '8px 12px', fontSize: '0.85rem' }}>Logout</button>
        </div>
      </div>

      {/* 2. STATS & NOTICE */}
      <div style={{ padding: '20px' }}>
        <div style={{ background: '#fff3cd', color: '#856404', padding: '10px', borderRadius: '5px', fontSize: '0.85rem', marginBottom: '20px', border: '1px solid #ffeeba' }}>
          <strong>📢 URGENT:</strong> Clear all "High Priority" tasks before 5 PM. Use GPS camera for evidence.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div className="gov-card" style={{ padding: '15px', background: '#0056b3', color: 'white', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.pending}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>PENDING TASKS</div>
          </div>
          <div className="gov-card" style={{ padding: '15px', background: 'white', borderLeft: '5px solid #198754', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{stats.completed}</div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>COMPLETED</div>
          </div>
        </div>

        {/* 3. TABS */}
        <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
          <button 
            onClick={() => setActiveTab('active')}
            style={{ 
              flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', 
              borderBottom: activeTab === 'active' ? '3px solid #0056b3' : 'none',
              fontWeight: activeTab === 'active' ? 'bold' : 'normal', color: activeTab === 'active' ? '#0056b3' : '#666'
            }}
          >
            🚧 Active Tasks ({stats.pending})
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{ 
              flex: 1, padding: '12px', background: 'none', border: 'none', cursor: 'pointer', 
              borderBottom: activeTab === 'history' ? '3px solid #0056b3' : 'none',
              fontWeight: activeTab === 'history' ? 'bold' : 'normal', color: activeTab === 'history' ? '#0056b3' : '#666'
            }}
          >
            ✅ History ({stats.completed})
          </button>
        </div>

        {/* 4. TASK LIST */}
        {visibleTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', color: '#999', border: '2px dashed #ddd' }}>
            <h3>{activeTab === 'active' ? '🎉 All Caught Up!' : '📂 No History Found'}</h3>
            <p>No records available in this section.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {visibleTasks.map((t) => (
              <div key={t.id} className="gov-card" style={{ padding: '0', border: '1px solid #eee', overflow: 'hidden' }}>
                
                {/* CARD HEADER */}
                <div style={{ padding: '12px 15px', background: '#f8f9fa', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#555', fontFamily: 'monospace' }}>#{t.id.toString().substring(0,8)}</span>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    {t.priority === 'High' && <span style={{ background: '#dc3545', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>HIGH PRIORITY</span>}
                    <span style={{ 
                      background: t.status === 'Resolved' ? '#d1e7dd' : '#fff3cd', 
                      color: t.status === 'Resolved' ? '#0f5132' : '#856404', 
                      padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' 
                    }}>
                      {t.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div style={{ padding: '20px' }}>
                  <h4 style={{ margin: '0 0 5px', color: '#0056b3' }}>{t.category}</h4>
                  <p style={{ margin: '0 0 15px', color: '#444', fontSize: '0.95rem', lineHeight: '1.5' }}>{t.description}</p>

                  {/* IMAGES (Before & After) */}
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', marginBottom: '15px' }}>
                    {t.image_url && (
                      <div style={{ minWidth: '120px', flex: 1, border: '1px solid #eee', padding: '5px', borderRadius: '5px' }}>
                        <div style={{ fontSize: '0.75rem', marginBottom: '5px', color: '#666', textAlign: 'center' }}>Before (Citizen)</div>
                        <img src={t.image_url} alt="Before" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '3px' }} />
                      </div>
                    )}
                    {t.resolve_image_url && (
                      <div style={{ minWidth: '120px', flex: 1, border: '1px solid #d1e7dd', background: '#f0fdf4', padding: '5px', borderRadius: '5px' }}>
                        <div style={{ fontSize: '0.75rem', marginBottom: '5px', color: 'green', textAlign: 'center' }}>After (You)</div>
                        <img src={t.resolve_image_url} alt="After" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '3px' }} />
                      </div>
                    )}
                  </div>

                  {/* LOCATION */}
                  <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '5px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <span style={{ color: '#555' }}>📍 {t.location || "No GPS Data"}</span>
                    <button onClick={() => openMaps(t.location)} style={{ border: 'none', background: '#333', color: 'white', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Open Map ↗</button>
                  </div>

                  {/* ACTION AREA (Only for Active Tasks) */}
                  {activeTab === 'active' && (
                    <div style={{ borderTop: '1px dashed #ddd', paddingTop: '15px' }}>
                      {resolvingId === t.id ? (
                        <div className="fade-in" style={{ background: '#f8fff9', border: '1px solid #28a745', padding: '15px', borderRadius: '5px' }}>
                          <h5 style={{ margin: '0 0 10px', color: '#198754' }}>📝 Submit Action Report</h5>
                          
                          <label style={{display:'block', fontSize:'0.8rem', fontWeight:'bold', marginBottom:'5px'}}>1. Official Remarks</label>
                          <textarea 
                            placeholder="Describe work done..." 
                            rows="2" 
                            value={replyText} 
                            onChange={e => setReplyText(e.target.value)} 
                            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '10px' }} 
                          />
                          
                          <label style={{display:'block', fontSize:'0.8rem', fontWeight:'bold', marginBottom:'5px'}}>2. Proof of Completion</label>
                          <input type="file" onChange={e => setProofImage(e.target.files[0])} style={{ width: '100%', marginBottom: '15px', fontSize: '0.85rem' }} />

                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => handleResolveSubmit(t.id)} className="btn-gov" style={{ flex: 1, background: '#198754' }} disabled={submitting}>
                              {submitting ? 'Uploading...' : 'Submit & Close'}
                            </button>
                            <button onClick={() => setResolvingId(null)} className="btn-gov" style={{ background: '#6c757d' }}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setResolvingId(t.id)} className="btn-gov" style={{ width: '100%' }}>⚡ Start Resolution</button>
                      )}
                    </div>
                  )}

                  {/* RESOLVED INFO (Only for History) */}
                  {activeTab === 'history' && (
                    <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '5px', border: '1px solid #bbf7d0', fontSize: '0.85rem', color: '#166534' }}>
                      <strong>✅ Resolution Note:</strong> {t.admin_reply}
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;