import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../components/ProfileModal';
import { createPortal } from 'react-dom'; // For the Details Modal

const UserDashboard = () => {
  // --- STATE ---
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form States
  const [formData, setFormData] = useState({ title: '', desc: '', location: '', category: 'Roads' });
  const [isUrgent, setIsUrgent] = useState(false); 
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  
  // Filter & UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  
  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null); 
  
  // Notification Logic
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const navigate = useNavigate();

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');
      setUser(session.user);
      fetchHistory(session.user.id);
      fetchBroadcasts(); 
    };
    checkUser();

    // Real-time Listeners
    const sub = supabase.channel('user_dashboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'complaints' }, (payload) => {
        handleNewNotification(`🔔 Update: Report #${String(payload.new.id).slice(0,4)} is now ${payload.new.status}`);
        supabase.auth.getSession().then(({ data }) => { if(data.session) fetchHistory(data.session.user.id); });
      })
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

    setStats({
      total: all.length,
      pending: all.filter(c => c.status === 'Pending').length,
      inProgress: all.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length,
      resolved: all.filter(c => c.status === 'Resolved').length
    });
    setLoading(false);
  };

  const fetchBroadcasts = async () => {
    const { data } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(3);
    if(data) {
        const formatted = data.map(b => ({ id: b.id, msg: `📢 ADMIN: ${b.message}`, type: 'broadcast' }));
        setNotifications(prev => [...formatted, ...prev]);
        setUnreadCount(data.length); 
    }
  };

  const handleNewNotification = (msg) => {
    setNotifications(prev => [{ id: Date.now(), msg: msg, type: 'alert' }, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  // --- 3. ACTIONS ---
  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setFormData({ ...formData, location: `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}` });
      }, () => alert("GPS Access Denied."));
    } else { alert("GPS not supported."); }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        setImage(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleFileSelect = (e) => {
      if (e.target.files && e.target.files[0]) {
          setImage(e.target.files[0]);
          setPreviewUrl(URL.createObjectURL(e.target.files[0]));
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

    const finalTitle = isUrgent ? `⚠️ [URGENT] ${formData.title}` : formData.title;

    const { error } = await supabase.from('complaints').insert([{
      user_id: user.id, 
      title: finalTitle, 
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
      setPreviewUrl(null);
      setIsUrgent(false);
      fetchHistory(user.id);
    } else {
        alert("Error: " + error.message);
    }
    setSubmitting(false);
  };

  // --- 4. RENDER HELPERS ---
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const CATEGORIES = [
      { id: 'Roads', icon: '🛣️', label: 'Roads' },
      { id: 'Garbage', icon: '🗑️', label: 'Garbage' },
      { id: 'Electricity', icon: '⚡', label: 'Electric' },
  ];

  return (
    <div className="container fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      
      <style>{`
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        .cat-btn:hover { transform: translateY(-3px); box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-color: #2563eb !important; }
        .cat-selected { background: #eff6ff !important; border-color: #2563eb !important; color: #0056b3 !important; }
        .drag-active { background: #f0f9ff !important; border-color: #2563eb !important; }
      `}</style>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      
      {/* DETAILS MODAL */}
      {selectedComplaint && (
        <ComplaintDetailModal 
          complaint={selectedComplaint} 
          onClose={() => setSelectedComplaint(null)} 
        />
      )}

      {/* HEADER */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '2.5rem' }}><img src="/images/cc_logo.png" alt="Civic Connect Logo" style={{ height: '50px', width: 'auto' }} /></div>
          <div>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize:'1.5rem' }}>Civic Connect</h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Citizen Reporting Portal</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }}>
            <span style={{ fontSize: '1.5rem' }}>🔔</span>
            {unreadCount > 0 && <span style={styles.badge}>{unreadCount}</span>}
            {showNotifications && (
              <div style={styles.notifDropdown}>
                <div style={styles.notifHeader}><span>Notifications</span><span onClick={() => setNotifications([])} style={{cursor:'pointer'}}>Clear</span></div>
                <div style={{maxHeight:'300px', overflowY:'auto'}}>
                    {notifications.length === 0 ? <div style={{padding:'15px', textAlign:'center', color:'#999'}}>No new alerts.</div> : notifications.map(n => (
                        <div key={n.id} style={{padding:'10px', fontSize:'0.85rem', borderBottom:'1px solid #eee', background: n.type === 'alert' ? '#fff3cd' : 'white'}}>{n.msg}</div>
                    ))}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setShowProfile(true)} className="btn btn-outline" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>Profile</button>
          <button onClick={async () => { await supabase.auth.signOut(); navigate('/'); }} className="btn btn-primary" style={{ background: '#ef4444', borderColor:'#ef4444' }}>Logout</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', margin: '20px 0' }}>
        <StatCard label="Total Reports" value={stats.total} color="#2563eb" bg="#eff6ff" />
        <StatCard label="Pending" value={stats.pending} color="#d97706" bg="#fffbeb" />
        <StatCard label="In Progress" value={stats.inProgress} color="#059669" bg="#ecfdf5" />
        <StatCard label="Resolved" value={stats.resolved} color="#475569" bg="#f1f5f9" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '25px', alignItems: 'start' }}>
        
        {/* NEW REPORT FORM */}
        <div className="gov-card" style={{ padding: '25px', position: 'sticky', top: '20px', borderTop:'5px solid #2563eb' }}>
          <h3 style={{ margin: '0 0 20px', color: '#0f172a' }}>📝 New Report</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
                <label style={styles.label}>Select Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {CATEGORIES.map(cat => (
                        <div 
                            key={cat.id} 
                            onClick={() => setFormData({...formData, category: cat.id})}
                            className={`cat-btn ${formData.category === cat.id ? 'cat-selected' : ''}`}
                            style={{ 
                                border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', 
                                textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'white'
                            }}
                        >
                            <div style={{ fontSize: '1.5rem' }}>{cat.icon}</div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '600', marginTop: '5px' }}>{cat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
              <label style={styles.label}>What is the issue?</label>
              <input placeholder="e.g. Deep pothole on Main St" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required style={styles.input} />
              <textarea placeholder="Describe the problem..." rows="3" value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} required style={{...styles.input, marginTop:'10px'}} />
            </div>

            <div>
              <label style={styles.label}>Location</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                <input placeholder="Coordinates..." value={formData.location} readOnly style={{...styles.input, background:'#f1f5f9'}} />
                <button type="button" onClick={handleGPS} style={{ padding: '0 15px', background: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📍</button>
              </div>
            </div>

            <div>
                <label style={styles.label}>Evidence Photo</label>
                <div 
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#2563eb'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current.click()}
                    style={{ 
                        border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', 
                        textAlign: 'center', cursor: 'pointer', background: previewUrl ? `url(${previewUrl}) center/cover` : '#f8fafc',
                        height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
                    }}
                >
                    {previewUrl ? 
                        <div style={{background:'rgba(0,0,0,0.5)', color:'white', padding:'5px 10px', borderRadius:'4px'}}>Click to change</div> : 
                        <div style={{color:'#64748b'}}>
                            <span style={{fontSize:'1.5rem'}}>☁️</span><br/>
                            <span style={{fontSize:'0.85rem'}}>Drag photo or Click to upload</span>
                        </div>
                    }
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{display:'none'}} />
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fef2f2', padding: '10px', borderRadius: '6px', border: '1px solid #fecaca' }}>
                <input 
                    type="checkbox" 
                    checked={isUrgent} 
                    onChange={(e) => setIsUrgent(e.target.checked)} 
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }} 
                />
                <div>
                    <span style={{ display: 'block', fontWeight: 'bold', color: '#b91c1c', fontSize: '0.9rem' }}>High Priority / Safety Hazard</span>
                    <span style={{ fontSize: '0.75rem', color: '#991b1b' }}>Mark if this poses immediate danger (e.g. live wire)</span>
                </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting Report...' : 'Submit Report'}
            </button>
          </form>
        </div>

        {/* --- COMPLAINT LIST --- */}
        <div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <input placeholder="🔍 Search reports..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
            
            {/* UPDATED FILTER SELECT */}
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Assigned">Assigned</option> {/* Added Option */}
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {loading ? (
                <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </>
            ) : filteredComplaints.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
                  <div style={{ color: '#64748b' }}>No reports found. Good job keeping the city clean!</div>
              </div>
            ) : (
              filteredComplaints.map(c => (
                <div key={c.id} className="gov-card" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border:'1px solid #e2e8f0' }}>
                    {c.image_url ? <img src={c.image_url} alt="Ev" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background:'#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#2563eb', background: '#eff6ff', padding: '2px 8px', borderRadius: '4px' }}>{c.category}</span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4 style={{ margin: '0 0 5px', color: '#0f172a' }}>{c.title}</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{c.description.substring(0, 60)}...</p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '8px',
                      background: c.status === 'Resolved' ? '#dcfce7' : c.status === 'Pending' ? '#fef3c7' : '#e0f2fe',
                      color: c.status === 'Resolved' ? '#166534' : c.status === 'Pending' ? '#92400e' : '#075985'
                    }}>
                      {c.status}
                    </span>
                    <br/>
                    <button 
                        onClick={() => setSelectedComplaint(c)} 
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        View Details
                    </button>
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

// --- SUB-COMPONENTS ---

const ComplaintDetailModal = ({ complaint, onClose }) => {
    return createPortal(
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={modalStyles.closeBtn}>&times;</button>
                
                <h2 style={{margin:'0 0 10px', color:'#1e293b'}}>{complaint.title}</h2>
                <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                    <span style={{background:'#eff6ff', color:'#2563eb', padding:'4px 10px', borderRadius:'15px', fontSize:'0.8rem', fontWeight:'bold'}}>{complaint.category}</span>
                    <span style={{background: complaint.status==='Resolved'?'#dcfce7':'#fef3c7', color: complaint.status==='Resolved'?'#166534':'#92400e', padding:'4px 10px', borderRadius:'15px', fontSize:'0.8rem', fontWeight:'bold'}}>{complaint.status}</span>
                </div>

                <div style={{marginBottom:'20px'}}>
                    <h4 style={modalStyles.heading}>Description</h4>
                    <p style={{color:'#475569', lineHeight:'1.5'}}>{complaint.description}</p>
                </div>

                {complaint.image_url && (
                    <div style={{marginBottom:'20px'}}>
                        <h4 style={modalStyles.heading}>Attached Evidence</h4>
                        <img src={complaint.image_url} alt="Proof" style={{width:'100%', maxHeight:'250px', objectFit:'cover', borderRadius:'8px', border:'1px solid #e2e8f0'}} />
                    </div>
                )}

                {complaint.status === 'Resolved' && (
                    <div style={{background:'#f0fdf4', padding:'15px', borderRadius:'8px', border:'1px solid #bbf7d0', marginTop:'20px'}}>
                        <h3 style={{margin:'0 0 10px', color:'#15803d', fontSize:'1.1rem'}}>✅ Official Resolution</h3>
                        <p style={{color:'#14532d', marginBottom:'10px'}}><strong>Officer's Note:</strong> {complaint.admin_reply || "Issue resolved."}</p>
                        {complaint.resolve_image_url && (
                            <img src={complaint.resolve_image_url} alt="Resolved" style={{width:'100%', maxHeight:'200px', objectFit:'cover', borderRadius:'6px'}} />
                        )}
                    </div>
                )}

                <div style={{marginTop:'20px', fontSize:'0.85rem', color:'#64748b'}}>
                    📍 Location: {complaint.location || 'N/A'}
                </div>
            </div>
        </div>,
        document.body
    );
};

const SkeletonCard = () => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', display: 'flex', gap: '20px', border: '1px solid #f1f5f9' }}>
        <div className="skeleton" style={{ width: '80px', height: '80px' }}></div>
        <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '30%', height: '15px', marginBottom: '10px' }}></div>
            <div className="skeleton" style={{ width: '60%', height: '20px', marginBottom: '10px' }}></div>
            <div className="skeleton" style={{ width: '90%', height: '15px' }}></div>
        </div>
    </div>
);

const StatCard = ({ label, value, color, bg }) => (
    <div className="gov-card" style={{ textAlign: 'center', background: bg, borderLeft: `4px solid ${color}`, padding: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.8rem', color: color }}>{value}</h3>
        <span style={{ fontSize: '0.85rem', color: '#555' }}>{label}</span>
    </div>
);

// --- STYLES OBJECT ---
const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: '20px' },
    badge: { position:'absolute', top:-5, right:-5, background:'#ef4444', color:'white', borderRadius:'50%', width:'18px', height:'18px', fontSize:'0.7rem', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold' },
    notifDropdown: { position: 'absolute', right: 0, top: '45px', background: 'white', border: '1px solid #e2e8f0', width: '320px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 50 },
    notifHeader: { padding: '12px', borderBottom: '1px solid #f1f5f9', fontWeight: 'bold', background:'#f8fafc', display:'flex', justifyContent:'space-between', fontSize:'0.9rem' },
    label: { display: 'block', marginBottom: '8px', fontWeight: '600', color: '#334155', fontSize: '0.9rem' },
    input: { width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }
};

const modalStyles = {
    overlay: { position:'fixed', top:0, left:0, right:0, bottom:0, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 },
    modal: { background:'white', width:'90%', maxWidth:'600px', borderRadius:'12px', padding:'30px', position:'relative', maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)' },
    closeBtn: { position:'absolute', top:'15px', right:'15px', background:'#f1f5f9', border:'none', borderRadius:'50%', width:'30px', height:'30px', cursor:'pointer', fontSize:'1.2rem', color:'#64748b', display:'flex', alignItems:'center', justifyContent:'center' },
    heading: { margin:'0 0 8px', fontSize:'0.9rem', color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px' }
};

export default UserDashboard;