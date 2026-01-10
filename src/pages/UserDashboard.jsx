import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [formData, setFormData] = useState({ title: '', desc: '', location: '', category: 'Roads' });
  const [complaints, setComplaints] = useState([]);
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');
      setUser(session.user);
      fetchHistory(session.user.id);
    };
    checkUser();
  }, [navigate]);

  const fetchHistory = async (id) => {
    const { data } = await supabase.from('complaints').select('*').eq('user_id', id).order('created_at', { ascending: false });
    setComplaints(data || []);
  };

  const handleGPS = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      setFormData({ ...formData, location: `Lat: ${pos.coords.latitude}, Long: ${pos.coords.longitude}` });
    }, () => alert("GPS Denied"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    let imageUrl = null;
    if (image) {
      const fileName = `${Date.now()}_${image.name}`;
      await supabase.storage.from('complaint_images').upload(fileName, image);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    await supabase.from('complaints').insert([{
      user_id: user.id, title: formData.title, description: formData.desc, category: formData.category, 
      location: formData.location, image_url: imageUrl, status: 'Pending'
    }]);

    alert("Grievance Submitted Successfully!");
    setFormData({ title: '', desc: '', location: '', category: 'Roads' });
    setImage(null); // Clear image input internally (optional improvement)
    fetchHistory(user.id);
  };

  // Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="container fade-in">
      {/* HEADER WITH LOGOUT BUTTON */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #0056b3', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0056b3' }}>Citizen Dashboard</h2>
          <p style={{ margin: 0, color: '#666' }}>Welcome, {user?.email}</p>
        </div>
        <button onClick={handleLogout} className="btn-gov" style={{ background: '#dc3545' }}>Logout</button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
        {/* FORM */}
        <div className="gov-card" style={{ padding: '20px' }}>
          <h3 style={{ margin: '0 0 20px', background: '#f1f1f1', padding: '10px', fontSize: '1.1rem' }}>📝 Lodge a New Complaint</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input placeholder="Issue Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option>Roads</option><option>Garbage</option><option>Electricity</option>
            </select>
            
            <textarea placeholder="Description" rows="3" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input placeholder="Location (GPS)" value={formData.location} readOnly style={{ flex: 1, padding: '10px', border: '1px solid #ccc', background: '#eee', borderRadius: '4px' }} />
              <button type="button" onClick={handleGPS} className="btn-gov" style={{ background: '#333' }}>📍 GPS</button>
            </div>
            
            <input type="file" onChange={e => setImage(e.target.files[0])} style={{ fontSize: '0.9rem' }} />
            
            <button type="submit" className="btn-gov">Submit Complaint</button>
          </form>
        </div>

        {/* HISTORY */}
        <div>
          <h3 style={{ margin: '0 0 20px', color: '#333' }}>📜 Your Complaint History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {complaints.length === 0 ? <p style={{ color: '#666' }}>No complaints filed yet.</p> : complaints.map(c => (
              <div key={c.id} className="gov-card" style={{ padding: '15px', borderLeft: c.status === 'Resolved' ? '5px solid green' : '5px solid orange' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 'bold', color: '#0056b3' }}>{c.category}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: c.status === 'Resolved' ? 'green' : 'orange' }}>{c.status}</span>
                </div>
                <h4 style={{ margin: '5px 0' }}>{c.title}</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{new Date(c.created_at).toLocaleDateString()}</p>
                {c.status === 'Resolved' && <p style={{ color: 'green', fontWeight: 'bold', marginTop: '5px', fontSize: '0.9rem' }}>✅ Resolved by Official</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;