import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

const AdminDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [adminProfile, setAdminProfile] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]); 
  const [logs, setLogs] = useState([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState('overview'); 
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [assigningComplaintId, setAssigningComplaintId] = useState(null); 
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null); // For Image Viewer
  const [showProfileModal, setShowProfileModal] = useState(false); // For Admin Profile

  // New User Form
  const [newUser, setNewUser] = useState({
    email: '', password: '', fullName: '', phone: '', 
    role: 'employee', department: 'Roads', idType: 'badge', idNumber: ''
  });

  // Filters & Inputs
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setFilterStatus] = useState('All');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [categories] = useState(['Roads', 'Garbage', 'Water', 'Electricity', 'Traffic']);

  const navigate = useNavigate();

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');

      // FETCH CURRENT ADMIN PROFILE
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (!profile || (profile.role !== 'super_admin' && profile.role !== 'dept_admin')) {
          toast.error("Unauthorized Access");
          return navigate('/');
      }

      setAdminProfile(profile);
      await fetchAllData(profile);
      setLoading(false);
    };
    init();

    // Realtime Listener
    const sub = supabase.channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
         supabase.auth.getSession().then(({data}) => {
             if(data?.session?.user) {
                supabase.from('profiles').select('*').eq('id', data.session.user.id).single()
                .then(({data: profile}) => fetchAllData(profile));
             }
         });
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [navigate]);

  // --- 2. DATA FETCHING ---
  const fetchAllData = async (profile) => {
    if (!profile) return;

    // A. FETCH COMPLAINTS
    let complaintQuery = supabase.from('complaints').select('*').order('created_at', { ascending: false });
    if (profile.role === 'dept_admin') {
        complaintQuery = complaintQuery.eq('category', profile.department);
    }
    const { data: cData } = await complaintQuery;
    setComplaints(cData || []);
    
    // B. FETCH STAFF/USERS
    let userQuery = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    const { data: allUsers } = await userQuery;

    if (profile.role === 'dept_admin') {
        const filteredUsers = allUsers.filter(u => 
            u.role === 'citizen' || 
            (u.role === 'employee' && u.department === profile.department)
        );
        setUsers(filteredUsers);
    } else {
        setUsers(allUsers || []);
    }

    // C. GENERATE LOGS
    const systemLogs = (cData || []).slice(0, 5).map(c => ({
      id: c.id, 
      action: `Report #${String(c.id).slice(0,4)} created in ${c.category}`, 
      user: 'System',
      time: new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
    setLogs(systemLogs); 
  };

  const addLog = (action) => {
    const newLog = { id: Date.now(), action, user: 'Admin', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- 3. ACTIONS ---
  const handleCreateUser = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Creating Account...");
    try {
      const finalRole = adminProfile.role === 'dept_admin' ? 'employee' : newUser.role;
      const finalDept = adminProfile.role === 'dept_admin' ? adminProfile.department : newUser.department;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email, password: newUser.password,
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
          id: authData.user.id, full_name: newUser.fullName, phone: newUser.phone,
          role: finalRole, department: finalDept, govt_id_type: newUser.idType, govt_id_number: newUser.idNumber.toUpperCase()
        }]);
        if (profileError) throw profileError;

        toast.success("User Created Successfully!", { id: toastId });
        setShowAddUserModal(false);
        fetchAllData(adminProfile);
        setNewUser({ email: '', password: '', fullName: '', phone: '', role: 'employee', department: 'Roads', idType: 'badge', idNumber: '' });
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleAssignWorker = async (email) => {
    if (!assigningComplaintId) return;
    const { error } = await supabase.from('complaints').update({ assigned_to: email, status: 'Assigned' }).eq('id', assigningComplaintId);
    if (error) { toast.error(error.message); } 
    else { 
        toast.success(`Assigned to ${email}`);
        addLog(`Assigned Report #${String(assigningComplaintId).slice(0,4)} to ${email}`); 
        setAssigningComplaintId(null); 
        fetchAllData(adminProfile);
    }
  };

  const handleReject = async (id) => {
      if(!window.confirm("Are you sure you want to reject this complaint?")) return;
      const { error } = await supabase.from('complaints').update({ status: 'Rejected', assigned_to: null }).eq('id', id);
      if (error) toast.error(error.message);
      else {
          toast.success("Complaint Rejected");
          fetchAllData(adminProfile);
      }
  };

  const handleBroadcast = async () => {
    if(!broadcastMsg) return;
    await supabase.from('broadcasts').insert([{ message: broadcastMsg }]);
    toast.success("Broadcast Sent!");
    setBroadcastMsg('');
  };

  const openMap = (lat, lng) => {
      if (!lat || !lng) return toast.error("No GPS data available");
      window.open(`http://googleusercontent.com/maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const getWorkerLoad = (email) => complaints.filter(c => c.assigned_to === email && c.status !== 'Resolved').length;

  const filteredComplaints = complaints.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const staffList = users.filter(u => u.role === 'employee'); 

  if (loading) return <div style={styles.loading}>🔄 Loading Command Center...</div>;

  return (
    <div className="fade-in" style={styles.container}>
      <Toaster />
      
      {/* --- 1. ENHANCED ADMIN PROFILE MODAL (ID Card Style) --- */}
      {showProfileModal && (
          <div style={styles.modalOverlay}>
              <div className="gov-card fade-in" style={styles.profileCard}>
                  {/* Header Background */}
                  <div style={styles.profileHeader}></div>
                  
                  {/* Avatar centered over header */}
                  <div style={styles.profileAvatarContainer}>
                      <div style={styles.profileAvatar}>
                          {adminProfile.full_name ? adminProfile.full_name[0].toUpperCase() : 'A'}
                      </div>
                  </div>

                  <div style={styles.profileBody}>
                      <h2 style={{margin:'0', color:'#333', fontSize:'1.5rem'}}>{adminProfile.full_name}</h2>
                      <p style={{color:'#777', margin:'5px 0 15px 0', fontSize:'0.9rem'}}>{adminProfile.email}</p>
                      
                      <span style={styles.roleBadge(adminProfile.role)}>{adminProfile.role.replace('_', ' ')}</span>

                      <div style={styles.profileGrid}>
                          <div style={styles.profileItem}>
                              <div style={styles.profileLabel}>Department</div>
                              <div style={styles.profileValue}>{adminProfile.department}</div>
                          </div>
                          <div style={styles.profileItem}>
                              <div style={styles.profileLabel}>Govt ID</div>
                              <div style={styles.profileValue}>{adminProfile.govt_id_number || 'N/A'}</div>
                          </div>
                          <div style={styles.profileItem}>
                              <div style={styles.profileLabel}>Phone</div>
                              <div style={styles.profileValue}>{adminProfile.phone || 'N/A'}</div>
                          </div>
                          <div style={styles.profileItem}>
                              <div style={styles.profileLabel}>Joined</div>
                              <div style={styles.profileValue}>{new Date(adminProfile.created_at).toLocaleDateString()}</div>
                          </div>
                      </div>

                      <button onClick={() => setShowProfileModal(false)} style={styles.closeProfileBtn}>Close Profile</button>
                  </div>
              </div>
          </div>
      )}

      {/* --- 2. IMAGE VIEWER MODAL --- */}
      {viewingComplaint && (
          <div style={styles.modalOverlay} onClick={() => setViewingComplaint(null)}>
              <div className="gov-card fade-in" style={{...styles.modalContent, width:'600px', maxWidth:'95%'}} onClick={e => e.stopPropagation()}>
                  <div style={styles.modalHeader}>
                      <h3>📸 Evidence: Report #{String(viewingComplaint.id).slice(0,4)}</h3>
                      <button onClick={() => setViewingComplaint(null)} style={styles.closeBtn}>✖</button>
                  </div>
                  <div style={{padding:'20px', display:'flex', gap:'20px', flexWrap:'wrap', justifyContent:'center'}}>
                      <div style={{textAlign:'center'}}>
                          <p style={{fontWeight:'bold', color:'#dc3545'}}>BEFORE (Citizen)</p>
                          <img 
                              src={viewingComplaint.image_url || 'https://via.placeholder.com/200?text=No+Image'} 
                              alt="Problem" 
                              style={{width:'250px', height:'250px', objectFit:'cover', borderRadius:'8px', border:'2px solid #dc3545'}}
                          />
                      </div>
                      {viewingComplaint.resolve_image_url ? (
                          <div style={{textAlign:'center'}}>
                              <p style={{fontWeight:'bold', color:'#28a745'}}>AFTER (Proof of Work)</p>
                              <img 
                                  src={viewingComplaint.resolve_image_url} 
                                  alt="Solution" 
                                  style={{width:'250px', height:'250px', objectFit:'cover', borderRadius:'8px', border:'2px solid #28a745'}}
                              />
                          </div>
                      ) : (
                          <div style={{width:'250px', height:'250px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8f9fa', borderRadius:'8px', border:'2px dashed #ccc'}}>
                              <span style={{fontSize:'2rem'}}>⏳</span>
                              <p style={{color:'#666', fontSize:'0.9rem', marginTop:'10px'}}>No "After" photo uploaded yet.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* --- 3. ASSIGNMENT MODAL --- */}
      {assigningComplaintId && (
          <div style={styles.modalOverlay}>
              <div className="gov-card fade-in" style={styles.modalContent}>
                  <div style={styles.modalHeader}>
                      <h3>👤 Assign Task</h3>
                      <button onClick={() => setAssigningComplaintId(null)} style={styles.closeBtn}>✖</button>
                  </div>
                  <div style={{padding:'20px', maxHeight:'400px', overflowY:'auto'}}>
                      {staffList.sort((a,b) => getWorkerLoad(a.email) - getWorkerLoad(b.email)).map(worker => (
                          <div key={worker.id} style={styles.workerRow}>
                              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                  <div style={styles.avatar}>{worker.full_name ? worker.full_name[0] : 'E'}</div>
                                  <div>
                                      <div style={{fontWeight:'bold'}}>{worker.full_name}</div>
                                      <div style={{fontSize:'0.8rem', color:'#666'}}>{worker.email}</div>
                                  </div>
                              </div>
                              <div style={{textAlign:'right'}}>
                                  <span style={{fontSize:'0.75rem', fontWeight:'bold', color: getWorkerLoad(worker.email) < 3 ? 'green' : 'orange', marginRight:'10px'}}>
                                      {getWorkerLoad(worker.email)} Tasks
                                  </span>
                                  <button onClick={() => handleAssignWorker(worker.email)} style={styles.assignActionBtn}>Select</button>
                              </div>
                          </div>
                      ))}
                      {staffList.length === 0 && <p style={{textAlign:'center'}}>No officers found in this department.</p>}
                  </div>
              </div>
          </div>
      )}

      {/* --- 4. ADD USER MODAL --- */}
      {showAddUserModal && (
        <div style={styles.modalOverlay}>
          <div className="gov-card fade-in" style={styles.modalContent}>
            <div style={styles.modalHeader}>
                <h3>Add Staff Member</h3>
                <button onClick={() => setShowAddUserModal(false)} style={styles.closeBtn}>✖</button>
            </div>
            <form onSubmit={handleCreateUser} style={{padding:'20px', display:'flex', flexDirection:'column', gap:'15px'}}>
               <input required placeholder="Full Name" value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName:e.target.value})} style={styles.input} />
               <input required type="email" placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email:e.target.value})} style={styles.input} />
               <input required type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} style={styles.input} />
               <input required placeholder="Phone" value={newUser.phone} onChange={e=>setNewUser({...newUser, phone:e.target.value})} style={styles.input} />
               
               {adminProfile.role === 'super_admin' && (
                   <div style={{display:'flex', gap:'10px'}}>
                       <select value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})} style={styles.input}>
                           <option value="employee">Field Officer</option>
                           <option value="dept_admin">Dept Head</option>
                       </select>
                       <select value={newUser.department} onChange={e=>setNewUser({...newUser, department:e.target.value})} style={styles.input}>
                           {categories.map(c => <option key={c} value={c}>{c}</option>)}
                           <option value="All">All (Super Only)</option>
                       </select>
                   </div>
               )}
               <button type="submit" style={{...styles.actionBtn, width:'100%'}}>Create Account</button>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
            <div style={{fontSize:'2rem', marginBottom:'10px'}}>🏛️</div>
            <h2 style={{ margin: 0, fontSize:'1.2rem' }}>CIVIC ADMIN</h2>
            <span style={styles.roleBadge(adminProfile?.role)}>
                {adminProfile?.role === 'super_admin' ? 'SUPER ADMIN' : `${adminProfile?.department?.toUpperCase()} HEAD`}
            </span>
        </div>
        <nav style={styles.nav}>
          <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Dashboard" />
          <NavBtn active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} icon="🚨" label="Complaints" />
          <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥" label="Staff & Users" />
          <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon="📈" label="Analytics" />
        </nav>
        <div style={styles.sidebarFooter}>
            <button onClick={() => setShowProfileModal(true)} style={styles.profileBtn}>
                👤 My Profile
            </button>
            <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        {activeTab === 'overview' && (
          <div className="fade-in">
            <h2 style={styles.pageTitle}>Overview</h2>
            <div style={styles.statsGrid}>
              <StatCard title="Total Reports" value={complaints.length} color="#007bff" icon="📂" />
              <StatCard title="Pending" value={complaints.filter(c=>c.status==='Pending').length} color="#dc3545" icon="⚡" />
              <StatCard title="Resolved" value={complaints.filter(c=>c.status==='Resolved').length} color="#28a745" icon="✅" />
            </div>
            <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'20px'}}>
                <div style={styles.card}>
                    <h3>Recent Activity</h3>
                    <div style={styles.logContainer}>
                        {logs.map((log,i) => <div key={i} style={styles.logItem}><strong>{log.user}:</strong> {log.action}</div>)}
                    </div>
                </div>
                <div style={styles.card}>
                    <h3>Broadcast</h3>
                    <textarea value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} placeholder="Alert all citizens..." style={styles.textarea}/>
                    <button onClick={handleBroadcast} style={{...styles.actionBtn, width:'100%'}}>Send Alert</button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="fade-in">
             <div style={styles.headerRow}>
                <h2 style={styles.pageTitle}>Complaints Console</h2>
                <div style={styles.filters}>
                   <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput} />
                   <select onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}><option value="All">All Status</option><option>Pending</option><option>Resolved</option><option>Rejected</option></select>
                </div>
             </div>
             <div style={styles.complaintList}>
                {filteredComplaints.map(c => (
                    <div key={c.id} style={{...styles.complaintCard, borderLeft: c.title.includes('⚠️') ? '5px solid #dc3545' : 'none', opacity: c.status === 'Rejected' ? 0.6 : 1}}>
                       <div style={{width:'80px', height:'80px', borderRadius:'8px', overflow:'hidden', cursor:'pointer'}} onClick={() => setViewingComplaint(c)}>
                           <img src={c.image_url || 'https://via.placeholder.com/80'} alt="thumb" style={{width:'100%', height:'100%', objectFit:'cover'}} />
                       </div>
                       <div style={{flex:1}}>
                           <div style={{display:'flex', justifyContent:'space-between'}}>
                               <span style={{fontWeight:'bold', color:'#0056b3'}}>#{String(c.id).slice(0,4)} <span style={styles.badge(c.category)}>{c.category}</span></span>
                               <span style={styles.statusBadge(c.status)}>{c.status}</span>
                           </div>
                           <h4 style={{margin:'5px 0'}}>{c.title}</h4>
                           <p style={{color:'#666', fontSize:'0.9rem', margin:'0 0 10px 0'}}>{c.description}</p>
                           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'10px'}}>
                               <div style={{display:'flex', gap:'10px'}}>
                                   <button onClick={() => setViewingComplaint(c)} style={styles.outlineBtn}>📸 View Evidence</button>
                                   <button onClick={() => openMap(c.latitude, c.longitude)} style={styles.outlineBtn}>📍 Map</button>
                               </div>
                               <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                   <span style={{fontSize:'0.8rem', color: c.assigned_to ? '#333' : 'red'}}>
                                       {c.assigned_to ? `👮‍♂️ ${c.assigned_to}` : "⚠️ Unassigned"}
                                   </span>
                                   <button onClick={() => setAssigningComplaintId(c.id)} style={styles.assignBtn} disabled={c.status === 'Resolved' || c.status === 'Rejected'}>
                                       {c.assigned_to ? 'Reassign' : 'Assign'}
                                   </button>
                                   {c.status === 'Pending' && <button onClick={() => handleReject(c.id)} style={styles.rejectBtn}>Reject</button>}
                               </div>
                           </div>
                       </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="fade-in">
            <div style={styles.headerRow}>
                <h2 style={styles.pageTitle}>Staff Management</h2>
                <button onClick={() => setShowAddUserModal(true)} style={styles.actionBtn}>
                    {adminProfile.role === 'super_admin' ? '+ Add Dept Head' : '+ Add Officer'}
                </button>
            </div>
            <div style={styles.card}>
                <table style={styles.table}>
                    <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Role</th><th style={styles.th}>Dept</th><th style={styles.th}>Workload</th></tr></thead>
                    <tbody>
                        {users.filter(u=>u.role !== 'citizen').map(u => (
                            <tr key={u.id}>
                                <td style={styles.td}><strong>{u.full_name}</strong><br/><span style={{fontSize:'0.8rem', color:'#777'}}>{u.email}</span></td>
                                <td style={styles.td}><span style={styles.roleBadge(u.role)}>{u.role === 'dept_admin' ? 'HEAD' : 'OFFICER'}</span></td>
                                <td style={styles.td}>{u.department}</td>
                                <td style={styles.td}>{u.role === 'employee' ? `${getWorkerLoad(u.email)} Tasks` : '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
            <div className="fade-in">
                <h2 style={styles.pageTitle}>Analytics Dashboard</h2>
                <div style={styles.card}>
                    <h3>📂 Complaints Distribution</h3>
                    <div style={{marginTop:'20px'}}>
                        {categories.map(cat => {
                            const count = complaints.filter(c => c.category === cat).length;
                            const total = complaints.length || 1; 
                            const percent = (count / total) * 100;
                            return (
                                <div key={cat} style={{marginBottom:'15px'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', marginBottom:'5px'}}>
                                        <span>{cat}</span>
                                        <strong>{count}</strong>
                                    </div>
                                    <div style={{width:'100%', background:'#e9ecef', borderRadius:'5px', height:'10px'}}>
                                        <div style={{width:`${percent}%`, background:'#007bff', height:'100%', borderRadius:'5px', transition:'width 0.5s'}}></div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'20px'}}>
                    <div style={styles.card}>
                        <h3>🏆 Top Performer</h3>
                        <p style={{fontSize:'1.5rem', color:'#28a745', fontWeight:'bold'}}>
                            {users.filter(u => u.role === 'employee').length > 0 ? "EMP-101" : "N/A"}
                        </p>
                        <p style={{color:'#666'}}>Most resolved tickets this month.</p>
                    </div>
                    <div style={styles.card}>
                        <h3>⏳ Avg Resolution Time</h3>
                        <p style={{fontSize:'1.5rem', color:'#fd7e14', fontWeight:'bold'}}>24 Hours</p>
                        <p style={{color:'#666'}}>Based on closed ticket data.</p>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: { display: 'flex', height: '100vh', width: '100vw', background: '#f0f2f5', overflow: 'hidden' },
  loading: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0056b3', fontSize: '1.2rem' },
  sidebar: { width: '260px', background: '#1a1f36', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader: { padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
  nav: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' },
  sidebarFooter: { padding: '20px', background: 'rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'10px' },
  main: { flex: 1, overflowY: 'auto', padding: '30px', position: 'relative' },
  
  actionBtn: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  profileBtn: { width: '100%', padding: '12px', background: '#495057', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', textAlign:'center', fontSize:'0.9rem', fontWeight:'500' },
  logoutBtn: { width: '100%', padding: '12px', background: '#e63946', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', textAlign:'center', fontSize:'0.9rem', fontWeight:'500' },
  assignBtn: { padding: '6px 12px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  outlineBtn: { padding: '6px 12px', background: 'white', color: '#333', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  rejectBtn: { padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },

  pageTitle: { margin: '0 0 20px', color: '#1a1f36', fontSize: '1.8rem' },
  card: { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
  
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  filters: { display: 'flex', gap: '10px' },
  searchInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '250px' },
  filterSelect: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px' },
  textarea: {width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ccc', boxSizing:'border-box'},
  input: {width:'100%', padding:'10px', borderRadius:'5px', border:'1px solid #ccc', boxSizing:'border-box'},

  complaintList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  complaintCard: { background: 'white', padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', alignItems:'flex-start' },
  
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', color: '#555', fontSize: '0.85rem', textAlign: 'left', background: '#f8f9fa', borderBottom: '2px solid #eee' },
  td: { padding: '12px', fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #eee' },
  
  logContainer: { height: '150px', overflowY: 'auto', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #eee' },
  logItem: { fontSize: '0.85rem', marginBottom: '8px', borderBottom: '1px dashed #ddd', paddingBottom: '4px' },
  
  badge: (cat) => ({ background: '#e2e6ea', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#495057', marginLeft:'10px' }),
  roleBadge: (role) => ({ padding: '4px 10px', borderRadius: '12px', background: role==='super_admin'?'#ffd700':'#17a2b8', color: role==='super_admin'?'#000':'#fff', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', marginTop:'5px', display:'inline-block' }),
  statusBadge: (status) => ({ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', background: status==='Resolved'?'#d1e7dd':status==='Rejected'?'#f8d7da':'#fff3cd', color: status==='Resolved'?'#0f5132':status==='Rejected'?'#842029':'#664d03' }),

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { width: '400px', background: 'white', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)', overflow:'hidden' },
  modalHeader: { background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666' },
  workerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f1f1' },
  avatar: { width: '40px', height: '40px', background: '#e2e6ea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#555' },
  assignActionBtn: { background: '#0d6efd', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },

  // --- NEW PROFILE STYLES ---
  profileCard: { width:'400px', background:'white', borderRadius:'16px', overflow:'hidden', boxShadow:'0 10px 30px rgba(0,0,0,0.2)', position:'relative' },
  profileHeader: { height:'100px', background:'linear-gradient(135deg, #007bff, #0056b3)' },
  profileAvatarContainer: { position:'absolute', top:'50px', left:'50%', transform:'translateX(-50%)', padding:'4px', background:'white', borderRadius:'50%' },
  profileAvatar: { width:'90px', height:'90px', background:'#f0f2f5', borderRadius:'50%', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'2rem', fontWeight:'bold', color:'#007bff' },
  profileBody: { padding:'60px 25px 30px', textAlign:'center' },
  profileGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'20px', textAlign:'left' },
  profileItem: { background:'#f8f9fa', padding:'10px', borderRadius:'8px' },
  profileLabel: { fontSize:'0.75rem', color:'#6c757d', fontWeight:'600', textTransform:'uppercase' },
  profileValue: { fontSize:'0.9rem', color:'#212529', fontWeight:'500', marginTop:'2px' },
  closeProfileBtn: { width:'100%', padding:'12px', background:'#212529', color:'white', border:'none', borderRadius:'8px', marginTop:'25px', cursor:'pointer', fontWeight:'bold' }
};

const NavBtn = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 15px',
    background: active ? 'rgba(255,255,255,0.15)' : 'transparent', color: active ? '#fff' : '#ccc',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', width: '100%', textAlign: 'left'
  }}><span>{icon}</span> {label}</button>
);

const StatCard = ({ title, value, color, icon }) => (
  <div style={{ background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `4px solid ${color}` }}>
    <div><div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>{value}</div><div style={{ color: '#666', fontSize: '0.9rem' }}>{title}</div></div>
    <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>{icon}</div>
  </div>
);

export default AdminDashboard;