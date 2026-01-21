import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile';

const UserDashboard = () => {
  // User & Data States
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [formData, setFormData] = useState({ title: '', desc: '', location: '', category: 'Roads' });
  const [image, setImage] = useState(null);
  
  // Feature States: Search, Filter, Stats
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });

  // Modal States
  const [showProfile, setShowProfile] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null); // For Details View
  const [isEditing, setIsEditing] = useState(false); // For Edit Mode
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  // 1. INITIAL FETCH
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');
      setUser(session.user);
      fetchHistory(session.user.id);
    };
    checkUser();
  }, [navigate]);

  // 2. FETCH HISTORY & CALCULATE STATS
  const fetchHistory = async (id) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('user_id', id)
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    
    const all = data || [];
    setComplaints(all);

    setStats({
      total: all.length,
      pending: all.filter(c => c.status === 'Pending').length,
      inProgress: all.filter(c => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Reviewed').length,
      resolved: all.filter(c => c.status === 'Resolved').length
    });
    setLoading(false);
  };

  // 3. HANDLERS (GPS, Submit, Edit, Reopen)
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

    if (!error) {
      alert("✅ Report Submitted Successfully!");
      setFormData({ title: '', desc: '', location: '', category: 'Roads' });
      setImage(null);
      document.getElementById('fileInput').value = "";
      fetchHistory(user.id);
    }
  };

  // Handle Edit Complaint
  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    const { error } = await supabase
      .from('complaints')
      .update({ 
        title: selectedComplaint.title, 
        description: selectedComplaint.description,
        category: selectedComplaint.category 
      })
      .eq('id', selectedComplaint.id);

    if (!error) {
      alert("Complaint Updated!");
      setIsEditing(false);
      setSelectedComplaint(null);
      fetchHistory(user.id);
    }
  };

  // Handle Reopen Complaint
  const handleReopen = async (id) => {
    if (window.confirm("Are you sure the issue is not resolved? This will reopen the complaint.")) {
      const { error } = await supabase
        .from('complaints')
        .update({ status: 'Pending', admin_note: 'Reopened by user: Issue persists.' })
        .eq('id', id);
      
      if (!error) {
        alert("Complaint Reopened.");
        fetchHistory(user.id);
        if (selectedComplaint) setSelectedComplaint(null);
      }
    }
  };

  // 4. FILTER LOGIC
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getTimelineStep = (status) => {
    switch(status) {
      case 'Pending': return 1;
      case 'Reviewed': return 2;
      case 'Assigned': return 3;
      case 'In Progress': return 4;
      case 'Resolved': return 5;
      default: return 1;
    }
  };

  return (
    <div className="container fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      {/* --- MODALS --- */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      
      {/* DETAILS / EDIT MODAL */}
      {selectedComplaint && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="modal-content fade-in" style={{ background: 'white', padding: '25px', borderRadius: '10px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ margin: 0, color: '#0056b3' }}>
                {isEditing ? '✏️ Edit Complaint' : '📋 Complaint Details'}
              </h2>
              <button onClick={() => { setSelectedComplaint(null); setIsEditing(false); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>✖</button>
            </div>

            {isEditing ? (
              // EDIT MODE FORM
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input value={selectedComplaint.title} onChange={e => setSelectedComplaint({...selectedComplaint, title: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />
                <textarea rows="4" value={selectedComplaint.description} onChange={e => setSelectedComplaint({...selectedComplaint, description: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }} />
                <select value={selectedComplaint.category} onChange={e => setSelectedComplaint({...selectedComplaint, category: e.target.value})} style={{ padding: '10px', border: '1px solid #ccc' }}>
                   <option>Roads & Potholes</option><option>Garbage</option><option>Electricity</option>
                </select>
                <button onClick={handleUpdateComplaint} className="btn-gov">Save Changes</button>
              </div>
            ) : (
              // VIEW MODE
              <div>
                {selectedComplaint.image_url && (
                  <img src={selectedComplaint.image_url} alt="Proof" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
                )}
                
                <h3 style={{ margin: '0 0 5px' }}>{selectedComplaint.title}</h3>
                <span style={{ background: '#e9ecef', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem' }}>{selectedComplaint.category}</span>
                
                <div style={{ marginTop: '15px', padding: '15px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #eee' }}>
                  <strong>Description:</strong>
                  <p style={{ margin: '5px 0 0', color: '#555' }}>{selectedComplaint.description}</p>
                </div>

                <div style={{ marginTop: '15px', display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#666' }}>
                  <div>📍 {selectedComplaint.location || "No GPS Data"}</div>
                  <div>📅 {new Date(selectedComplaint.created_at).toLocaleDateString()}</div>
                </div>

                {/* 5-STAGE TIMELINE */}
                <div style={{ marginTop: '25px', position: 'relative', padding: '0 10px' }}>
                  <h4 style={{ margin: '0 0 15px' }}>Status Timeline</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {/* Line */}
                    <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, height: '3px', background: '#e0e0e0', zIndex: 0 }}></div>
                    {/* Steps */}
                    {['Submitted', 'Reviewed', 'Assigned', 'In Progress', 'Resolved'].map((label, idx) => {
                      const currentStep = getTimelineStep(selectedComplaint.status);
                      const isActive = idx + 1 <= currentStep;
                      return (
                        <div key={label} style={{ zIndex: 1, textAlign: 'center', flex: 1 }}>
                          <div style={{ width: '20px', height: '20px', background: isActive ? '#28a745' : '#ccc', borderRadius: '50%', margin: '0 auto', border: '3px solid white' }}></div>
                          <div style={{ fontSize: '0.7rem', marginTop: '5px', color: isActive ? '#000' : '#999', fontWeight: isActive ? 'bold' : 'normal' }}>{label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* ADMIN NOTE */}
                {selectedComplaint.admin_note && (
                  <div style={{ marginTop: '20px', padding: '10px', background: '#fff3cd', borderLeft: '4px solid #ffc107', fontSize: '0.9rem' }}>
                    <strong>👷 Official Note:</strong> {selectedComplaint.admin_note}
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div style={{ marginTop: '25px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  {selectedComplaint.status === 'Pending' && (
                    <button onClick={() => setIsEditing(true)} style={{ padding: '8px 15px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>✏️ Edit</button>
                  )}
                  {selectedComplaint.status === 'Resolved' && (
                    <button onClick={() => handleReopen(selectedComplaint.id)} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 Reopen</button>
                  )}
                  <button onClick={() => setSelectedComplaint(null)} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 1. HEADER SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px 20px', borderBottom: '3px solid #0056b3', borderRadius: '8px 8px 0 0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.2rem' }}><img src="/images/ts_logo.png" alt="Logo" style={{ width: '50px', height: '50px' }} /></div>
          <div>
            <h2 style={{ margin: 0, color: '#0056b3', textTransform: 'uppercase' }}>Civic Connect</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Citizen Dashboard</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Notification Bell */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            {showNotifications && (
              <div style={{ position: 'absolute', right: 0, top: '40px', background: 'white', border: '1px solid #ddd', width: '250px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '5px', zIndex: 10 }}>
                <div style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>Recent Alerts</div>
                <div style={{ padding: '10px', fontSize: '0.85rem', color: '#555' }}>Your report was reviewed.</div>
                <div style={{ padding: '10px', fontSize: '0.85rem', color: '#555' }}>Main St road work started.</div>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user?.email}</div>
            <div style={{ fontSize: '0.8rem', color: 'green' }}>● Online</div>
          </div>
          
          <button onClick={() => setShowProfile(true)} className="btn-gov" style={{ padding: '8px 12px' }}>👤 Profile</button>
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn-gov" style={{ background: '#dc3545', padding: '8px 12px' }}>Logout</button>
        </div>
      </div>

      {/* --- 2. STATS CARDS --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', margin: '20px 0' }}>
        <div className="gov-card" style={{ textAlign: 'center', background: '#e7f1ff', borderLeft: '4px solid #0d6efd', padding: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0d6efd' }}>{stats.total}</h3>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Total Complaints</span>
        </div>
        <div className="gov-card" style={{ textAlign: 'center', background: '#fff3cd', borderLeft: '4px solid #ffc107', padding: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#856404' }}>{stats.pending}</h3>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Pending</span>
        </div>
        <div className="gov-card" style={{ textAlign: 'center', background: '#d1e7dd', borderLeft: '4px solid #198754', padding: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#0f5132' }}>{stats.inProgress}</h3>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>In Progress</span>
        </div>
        <div className="gov-card" style={{ textAlign: 'center', background: '#e2e3e5', borderLeft: '4px solid #adb5bd', padding: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '1.8rem', color: '#383d41' }}>{stats.resolved}</h3>
          <span style={{ fontSize: '0.85rem', color: '#555' }}>Resolved</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', alignItems: 'start' }}>
        
        {/* --- 3. REPORT FORM (Left) --- */}
        <div className="gov-card" style={{ padding: '25px', position: 'sticky', top: '20px' }}>
          <h3 style={{ margin: '0 0 15px', color: '#0056b3', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>📝 Report New Issue</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Issue Category</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}>
                <option>Roads & Potholes</option><option>Garbage</option><option>Electricity</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Title</label>
              <input placeholder="E.g. Broken streetlight" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Description</label>
              <textarea placeholder="Details..." rows="3" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Location</label>
              <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                <input placeholder="Click GPS button" value={formData.location} readOnly style={{ flex: 1, padding: '5px', background: '#e9ecef', border: '1px solid #ccc', borderRadius: '4px' }} />
                <button type="button" onClick={handleGPS} style={{ flex : 1,padding: '10px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📍</button>
              </div>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Evidence Photo</label>
              <input id="fileInput" type="file" onChange={e => setImage(e.target.files[0])} style={{ marginTop: '5px', width: '100%' }} />
            </div>
            <button type="submit" className="btn-gov" style={{ marginTop: '10px' }}>Submit Complaint</button>
          </form>
        </div>

        {/* --- 4. COMPLAINT LIST & FILTERS (Right) --- */}
        <div>
          {/* 8. Search & Filters */}
          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="🔍 Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 2, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="All">All Status</option><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
              <option value="All">All Categories</option><option>Roads & Potholes</option><option>Garbage</option><option>Electricity</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {loading ? <p style={{ textAlign: 'center' }}>Loading reports...</p> : 
             filteredComplaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', background: '#f8f9fa', borderRadius: '8px', color: '#888' }}>No complaints found.</div>
            ) : (
              filteredComplaints.map(c => (
                <div key={c.id} className="gov-card" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  {/* Thumbnail */}
                  <div style={{ width: '80px', height: '80px', background: '#eee', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                    {c.image_url ? <img src={c.image_url} alt="C" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>📷</div>}
                  </div>
                  
                  {/* Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#0056b3', background: '#e7f1ff', padding: '2px 8px', borderRadius: '4px' }}>{c.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 style={{ margin: '0 0 5px' }}>{c.title}</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{c.description}</p>
                    <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#555' }}>📍 {c.location ? c.location.slice(0, 20) + '...' : 'No Location'}</div>
                  </div>

                  {/* Actions & Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                      background: c.status === 'Resolved' ? '#d1e7dd' : c.status === 'Pending' ? '#fff3cd' : '#cff4fc',
                      color: c.status === 'Resolved' ? '#0f5132' : c.status === 'Pending' ? '#856404' : '#055160'
                    }}>
                      {c.status}
                    </span>
                    <button onClick={() => setSelectedComplaint(c)} className="btn-gov" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View Details</button>
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

export default UserDashboard;