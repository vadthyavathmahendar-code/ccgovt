import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile';

const UserDashboard = () => {
  const [formData, setFormData] = useState({ title: '', desc: '', location: '', category: 'Roads' });
  const [complaints, setComplaints] = useState([]);
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  
  // New States for Stats & Modal
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [showProfile, setShowProfile] = useState(false);

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
    const all = data || [];
    setComplaints(all);
    
    // Calculate Stats
    setStats({
      total: all.length,
      pending: all.filter(c => c.status !== 'Resolved').length,
      resolved: all.filter(c => c.status === 'Resolved').length
    });
  };

  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setFormData({ ...formData, location: `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}` });
      }, () => alert("GPS Access Denied. Please enable location."));
    } else {
      alert("GPS not supported by this browser.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    let imageUrl = null;
    if (image) {
      const fileName = `${Date.now()}_${image.name.replace(/\s/g, '')}`;
      await supabase.storage.from('complaint_images').upload(fileName, image);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('complaints').insert([{
      user_id: user.id, title: formData.title, description: formData.desc, category: formData.category, 
      location: formData.location, image_url: imageUrl, status: 'Pending'
    }]);

    if (error) {
      alert("Error submitting report: " + error.message);
    } else {
      alert("✅ Report Submitted Successfully!");
      setFormData({ title: '', desc: '', location: '', category: 'Roads' });
      setImage(null);
      // Reset file input display hack
      document.getElementById('fileInput').value = "";
      fetchHistory(user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="container fade-in">
      
      {/* MODAL */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* 1. HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', paddingBottom: '15px', borderBottom: '3px solid #0056b3', marginBottom: '0' }}>
        <div>
          <div style={{display: 'flex', alignItems:'center', gap:'10px'}}>
             {/* Emulating Govt Logo with Emoji if image not available */}
             <div style={{fontSize:'2.5rem'}}>🏛️</div> 
             <div>
                <h2 style={{ margin: 0, color: '#0056b3', textTransform:'uppercase', letterSpacing:'1px' }}>Civic Connect</h2>
                <p style={{ margin: 0, color: '#666', fontSize:'0.9rem', fontWeight:'500' }}>Government of Telangana | ప్రజా సేవలు</p>
             </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', alignItems:'center' }}>
          <div style={{marginRight:'10px', fontSize:'0.85rem', color:'#555', fontWeight:'bold', display:{xs:'none', md:'block'}}}>
             Logged in as: <br/> <span style={{color:'#0056b3'}}>{user?.email}</span>
          </div>
          <button onClick={() => setShowProfile(true)} className="btn-gov" style={{ background: '#0056b3', padding:'8px 15px' }}>
            👤 Profile
          </button>
          <button onClick={handleLogout} className="btn-gov" style={{ background: '#dc3545', padding:'8px 15px' }}>
            Logout
          </button>
        </div>
      </div>

      {/* 2. GOVERNMENT TICKER */}
      <div style={{ background: '#fff3cd', color: '#856404', padding: '8px', borderBottom: '1px solid #ffe69c', fontSize: '0.9rem', display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <span style={{ fontWeight: 'bold', marginRight: '10px' }}>📢 ALERTS:</span>
        <marquee scrollamount="8">
          Heavy rains expected in Hyderabad zone. Please report waterlogging immediately. • Dial 100 for Emergencies. • Swachh Bharat Abhiyan needs your support!
        </marquee>
      </div>

      {/* 3. SUMMARY STATS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '30px' }}>
        <div className="gov-card" style={{ padding: '15px', textAlign: 'center', background:'linear-gradient(135deg, #0d6efd 0%, #0043a8 100%)', color:'white', borderRadius:'8px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>TOTAL REPORTS</div>
        </div>
        <div className="gov-card" style={{ padding: '15px', textAlign: 'center', background:'white', borderLeft:'5px solid #ffc107' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color:'#333' }}>{stats.pending}</div>
          <div style={{ fontSize: '0.8rem', color:'#666', fontWeight:'bold' }}>PENDING</div>
        </div>
        <div className="gov-card" style={{ padding: '15px', textAlign: 'center', background:'white', borderLeft:'5px solid #198754' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color:'#333' }}>{stats.resolved}</div>
          <div style={{ fontSize: '0.8rem', color:'#666', fontWeight:'bold' }}>RESOLVED</div>
        </div>
      </div>
      
      {/* 4. MAIN CONTENT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* LEFT: FORM */}
        <div className="gov-card" style={{ padding: '25px', height:'fit-content' }}>
          <h3 style={{ margin: '0 0 20px', background: '#f8f9fa', padding: '10px', borderLeft:'4px solid #0056b3', fontSize: '1.2rem', color:'#333' }}>
            📝 File New Report
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <label style={{fontSize:'0.85rem', fontWeight:'bold', color:'#555'}}>Issue Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width:'100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop:'5px' }}>
                <option>Roads & Potholes</option>
                <option>Garbage </option>
                <option>Electricity / Streetlights</option>
              
              </select>
            </div>

            <div>
              <label style={{fontSize:'0.85rem', fontWeight:'bold', color:'#555'}}>Title</label>
              <input placeholder="E.g. Broken pipe in Main St" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ width:'100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop:'5px' }} />
            </div>
            
            <div>
              <label style={{fontSize:'0.85rem', fontWeight:'bold', color:'#555'}}>Detailed Description</label>
              <textarea placeholder="Describe the issue clearly..." rows="4" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required style={{ width:'100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop:'5px', fontFamily:'inherit' }} />
            </div>
            
            <div>
              <label style={{fontSize:'0.85rem', fontWeight:'bold', color:'#555'}}>Location</label>
              <div style={{ display: 'flex', gap: '10px', marginTop:'5px' }}>
                <input placeholder="Click GPS button →" value={formData.location} readOnly style={{ flex: 1, padding: '10px', border: '1px solid #ccc', background: '#e9ecef', borderRadius: '4px', color:'#555' }} />
                <button type="button" onClick={handleGPS} className="btn-gov" style={{ background: '#333', whiteSpace:'nowrap' }}>📍 Get GPS</button>
              </div>
            </div>
            
            {/* Custom File Input */}
            <div>
              <label style={{fontSize:'0.85rem', fontWeight:'bold', color:'#555'}}>Evidence Photo</label>
              <input id="fileInput" type="file" onChange={e => setImage(e.target.files[0])} style={{ marginTop:'5px', width:'100%', padding:'10px', background:'#f8f9fa', border:'1px dashed #ccc', borderRadius:'4px' }} />
            </div>
            
            <button type="submit" className="btn-gov" style={{ marginTop:'10px', fontSize:'1rem', padding:'12px' }}>Submit Complaint</button>
          </form>
        </div>

        {/* RIGHT: HISTORY TIMELINE */}
        <div>
          <h3 style={{ margin: '0 0 20px', color: '#333', display:'flex', alignItems:'center', gap:'10px' }}>
            <span>📜</span> Your Report History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {complaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', color: '#888', border:'2px dashed #ddd' }}>
                <div style={{fontSize:'2rem', marginBottom:'10px'}}>📭</div>
                No active complaints. <br/> Be a proactive citizen and report issues!
              </div>
            ) : (
              complaints.map(c => {
                // Logic for Timeline Steps
                let step = 1;
                if (c.status === 'In Progress') step = 2;
                if (c.status === 'Resolved') step = 3;

                return (
                  <div key={c.id} className="gov-card" style={{ padding: '20px', borderLeft: 'none', position: 'relative', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
                    
                    {/* STATUS BADGE */}
                    <span style={{ 
                      position: 'absolute', top: '15px', right: '15px',
                      background: c.status === 'Resolved' ? '#d1e7dd' : c.status === 'In Progress' ? '#fff3cd' : '#f8d7da',
                      color: c.status === 'Resolved' ? '#0f5132' : c.status === 'In Progress' ? '#856404' : '#842029',
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform:'uppercase'
                    }}>
                      {c.status}
                    </span>

                    <h4 style={{ margin: '0 0 5px', color: '#0056b3', fontSize: '1.1rem' }}>{c.category}</h4>
                    <p style={{ margin: '0 0 15px', color:'#555', fontSize:'0.95rem' }}>{c.title}</p>

                    {/* TIMELINE VISUALIZATION */}
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', position: 'relative', padding:'0 10px' }}>
                      {/* Grey Line */}
                      <div style={{ position: 'absolute', left: '10px', right: '10px', top: '12px', height: '3px', background: '#e9ecef', zIndex: 0 }}></div>
                      
                      {/* Step 1 */}
                      <div style={{ zIndex: 1, flex: 1, textAlign: 'center' }}>
                        <div style={{ width: '25px', height: '25px', background: step >= 1 ? '#0d6efd' : '#e9ecef', borderRadius: '50%', margin: '0 auto', border:'3px solid white', boxShadow:'0 2px 4px rgba(0,0,0,0.1)' }}></div>
                        <div style={{ fontSize: '0.7rem', marginTop: '5px', color: step >= 1 ? '#333' : '#999', fontWeight:'bold' }}>Sent</div>
                      </div>

                      {/* Step 2 */}
                      <div style={{ zIndex: 1, flex: 1, textAlign: 'center' }}>
                        <div style={{ width: '25px', height: '25px', background: step >= 2 ? '#ffc107' : '#e9ecef', borderRadius: '50%', margin: '0 auto', border:'3px solid white', boxShadow:'0 2px 4px rgba(0,0,0,0.1)' }}></div>
                        <div style={{ fontSize: '0.7rem', marginTop: '5px', color: step >= 2 ? '#333' : '#999', fontWeight:'bold' }}>Process</div>
                      </div>

                      {/* Step 3 */}
                      <div style={{ zIndex: 1, flex: 1, textAlign: 'center' }}>
                        <div style={{ width: '25px', height: '25px', background: step >= 3 ? '#198754' : '#e9ecef', borderRadius: '50%', margin: '0 auto', border:'3px solid white', boxShadow:'0 2px 4px rgba(0,0,0,0.1)' }}></div>
                        <div style={{ fontSize: '0.7rem', marginTop: '5px', color: step >= 3 ? '#333' : '#999', fontWeight:'bold' }}>Done</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: '#666', background: '#f8f9fa', padding: '12px', borderRadius: '6px', border:'1px solid #eee' }}>
                      <div style={{marginBottom:'5px'}}>📅 <strong>Date:</strong> {new Date(c.created_at).toLocaleDateString()}</div>
                      {c.status === 'Resolved' && (
                        <div style={{ color: '#0f5132', marginTop: '5px', paddingTop: '5px', borderTop: '1px dashed #ccc' }}>
                          ✅ <strong>Resolution:</strong> Issue resolved by official.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default UserDashboard;