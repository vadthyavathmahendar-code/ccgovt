import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [workerDetails, setWorkerDetails] = useState({ name: '', email: '' });
  const [resolvingId, setResolvingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // 1. ROBUST AUTH CHECK
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return navigate('/'); }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'employee') return navigate('/');

      setWorkerDetails({ name: session.user.email.split('@')[0], email: session.user.email });
      fetchTasks(session.user.email);
      setLoading(false);
    };

    checkUser();

    // 2. REAL-TIME UPDATES
    const subscription = supabase
      .channel('employee_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        // Safe reload logic
        supabase.auth.getSession().then(({ data: { session } }) => {
           if(session) fetchTasks(session.user.email);
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [navigate]);

  const fetchTasks = async (email) => {
    const { data } = await supabase.from('complaints').select('*').eq('assigned_to', email).order('created_at', { ascending: false });
    setTasks(data || []);
  };

  const handleResolveSubmit = async (id) => {
    if (!replyText || !proofImage) return alert("Please provide reply and proof image.");
    setSubmitting(true);
    
    // Upload Proof
    const fileName = `proof_${Date.now()}_${proofImage.name}`;
    await supabase.storage.from('complaint_images').upload(fileName, proofImage);
    const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
    
    // Optimistic Update
    const updatedTasks = tasks.map(t => t.id === id ? { ...t, status: 'Resolved' } : t);
    setTasks(updatedTasks);

    // Update DB
    await supabase.from('complaints').update({ status: 'Resolved', admin_reply: replyText, resolve_image_url: data.publicUrl }).eq('id', id);
    setResolvingId(null); setReplyText(''); setProofImage(null); setSubmitting(false);
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: '#0056b3'}}>Loading Field Tasks...</div>;

  return (
    <div className="container fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eab308', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#eab308' }}>👷 Field Worker Portal</h2>
          <p style={{ margin: 0, color: '#666' }}>Logged in as: {workerDetails.email}</p>
        </div>
        <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} className="btn-gov" style={{ background: '#dc3545' }}>Logout</button>
      </div>
      
      {tasks.length === 0 ? <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>✅ No pending tasks. Good job!</div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
          {tasks.map(t => (
            <div key={t.id} className="gov-card" style={{ padding: '0', borderLeft: t.status === 'Resolved' ? '5px solid green' : '5px solid orange' }}>
              <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 'bold', color: '#0056b3' }}>{t.category}</span>
                <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: t.status === 'Resolved' ? 'green' : 'orange' }}>{t.status}</span>
              </div>

              <div style={{ padding: '15px' }}>
                <p style={{ fontWeight: 'bold', color: '#333' }}>{t.description}</p>
                {t.image_url && <img src={t.image_url} alt="Issue" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '15px' }} />}
                
                {/* LOCATION CARD */}
                <div style={{ background: '#e9ecef', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '0.9rem' }}>
                  <p style={{ margin: '0 0 5px' }}>📍 {t.location}</p>
                  <button 
                    onClick={() => window.open(`http://maps.google.com/?q=${t.location.replace('Lat: ','').replace('Long: ','')}`, '_blank')} 
                    className="btn-gov" 
                    style={{ width: '100%', background: '#333', fontSize: '0.8rem' }}
                  >
                    🗺️ Open in Google Maps
                  </button>
                </div>

                {/* RESOLVE ACTION */}
                {t.status !== 'Resolved' && (
                  resolvingId === t.id ? (
                    <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #bbf7d0', animation: 'fadeIn 0.3s' }}>
                      <h4 style={{ margin: '0 0 10px', color: '#166534' }}>✅ Complete Job</h4>
                      <textarea placeholder="Describe work done..." value={replyText} onChange={e => setReplyText(e.target.value)} rows="2" style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ccc' }} />
                      <input type="file" onChange={e => setProofImage(e.target.files[0])} style={{ marginBottom: '10px', fontSize: '0.9rem' }} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleResolveSubmit(t.id)} className="btn-gov" style={{ flex: 1, background: '#198754' }}>{submitting ? 'Saving...' : 'Submit Proof'}</button>
                        <button onClick={() => setResolvingId(null)} className="btn-gov" style={{ background: '#6c757d' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setResolvingId(t.id)} className="btn-gov" style={{ width: '100%', background: '#198754' }}>✅ Mark Job Done</button>
                  )
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