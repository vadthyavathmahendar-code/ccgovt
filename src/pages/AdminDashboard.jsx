import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal'; // <--- 1. IMPORT MODAL

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  
  const [showProfile, setShowProfile] = useState(false); // <--- 2. MODAL STATE

  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return navigate('/'); }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') return navigate('/');

      setAdminEmail(session.user.email);
      fetchData(); 
      setLoading(false);
    };

    checkUser();

    // Real-time listener
    const subscription = supabase
      .channel('admin_complaints')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        fetchData();
      })
      .subscribe();

    return () => { supabase.removeChannel(subscription); };
  }, [navigate]);

  const fetchData = async () => {
    const { data } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    const all = data || [];
    setComplaints(all);
    setFilteredComplaints(all);
    calculateStats(all);
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      pending: data.filter(c => c.status !== 'Resolved').length,
      resolved: data.filter(c => c.status === 'Resolved').length
    });
  };

  useEffect(() => {
    let result = complaints;
    if (filterStatus !== 'All') result = result.filter(c => c.status === filterStatus);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => c.title?.toLowerCase().includes(lower) || c.category?.toLowerCase().includes(lower));
    }
    setFilteredComplaints(result);
  }, [searchTerm, filterStatus, complaints]);

  const handleAssign = async (id, email) => {
    if(!email) return alert('Enter worker email');
    
    // Optimistic Update
    const updatedList = complaints.map(c => 
      c.id === id ? { ...c, assigned_to: email, status: 'In Progress' } : c
    );
    setComplaints(updatedList);
    setFilteredComplaints(updatedList);
    
    await supabase.from('complaints').update({ assigned_to: email, status: 'In Progress' }).eq('id', id);
    alert(`✅ Task assigned to ${email}`);
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this report?")) return;
    
    const updatedList = complaints.filter(c => c.id !== id);
    setComplaints(updatedList);
    setFilteredComplaints(updatedList);
    
    await supabase.from('complaints').delete().eq('id', id);
  };

  const openMaps = (locationStr) => {
    if (!locationStr) return;
    // Clean string "Lat: 17.123, Long: 78.123" -> "17.123,78.123"
    const coordinates = locationStr.replace('Lat: ', '').replace('Long: ', '').replace(', ', ',');
    // Fixed URL syntax
    window.open(`https://www.google.com/maps?q=${coordinates}`, '_blank');
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px', color: '#0056b3'}}>Loading...</div>;

  return (
    <div className="container fade-in">
      
      {/* 3. RENDER MODAL */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #0056b3', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0056b3' }}>Admin Dashboard</h2>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {adminEmail}</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* 4. BUTTON OPENS MODAL */}
          <button onClick={() => setShowProfile(true)} className="btn-gov" style={{ background: '#0056b3' }}>
            👤 My Profile
          </button>

          <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} className="btn-gov" style={{ background: '#dc3545' }}>
            Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div className="gov-card" style={{ padding: '20px', borderLeft: '5px solid #0056b3' }}>
          <h4 style={{ margin: 0, color: '#666' }}>TOTAL REPORTS</h4>
          <span style={{ fontSize: '2rem', fontWeight: '800', color: '#0056b3' }}>{stats.total}</span>
        </div>
        <div className="gov-card" style={{ padding: '20px', borderLeft: '5px solid #eab308' }}>
          <h4 style={{ margin: 0, color: '#666' }}>PENDING</h4>
          <span style={{ fontSize: '2rem', fontWeight: '800', color: '#eab308' }}>{stats.pending}</span>
        </div>
        <div className="gov-card" style={{ padding: '20px', borderLeft: '5px solid #198754' }}>
          <h4 style={{ margin: 0, color: '#666' }}>RESOLVED</h4>
          <span style={{ fontSize: '2rem', fontWeight: '800', color: '#198754' }}>{stats.resolved}</span>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <input type="text" placeholder="🔍 Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: '150px', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <option>All</option><option>Pending</option><option>In Progress</option><option>Resolved</option>
        </select>
      </div>

      {/* LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
        {filteredComplaints.length === 0 ? <p style={{gridColumn:'1/-1', textAlign:'center', color:'#999'}}>No reports found.</p> : filteredComplaints.map(c => (
          <div key={c.id} className="gov-card" style={{ padding: '0' }}>
            <div style={{ padding: '15px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 'bold', color: '#0056b3' }}>{c.category}</span>
              <span style={{ fontWeight: 'bold', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', background: c.status === 'Resolved' ? '#d1e7dd' : '#fff3cd', color: c.status === 'Resolved' ? '#0f5132' : '#664d03' }}>
                {c.status}
              </span>
            </div>
            <div style={{ padding: '15px' }}>
              {c.image_url && <img src={c.image_url} alt="Proof" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />}
              <h4 style={{ margin: '0 0 5px' }}>{c.title}</h4>
              <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>{c.description}</p>
              
              <div style={{ marginBottom: '15px', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 'bold' }}>📍 Location:</span> <br/>
                <button onClick={() => openMaps(c.location)} style={{ background: 'none', border: 'none', color: '#0056b3', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                  {c.location} (Open Map)
                </button>
              </div>

              <div style={{ background: '#f1f1f1', padding: '10px', borderRadius: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#555' }}>{c.assigned_to ? '👤 Worker Assigned:' : '⚠️ Assign Task To:'}</label>
                <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                  <input id={`assign-${c.id}`} placeholder="worker@gov.in" defaultValue={c.assigned_to || ''} style={{ flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                  <button onClick={() => handleAssign(c.id, document.getElementById(`assign-${c.id}`).value)} className="btn-gov" style={{ padding: '5px 10px', fontSize: '0.8rem', background: c.assigned_to ? '#6c757d' : '#0056b3' }}>
                    {c.assigned_to ? 'Update' : 'Set'}
                  </button>
                </div>
              </div>
              <button onClick={() => handleDelete(c.id)} style={{ width: '100%', marginTop: '15px', color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>Delete Report</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;