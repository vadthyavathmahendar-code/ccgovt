import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile';

const UserDashboard = () => {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form & UI States
  const [formData, setFormData] = useState({ title: '', desc: '', location: '', category: 'Roads' });
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  // Modal & Notification States
  const [showProfile, setShowProfile] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); 
  
  // 🔥 NOTIFICATION LOGIC
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0); // Tracks unread alerts

  const navigate = useNavigate();

  // --- 1. INITIALIZATION & REAL-TIME LISTENERS ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');
      setUser(session.user);
      
      // Load Data
      fetchHistory(session.user.id);
      fetchBroadcasts(); 
    };
    checkUser();

    // Real-time Subscription
    const sub = supabase.channel('user_dashboard')
      // Listener 1: Status Updates on My Complaints
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'complaints' }, (payload) => {
        handleNewNotification(`🔔 Update: Report #${String(payload.new.id).slice(0,4)} is now ${payload.new.status}`);
        // Refresh list to show new status/image
        supabase.auth.getSession().then(({ data }) => {
            if(data.session) fetchHistory(data.session.user.id);
        });
      })
      // Listener 2: Admin Broadcasts
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'broadcasts' }, (payload) => {
        handleNewNotification(`📢 ADMIN ALERT: ${payload.new.message}`);
      })
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [navigate]);

  // --- 2. DATA FETCHING ---
  const fetchHistory = async (id) => {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });
    
    const all = data || [];
    setComplaints(all);

    // Calculate Stats
    setStats({
      total: all.length,
      pending: all.filter(c => c.status === 'Pending').length,
      inProgress: all.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length,
      resolved: all.filter(c => c.status === 'Resolved').length
    });
    setLoading(false);
  };

  const fetchBroadcasts = async () => {
    // Get last 3 admin broadcasts
    const { data } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(3);
    if(data) {
        const formatted = data.map(b => ({ id: b.id, msg: `📢 ADMIN: ${b.message}`, type: 'broadcast' }));
        setNotifications(prev => [...formatted, ...prev]);
        // We set initial unread count to match these new broadcasts so user sees them
        setUnreadCount(data.length); 
    }
  };

  const handleNewNotification = (msg) => {
    setNotifications(prev => [{ id: Date.now(), msg: msg, type: 'alert' }, ...prev]);
    setUnreadCount(prev => prev + 1); // 🔴 Increment red badge
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
        setUnreadCount(0); // 🔴 Reset red badge when opening
    }
    setShowNotifications(!showNotifications);
  };

  // --- 3. ACTIONS (Submit, Edit, Reopen) ---
  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setFormData({ ...formData, location: `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}` });
      }, () => alert("GPS Access Denied."));
    } else {
      alert("GPS not supported.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    
    let imageUrl = null;
    if (image) {
      const fileName = `${Date.now()}_${image.name.replace(/\s/g, '')}`;
      await supabase.storage.from('complaint_images').upload(fileName, image);
      const { data } = supabase.storage.from('complaint_images').getPublicUrl(fileName);
      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('complaints').insert([{
      user_id: user.id, 
      title: formData.title, 
      description: formData.desc, 
      category: formData.category, 
      location: formData.location, 
      image_url: imageUrl, 
      status: 'Pending'
    }]);

    if (!error) {
      alert("✅ Report Submitted Successfully!");
      setFormData({ title: '', desc: '', location: '', category: 'Roads' });
      setImage(null);
      document.getElementById('fileInput').value = "";
      fetchHistory(user.id);
    } else {
        alert("Error: " + error.message);
    }
    setSubmitting(false);
  };

  const handleReopen = async (id) => {
    if (window.confirm("⚠️ Are you sure the work was NOT done? This will reopen the ticket.")) {
      const { error } = await supabase
        .from('complaints')
        .update({ status: 'Pending', admin_reply: 'REOPENED BY USER: Issue persists.' })
        .eq('id', id);
      
      if (!error) {
        alert("Ticket Reopened.");
        fetchHistory(user.id);
        setSelectedComplaint(null);
      }
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    await supabase.from('complaints').update({ 
        title: selectedComplaint.title, 
        description: selectedComplaint.description,
        category: selectedComplaint.category 
      }).eq('id', selectedComplaint.id);
    alert("Updated!");
    setIsEditing(false);
    setSelectedComplaint(null);
    fetchHistory(user.id);
  };

  // --- 4. RENDER HELPERS ---
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getTimelineStep = (status) => {
    switch(status) {
      case 'Pending': return 1;
      case 'Assigned': return 2;
      case 'In Progress': return 3;
      case 'Resolved': return 4;
      default: return 1;
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      
      {/* --- DETAILS MODAL --- */}
      {selectedComplaint && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content fade-in" style={{ background: 'white', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom:'1px solid #eee', paddingBottom:'10px' }}>
              <h2 style={{ margin: 0, color: '#0056b3' }}>{isEditing ? '✏️ Edit Report' : '📋 Report Details'}</h2>
              <button onClick={() => { setSelectedComplaint(null); setIsEditing(false); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
            </div>

            {isEditing ? (
              // Edit Form
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input value={selectedComplaint.title} onChange={e => setSelectedComplaint({...selectedComplaint, title: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />
                <textarea rows="4" value={selectedComplaint.description} onChange={e => setSelectedComplaint({...selectedComplaint, description: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />
                <select value={selectedComplaint.category} onChange={e => setSelectedComplaint({...selectedComplaint, category: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }}>
                   <option>Roads</option><option>Garbage</option><option>Electricity</option><option>Water</option><option>Traffic</option>
                </select>
                <button onClick={handleUpdateComplaint} className="btn-gov">Save Changes</button>
              </div>
            ) : (
              // View Details
              <div>
                <div style={{display:'flex', gap:'10px', overflowX:'auto', marginBottom:'15px'}}>
                    <div style={{flex:1}}>
                        <div style={{fontSize:'0.7rem', fontWeight:'bold', color:'#666'}}>YOUR PHOTO</div>
                        {selectedComplaint.image_url ? <img src={selectedComplaint.image_url} alt="Before" style={{ width:'100%', height: '150px', borderRadius: '5px', objectFit:'cover', border:'1px solid #ddd' }} /> : <div style={{height:'150px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center'}}>No Image</div>}
                    </div>
                    {selectedComplaint.resolve_image_url && (
                        <div style={{flex:1}}>
                            <div style={{fontSize:'0.7rem', fontWeight:'bold', color:'green'}}>✅ RESOLUTION PROOF</div>
                            <img src={selectedComplaint.resolve_image_url} alt="After" style={{ width:'100%', height: '150px', borderRadius: '5px', objectFit:'cover', border:'2px solid green' }} />
                        </div>
                    )}
                </div>
                
                <h3 style={{ margin: '0 0 5px' }}>{selectedComplaint.title}</h3>
                <span style={{ background: '#e9ecef', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight:'bold', color:'#555' }}>{selectedComplaint.category}</span>
                <p style={{ marginTop: '10px', color: '#555' }}>{selectedComplaint.description}</p>

                <div style={{ marginTop: '25px', position: 'relative', padding: '0 10px' }}>
                  <h4 style={{ margin: '0 0 15px' }}>Progress Tracking</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '3px', background: '#e0e0e0', zIndex: 0 }}></div>
                    {['Submitted', 'Assigned', 'In Progress', 'Resolved'].map((label, idx) => {
                      const isActive = idx + 1 <= getTimelineStep(selectedComplaint.status);
                      return (
                        <div key={label} style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
                          <div style={{ width: '20px', height: '20px', background: isActive ? '#28a745' : '#ccc', borderRadius: '50%', margin: '0 auto', border: '3px solid white' }}></div>
                          <div style={{ fontSize: '0.7rem', marginTop: '5px', color: isActive ? '#000' : '#999', fontWeight: isActive ? 'bold' : 'normal' }}>{label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {selectedComplaint.admin_reply && (
                  <div style={{ marginTop: '20px', padding: '10px', background: '#f0fdf4', borderLeft: '4px solid #198754', fontSize: '0.9rem', borderRadius:'4px' }}>
                    <strong>👷 Field Officer Update:</strong>
                    <div style={{marginTop:'5px'}}>{selectedComplaint.admin_reply}</div>
                  </div>
                )}

                <div style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  {selectedComplaint.status === 'Pending' && <button onClick={() => setIsEditing(true)} style={{ padding: '8px 15px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✏️ Edit</button>}
                  {selectedComplaint.status === 'Resolved' && <button onClick={() => handleReopen(selectedComplaint.id)} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 Issue Not Fixed? Reopen</button>}
                  <button onClick={() => setSelectedComplaint(null)} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- HEADER & NOTIFICATIONS --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px 20px', borderBottom: '3px solid #0056b3', borderRadius: '8px 8px 0 0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.5rem' }}>🏛️</div>
          <div>
            <h2 style={{ margin: 0, color: '#0056b3', textTransform: 'uppercase', fontSize:'1.5rem' }}>Civic Connect</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Citizen Reporting Portal</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* 🔥 BELL ICON WITH COUNT 🔥 */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={toggleNotifications}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            {/* Show badge ONLY if unreadCount > 0 */}
            {unreadCount > 0 && (
                <span style={{
                    position:'absolute', top:-5, right:-5, background:'red', color:'white', 
                    borderRadius:'50%', width:'20px', height:'20px', fontSize:'0.75rem', 
                    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'
                }}>
                    {unreadCount}
                </span>
            )}
            
            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '40px', background: 'white', border: '1px solid #ddd', width: '300px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '5px', zIndex: 10 }}>
                <div style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold', background:'#f8f9fa', display:'flex', justifyContent:'space-between' }}>
                    <span>Notifications</span>
                    <span style={{fontSize:'0.8rem', color:'#666', cursor:'pointer'}} onClick={() => setNotifications([])}>Clear</span>
                </div>
                <div style={{maxHeight:'300px', overflowY:'auto'}}>
                    {notifications.length === 0 ? <div style={{padding:'15px', color:'#999', textAlign:'center'}}>No new alerts.</div> : 
                        notifications.map(n => (
                            <div key={n.id} style={{padding:'10px', fontSize:'0.85rem', borderBottom:'1px solid #eee', background: n.type === 'alert' ? '#fff3cd' : 'white'}}>
                                {n.msg}
                            </div>
                        ))
                    }
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user?.email}</div>
            <div style={{ fontSize: '0.8rem', color: 'green' }}>● Citizen</div>
          </div>
          <button onClick={() => setShowProfile(true)} className="btn-gov" style={{ padding: '8px 12px' }}>Profile</button>
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn-gov" style={{ background: '#dc3545', padding: '8px 12px' }}>Logout</button>
        </div>
      </div>

      {/* --- STATS OVERVIEW --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', margin: '20px 0' }}>
        <StatCard label="Total Reports" value={stats.total} color="#0d6efd" bg="#e7f1ff" />
        <StatCard label="Pending" value={stats.pending} color="#856404" bg="#fff3cd" />
        <StatCard label="In Progress" value={stats.inProgress} color="#0f5132" bg="#d1e7dd" />
        <StatCard label="Resolved" value={stats.resolved} color="#383d41" bg="#e2e3e5" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', alignItems: 'start' }}>
        
        {/* --- REPORT FORM --- */}
        <div className="gov-card" style={{ padding: '25px', position: 'sticky', top: '20px', borderTop:'4px solid #0056b3' }}>
          <h3 style={{ margin: '0 0 15px', color: '#0056b3', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📝 New Report</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}>
                <option>Roads</option><option>Garbage</option><option>Electricity</option><option>Water</option><option>Traffic</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Title</label>
              <input placeholder="Short title..." value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Description</label>
              <textarea placeholder="Describe issue details..." rows="3" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Location</label>
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <input placeholder="Coords will appear here" value={formData.location} readOnly style={{ flex: 1, padding: '5px', background: '#e9ecef', border: '1px solid #ccc', borderRadius: '4px' }} />
                <button type="button" onClick={handleGPS} style={{ flex : 1,padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍 Get GPS</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Photo</label>
              <input id="fileInput" type="file" onChange={e => setImage(e.target.files[0])} style={{ marginTop: '5px', width: '100%' }} />
            </div>
            <button type="submit" className="btn-gov" style={{ marginTop: '10px' }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        </div>

        {/* --- COMPLAINT LIST --- */}
        <div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="🔍 Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="All">All Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {loading ? <p style={{ textAlign: 'center' }}>Loading history...</p> : 
             filteredComplaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', color: '#888' }}>No reports found.</div>
            ) : (
              filteredComplaints.map(c => (
                <div key={c.id} className="gov-card" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', background: '#eee', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    {c.image_url ? <img src={c.image_url} alt="Ev" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>📷</div>}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0056b3', background: '#e7f1ff', padding: '2px 8px', borderRadius: '4px' }}>{c.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 style={{ margin: '0 0 5px' }}>{c.title}</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{c.description}</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                      background: c.status === 'Resolved' ? '#d1e7dd' : c.status === 'Pending' ? '#fff3cd' : '#cff4fc',
                      color: c.status === 'Resolved' ? '#0f5132' : c.status === 'Pending' ? '#856404' : '#055160'
                    }}>
                      {c.status}
                    </span>
                    <button onClick={() => setSelectedComplaint(c)} className="btn-gov" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

const StatCard = ({ label, value, color, bg }) => (
    <div className="gov-card" style={{ textAlign: 'center', background: bg, borderLeft: `4px solid ${color}`, padding: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.8rem', color: color }}>{value}</h3>
        <span style={{ fontSize: '0.85rem', color: '#555' }}>{label}</span>
    </div>
);

export default UserDashboard;