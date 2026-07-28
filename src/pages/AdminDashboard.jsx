import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { logAuditEvent } from '../utils/auditLogger';
import AuditLogsConsole from '../components/AuditLogsConsole';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import ProfileModal from './Profile';

const AdminDashboard = () => {
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme, themeColors } = useTheme();
  
  // --- STATE MANAGEMENT ---
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]); 
  const [logs, setLogs] = useState([]);
  
  // UI States
  const [activeTab, setActiveTab] = useState('overview'); 
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;
  
  // Modals
  const [assigningComplaintId, setAssigningComplaintId] = useState(null); 
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [viewingComplaint, setViewingComplaint] = useState(null); // For Image Viewer

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
    if (!user || !profile) return;

    fetchAllData(profile);
    setLoading(false);

    // Realtime Listener
    const sub = supabase.channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => {
        fetchAllData(profile);
      })
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [user, profile]);

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
      const finalRole = profile?.role === 'dept_admin' ? 'employee' : newUser.role;
      const finalDept = profile?.role === 'dept_admin' ? profile.department : newUser.department;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email, password: newUser.password,
      });
      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert([{
          id: authData.user.id, full_name: newUser.fullName, email: newUser.email, phone: newUser.phone,
          role: finalRole, department: finalDept, govt_id_type: newUser.idType, govt_id_number: newUser.idNumber.toUpperCase(),
          updated_at: new Date().toISOString()
        }], { onConflict: 'id' });
        if (profileError) throw profileError;

        await logAuditEvent({
          userId: profile?.id,
          userRole: profile?.role,
          action: 'user_created',
          entityType: 'profiles',
          entityId: authData.user.id,
          newData: { email: newUser.email, full_name: newUser.fullName, role: finalRole, department: finalDept },
          status: 'success'
        });

        toast.success("User Created Successfully!", { id: toastId });
        setShowAddUserModal(false);
        fetchAllData(profile);
        setNewUser({ email: '', password: '', fullName: '', phone: '', role: 'employee', department: 'Roads', idType: 'badge', idNumber: '' });
      }
    } catch (error) {
      toast.error(error.message, { id: toastId });
    }
  };

  const handleAssignWorker = async (email) => {
    if (!assigningComplaintId) return;
    const oldComplaint = complaints.find(c => c.id === assigningComplaintId);
    const { error } = await supabase.from('complaints').update({ assigned_to: email, status: 'Assigned' }).eq('id', assigningComplaintId);
    if (error) { toast.error(error.message); } 
    else { 
        await logAuditEvent({
          userId: profile?.id,
          userRole: profile?.role,
          action: 'complaint_assigned',
          entityType: 'complaints',
          entityId: assigningComplaintId,
          oldData: oldComplaint ? { assigned_to: oldComplaint.assigned_to, status: oldComplaint.status } : null,
          newData: { assigned_to: email, status: 'Assigned' },
          status: 'success'
        });
        toast.success(`Assigned to ${email}`);
        addLog(`Assigned Report #${String(assigningComplaintId).slice(0,4)} to ${email}`); 
        setAssigningComplaintId(null); 
        fetchAllData(profile);
    }
  };

  const handleReject = async (id) => {
      if(!window.confirm("Are you sure you want to reject this complaint?")) return;
      const oldComplaint = complaints.find(c => c.id === id);
      const { error } = await supabase.from('complaints').update({ status: 'Rejected', assigned_to: null }).eq('id', id);
      if (error) toast.error(error.message);
      else {
          await logAuditEvent({
            userId: profile?.id,
            userRole: profile?.role,
            action: 'complaint_status_changed',
            entityType: 'complaints',
            entityId: id,
            oldData: oldComplaint ? { status: oldComplaint.status, assigned_to: oldComplaint.assigned_to } : null,
            newData: { status: 'Rejected', assigned_to: null },
            status: 'success'
          });
          toast.success("Complaint Rejected");
          fetchAllData(profile);
      }
  };

  const handleBroadcast = async () => {
    if(!broadcastMsg) return;
    await supabase.from('broadcasts').insert([{ message: broadcastMsg }]);
    await logAuditEvent({
      userId: profile?.id,
      userRole: profile?.role,
      action: 'broadcast_created',
      entityType: 'broadcasts',
      newData: { message: broadcastMsg },
      status: 'success'
    });
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
  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: themeColors.background, color: themeColors.primary, fontSize: '1.2rem', fontFamily: 'inherit' }}>🔄 Loading Command Center...</div>;

  const currentBreadcrumb = () => {
    switch (activeTab) {
      case 'overview': return 'Command Center > Operations Dashboard';
      case 'complaints': return 'Command Center > Complaints Queue';
      case 'users': return 'Operations > Staff & Users';
      case 'analytics': return 'Analytics > Operations Performance';
      case 'audit_logs': return 'Security > System Audit Ledger';
      default: return 'Command Center';
    }
  };

  return (
    <div className="fade-in" style={{ display: 'flex', height: '100vh', width: '100vw', background: themeColors.background, color: themeColors.textPrimary, overflow: 'hidden', fontFamily: '"Inter", sans-serif' }}>
      <Toaster />
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}

      {/* --- 2. EVIDENCE IMAGE VIEW MODAL --- */}
      {viewingComplaint && (
          <div style={localStyles.modalOverlay} onClick={() => setViewingComplaint(null)}>
              <div className="gov-card fade-in" style={{ ...localStyles.imageModalContent, background: themeColors.surface, border: `1px solid ${themeColors.border}` }} onClick={e => e.stopPropagation()}>
                  <div style={{ ...localStyles.modalHeader, background: themeColors.surfaceSecondary, borderBottom: `1px solid ${themeColors.border}` }}>
                      <h3 style={{ margin: 0, color: themeColors.textPrimary }}>📷 Evidence Vault - Complaint #{String(viewingComplaint.id).slice(0, 8)}</h3>
                      <button onClick={() => setViewingComplaint(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: themeColors.textSecondary }}>✖</button>
                  </div>
                  <div style={{ display:'flex', gap:'20px', padding:'25px', flexWrap:'wrap', justifyContent:'center' }}>
                      <div>
                          <h4 style={{textAlign:'center', marginTop:0, color: themeColors.textPrimary}}>Before Resolution</h4>
                          {viewingComplaint.image_url ? (
                              <img src={viewingComplaint.image_url} alt="Evidence" style={{width:'250px', height:'250px', objectFit:'cover', borderRadius:'8px', border:`1px solid ${themeColors.border}`}} />
                          ) : (
                              <div style={{width:'250px', height:'250px', display:'flex', alignItems:'center', justifyContent:'center', background: themeColors.surfaceSecondary, borderRadius:'8px', border:`2px dashed ${themeColors.border}`, color: themeColors.textSecondary}}>No image uploaded</div>
                          )}
                      </div>
                      <div>
                          <h4 style={{textAlign:'center', marginTop:0, color: themeColors.textPrimary}}>After Resolution</h4>
                          {viewingComplaint.resolve_image_url ? (
                              <div style={{position:'relative'}}>
                                  <img src={viewingComplaint.resolve_image_url} alt="Resolution" style={{width:'250px', height:'250px', objectFit:'cover', borderRadius:'8px', border:`1px solid ${themeColors.border}`}} />
                              </div>
                          ) : (
                              <div style={{width:'250px', height:'250px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background: themeColors.surfaceSecondary, borderRadius:'8px', border:`2px dashed ${themeColors.border}`, color: themeColors.textSecondary}}>
                                  <span style={{fontSize:'2rem'}}>⏳</span>
                                  <p style={{fontSize:'0.9rem', marginTop:'10px'}}>No proof photo uploaded yet.</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- 3. ASSIGNMENT MODAL --- */}
      {assigningComplaintId && (
          <div style={localStyles.modalOverlay}>
              <div className="gov-card fade-in" style={{ ...localStyles.modalContent, background: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
                  <div style={{ ...localStyles.modalHeader, background: themeColors.surfaceSecondary, borderBottom: `1px solid ${themeColors.border}` }}>
                      <h3 style={{ margin: 0, color: themeColors.textPrimary }}>👤 Assign Task</h3>
                      <button onClick={() => setAssigningComplaintId(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: themeColors.textSecondary }}>✖</button>
                  </div>
                  <div style={{padding:'20px', maxHeight:'400px', overflowY:'auto'}}>
                      {staffList.sort((a,b) => getWorkerLoad(a.email) - getWorkerLoad(b.email)).map(worker => (
                          <div key={worker.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${themeColors.border}` }}>
                              <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                  <div style={{ width: '40px', height: '40px', background: themeColors.surfaceSecondary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: themeColors.primary }}>{worker.full_name ? worker.full_name[0] : 'E'}</div>
                                  <div>
                                      <div style={{fontWeight:'bold', color: themeColors.textPrimary}}>{worker.full_name}</div>
                                      <div style={{fontSize:'0.8rem', color: themeColors.textSecondary}}>{worker.email}</div>
                                  </div>
                              </div>
                              <div style={{textAlign:'right'}}>
                                  <span style={{fontSize:'0.75rem', fontWeight:'bold', color: getWorkerLoad(worker.email) < 3 ? '#16a34a' : '#d97706', marginRight:'10px'}}>
                                      {getWorkerLoad(worker.email)} Tasks
                                  </span>
                                  <button onClick={() => handleAssignWorker(worker.email)} style={{ background: themeColors.primary, color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Select</button>
                              </div>
                          </div>
                      ))}
                      {staffList.length === 0 && <p style={{textAlign:'center', color: themeColors.textSecondary}}>No officers found in this department.</p>}
                  </div>
              </div>
          </div>
      )}

      {/* --- 4. ADD USER MODAL --- */}
      {showAddUserModal && (
          <div style={localStyles.modalOverlay}>
              <div className="gov-card fade-in" style={{ ...localStyles.modalContent, background: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
                  <div style={{ ...localStyles.modalHeader, background: themeColors.surfaceSecondary, borderBottom: `1px solid ${themeColors.border}` }}>
                      <h3 style={{ margin: 0, color: themeColors.textPrimary }}>👥 Add Staff Account</h3>
                      <button onClick={() => setShowAddUserModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: themeColors.textSecondary }}>✖</button>
                  </div>
                  <div style={{padding:'25px'}}>
                      <form onSubmit={handleCreateUser} style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                          <input required placeholder="Full Name" value={newUser.fullName} onChange={e=>setNewUser({...newUser, fullName:e.target.value})} style={{ width:'100%', padding:'10px', borderRadius:'5px', border:`1px solid ${themeColors.border}`, background: themeColors.surface, color: themeColors.textPrimary }} />
                          <input required type="email" placeholder="Email" value={newUser.email} onChange={e=>setNewUser({...newUser, email:e.target.value})} style={{ width:'100%', padding:'10px', borderRadius:'5px', border:`1px solid ${themeColors.border}`, background: themeColors.surface, color: themeColors.textPrimary }} />
                          <input required type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} style={{ width:'100%', padding:'10px', borderRadius:'5px', border:`1px solid ${themeColors.border}`, background: themeColors.surface, color: themeColors.textPrimary }} />
                          <input required placeholder="Phone" value={newUser.phone} onChange={e=>setNewUser({...newUser, phone:e.target.value})} style={{ width:'100%', padding:'10px', borderRadius:'5px', border:`1px solid ${themeColors.border}`, background: themeColors.surface, color: themeColors.textPrimary }} />
                          
                          <div>
                            <label style={{ fontSize: '0.8rem', color: themeColors.textSecondary, display: 'block', marginBottom: '5px' }}>Gov ID Type & Number</label>
                            <div style={{ display: 'flex', gap: '5px' }}>
                              <select value={newUser.idType} onChange={e=>setNewUser({...newUser, idType:e.target.value})} style={{ padding:'10px', borderRadius:'5px', border:`1px solid ${themeColors.border}`, background: themeColors.surface, color: themeColors.textPrimary }}>
                                <option value="badge">Badge</option>
                                <option value="govt_id">Govt ID</option>
                              </select>
                              <input required placeholder="ID Number" value={newUser.idNumber} onChange={e=>setNewUser({...newUser, idNumber:e.target.value})} style={{ flex: 1, padding:'10px', borderRadius:'5px', border:`1px solid ${themeColors.border}`, background: themeColors.surface, color: themeColors.textPrimary }} />
                            </div>
                          </div>

                          {profile?.role === 'super_admin' && (
                              <div style={{display:'flex', gap:'10px'}}>
                                  <select value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})} style={{ flex: 1, padding:'10px', borderRadius:'5px', border:`1px solid ${themeColors.border}`, background: themeColors.surface, color: themeColors.textPrimary }}>
                                      <option value="employee">Field Officer</option>
                                      <option value="dept_admin">Dept Head</option>
                                  </select>
                                  <select value={newUser.department} onChange={e=>setNewUser({...newUser, department:e.target.value})} style={{ flex: 1, padding:'10px', borderRadius:'5px', border:`1px solid ${themeColors.border}`, background: themeColors.surface, color: themeColors.textPrimary }}>
                                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                      <option value="All">All (Super Only)</option>
                                  </select>
                              </div>
                          )}
                          <button type="submit" style={{ padding: '10px 20px', background: themeColors.primary, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', width:'100%' }}>Create Account</button>
                      </form>
                  </div>
              </div>
          </div>
      )}

      {/* --- 5. REDESIGNED COLLAPSIBLE SIDEBAR --- */}
      <aside style={{
        width: isMobile ? (mobileMenuOpen ? '260px' : '0px') : (sidebarCollapsed ? '80px' : '260px'),
        background: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        borderRight: '1px solid #1e293b',
        position: isMobile ? 'fixed' : 'relative',
        height: '100vh',
        zIndex: 1010
      }}>
        {/* Sidebar Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start' }}>
            <div style={{ fontSize: '1.75rem' }}>🏛️</div>
            {(!sidebarCollapsed || isMobile) && (
              <div>
                <h2 style={{ margin: 0, fontSize:'1.1rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>CIVIC ADMIN</h2>
                <span style={{ fontSize: '0.65rem', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block', marginTop: '2px' }}>
                  {profile?.role?.replace('_', ' ')}
                </span>
              </div>
            )}
        </div>

        {/* Sidebar Selector switcher */}
        {(!sidebarCollapsed || isMobile) && (
          <div style={{ padding: '15px 20px' }}>
            <label style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', display: 'block', marginBottom: '5px' }}>Operational Suite</label>
            <select style={{ width: '100%', background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '6px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
              <option>🛡️ Command Control</option>
              <option>⏱️ SLA Monitor Mode</option>
              <option>🤖 Executive Analytics</option>
            </select>
          </div>
        )}

        {/* Sidebar Nav links */}
        <nav style={{ flex: 1, padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <NavBtn active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); if (isMobile) setMobileMenuOpen(false); }} icon="📊" label="Dashboard" collapsed={sidebarCollapsed && !isMobile} />
          <NavBtn active={activeTab === 'complaints'} onClick={() => { setActiveTab('complaints'); if (isMobile) setMobileMenuOpen(false); }} icon="🚨" label="Complaints" collapsed={sidebarCollapsed && !isMobile} />
          {profile?.role !== 'commissioner' && (
            <NavBtn active={activeTab === 'users'} onClick={() => { setActiveTab('users'); if (isMobile) setMobileMenuOpen(false); }} icon="👥" label="Staff & Users" collapsed={sidebarCollapsed && !isMobile} />
          )}
          <NavBtn active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); if (isMobile) setMobileMenuOpen(false); }} icon="📈" label="Analytics" collapsed={sidebarCollapsed && !isMobile} />
          {profile?.role !== 'commissioner' && (
            <NavBtn active={activeTab === 'audit_logs'} onClick={() => { setActiveTab('audit_logs'); if (isMobile) setMobileMenuOpen(false); }} icon="📋" label="Audit Logs" collapsed={sidebarCollapsed && !isMobile} />
          )}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '15px 10px', borderTop: '1px solid #1e293b', background: '#090d16', display:'flex', flexDirection:'column', gap:'8px' }}>
            <button onClick={() => setShowProfileModal(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start', gap: '10px', width: '100%', padding: '10px', background: '#1e293b', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'500' }}>
              <span>👤</span> {(!sidebarCollapsed || isMobile) && 'My Profile'}
            </button>
            <button onClick={() => { logout(); navigate('/'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start', gap: '10px', width: '100%', padding: '10px', background: '#b91c1c', border: 'none', color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'500' }}>
              <span>🚪</span> {(!sidebarCollapsed || isMobile) && 'Logout'}
            </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobile && mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1005 }}></div>
      )}

      {/* --- 6. MAIN CONTENT AREA --- */}
      <main style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '15px' : '30px', position: 'relative', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Dynamic Header Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: themeColors.surface, padding: '15px 20px', borderRadius: '12px', border: `1px solid ${themeColors.border}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => isMobile ? setMobileMenuOpen(!mobileMenuOpen) : setSidebarCollapsed(!sidebarCollapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: themeColors.textPrimary }}>
              ☰
            </button>
            <div>
              <span style={{ fontSize: '0.75rem', color: themeColors.textSecondary, fontWeight: 'bold' }}>{currentBreadcrumb()}</span>
              <h2 style={{ margin: 0, fontSize: '1.15rem', color: themeColors.textPrimary }}>Telangana Municipal Operations Command</h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
            {/* Theme Toggle in Admin */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: `1px solid ${themeColors.border}`,
                borderRadius: '20px',
                padding: '4px 12px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                color: themeColors.textPrimary,
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
            </button>

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', color: themeColors.primary, background: themeColors.surfaceSecondary, padding: '4px 10px', borderRadius: '20px' }}>
              👤 {profile?.full_name?.split(' ')[0] || 'Admin'}
            </span>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <StatCard title="Total Reports" value={complaints.length} color="#3b82f6" icon="📂" />
              <StatCard title="Pending Queue" value={complaints.filter(c=>c.status==='Pending').length} color="#ef4444" icon="⚡" />
              <StatCard title="Resolved Issues" value={complaints.filter(c=>c.status==='Resolved').length} color="#10b981" icon="✅" />
              <StatCard title="Escalation Risk" value={complaints.filter(c=>c.is_urgent && c.status==='Pending').length} color="#f59e0b" icon="⚠️" />
            </div>

            {/* AI operations widget */}
            <div style={{ padding: '20px', borderRadius: '12px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <h3 style={{ margin: '0 0 8px', color: '#fbcfe8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🤖</span> Gemini Executive Operations Summary
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                Operational triage shows active infrastructure loads are stable. <strong>Roads & Traffic</strong> represent {complaints.length > 0 ? Math.round((complaints.filter(c=>c.category==='Roads').length / complaints.length)*100) : 0}% of complaints. 
                SLA compliance averages <strong>98%</strong> across Hyderabad sectors. 
                Action alert: <strong>{complaints.filter(c=>c.is_urgent && c.status==='Pending').length} high-priority risks</strong> are currently pending field officer assignment.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '20px' }}>
              <div style={{ background: themeColors.surface, padding: '20px', borderRadius: '12px', border: `1px solid ${themeColors.border}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                <h3 style={{ margin: '0 0 15px', color: themeColors.textPrimary }}>📋 Operational Incident Feed</h3>
                <div style={{ height: '250px', overflowY: 'auto', background: themeColors.surfaceSecondary, padding: '12px', borderRadius: '8px', border: `1px solid ${themeColors.border}` }}>
                    {logs.map((log,i) => (
                      <div key={i} style={{ fontSize: '0.85rem', padding: '8px 0', borderBottom: `1px dashed ${themeColors.border}`, color: themeColors.textPrimary }}>
                        <strong>{log.user}:</strong> {log.action}
                      </div>
                    ))}
                    {logs.length === 0 && <p style={{ textAlign: 'center', color: themeColors.textSecondary, padding: '20px' }}>No recent activities logged.</p>}
                </div>
              </div>

              <div style={{ background: themeColors.surface, padding: '20px', borderRadius: '12px', border: `1px solid ${themeColors.border}`, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                <h3 style={{ margin: '0 0 15px', color: themeColors.textPrimary }}>📢 Broadcast Alert Strip</h3>
                <textarea 
                  value={broadcastMsg} 
                  onChange={e=>setBroadcastMsg(e.target.value)} 
                  placeholder="Type an announcement to broadcast to all citizens..." 
                  style={{ width:'100%', padding:'10px', marginBottom:'15px', borderRadius:'8px', border:`1px solid ${themeColors.border}`, background: themeColors.background, color: themeColors.textPrimary, height: '100px', resize: 'none' }}
                />
                <button onClick={handleBroadcast} style={{ width: '100%', padding: '10px', background: themeColors.primary, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Send City Broadcast
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPLAINTS MANAGEMENT */}
        {activeTab === 'complaints' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%' }}>
                <input 
                  placeholder="🔍 Search tickets by description..." 
                  value={searchTerm} 
                  onChange={e => setSearchTerm(e.target.value)} 
                  style={{ padding: '10px 15px', border: `1px solid ${themeColors.border}`, borderRadius: '8px', background: themeColors.surface, color: themeColors.textPrimary, flex: 1, minWidth: '200px' }} 
                />
                <select 
                  value={statusFilter} 
                  onChange={e => setFilterStatus(e.target.value)} 
                  style={{ padding: '10px', border: `1px solid ${themeColors.border}`, borderRadius: '8px', background: themeColors.surface, color: themeColors.textPrimary, minWidth: '150px' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {filteredComplaints.map(c => (
                <div key={c.id} style={{ display: 'flex', flexDirection: 'column', background: themeColors.surface, borderRadius: '12px', border: c.is_urgent ? '2px solid #ef4444' : `1px solid ${themeColors.border}`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
                  
                  {/* Complaint Item Top Strip */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: themeColors.surfaceSecondary, padding: '12px 20px', borderBottom: `1px solid ${themeColors.border}`, flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: themeColors.textPrimary }}>Ticket #{String(c.id).slice(0, 8)}</span>
                      {c.is_urgent && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 'bold' }}>🚨 URGENT</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={statusBadgeStyle(c.status)}>{c.status}</span>
                      <span style={{ fontSize: '0.75rem', background: '#3b82f6', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{c.category}</span>
                    </div>
                  </div>

                  {/* Complaint Item Body */}
                  <div style={{ padding: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '250px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: themeColors.textPrimary }}>{c.title}</h4>
                      <p style={{ margin: '0 0 15px 0', fontSize: '0.9rem', color: themeColors.textSecondary }}>{c.description}</p>
                      
                      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.8rem', color: themeColors.textSecondary }}>
                        <span onClick={() => openMap(c.latitude, c.longitude)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>📍 {c.location || 'Municipal Zone'}</span>
                        {c.servicenow_ticket_number && <span style={{ color: '#2563eb', fontWeight: 'bold' }}>🎫 ServiceNow: {c.servicenow_ticket_number}</span>}
                      </div>
                    </div>

                    {/* Complaint Actions Panel */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center', minWidth: '150px' }}>
                      <button onClick={() => setViewingComplaint(c)} style={{ padding: '8px 12px', background: themeColors.surfaceSecondary, color: themeColors.textPrimary, border: `1px solid ${themeColors.border}`, borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
                        📷 Preview Evidence
                      </button>

                      {c.status === 'Pending' && (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button onClick={() => setAssigningComplaintId(c.id)} style={{ flex: 1, padding: '8px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Dispatch
                          </button>
                          <button onClick={() => handleReject(c.id)} style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            Reject
                          </button>
                        </div>
                      )}

                      {c.status !== 'Pending' && (
                        <div style={{ fontSize: '0.8rem', color: themeColors.textSecondary, background: themeColors.surfaceSecondary, padding: '8px', borderRadius: '6px', border: `1px solid ${themeColors.border}` }}>
                          👤 Assigned: <strong style={{ color: themeColors.textPrimary }}>{c.assigned_to || 'None'}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredComplaints.length === 0 && (
                <div style={{ textAlign: 'center', padding: '50px', background: themeColors.surface, borderRadius: '12px', border: `1px dashed ${themeColors.border}` }}>
                  <span style={{ fontSize: '2.5rem' }}>🍃</span>
                  <p style={{ color: themeColors.textSecondary, margin: '10px 0 0 0' }}>No incidents matched your query.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: STAFF & USER ACCOUNTS */}
        {activeTab === 'users' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: 0, color: themeColors.textPrimary }}>👥 Municipal Staff Directory</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: themeColors.textSecondary }}>Manage personnel, assign tasks, and monitor workloads.</p>
              </div>
              <button onClick={() => setShowAddUserModal(true)} style={{ padding: '10px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                ➕ Invite Staff Member
              </button>
            </div>

            <div style={{ background: themeColors.surface, borderRadius: '12px', border: `1px solid ${themeColors.border}`, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: themeColors.surfaceSecondary, borderBottom: `1px solid ${themeColors.border}` }}>
                      <th style={{ padding: '12px 20px', color: themeColors.textPrimary, fontSize: '0.85rem', textAlign: 'left' }}>Staff Member</th>
                      <th style={{ padding: '12px 20px', color: themeColors.textPrimary, fontSize: '0.85rem', textAlign: 'left' }}>Role Badge</th>
                      <th style={{ padding: '12px 20px', color: themeColors.textPrimary, fontSize: '0.85rem', textAlign: 'left' }}>Department</th>
                      <th style={{ padding: '12px 20px', color: themeColors.textPrimary, fontSize: '0.85rem', textAlign: 'left' }}>Active Workload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u=>u.role !== 'citizen').map(u => (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${themeColors.border}` }}>
                        <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: themeColors.textPrimary }}>
                          <strong>{u.full_name}</strong>
                          <div style={{ fontSize: '0.75rem', color: themeColors.textSecondary }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '15px 20px' }}>
                          <span style={roleBadgeStyle(u.role)}>{u.role === 'dept_admin' ? 'HEAD' : 'OFFICER'}</span>
                        </td>
                        <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: themeColors.textPrimary }}>{u.department}</td>
                        <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: themeColors.textPrimary }}>
                          {u.role === 'employee' ? (
                            <span style={{ fontWeight: 'bold', color: getWorkerLoad(u.email) > 3 ? '#ef4444' : themeColors.textPrimary }}>
                              {getWorkerLoad(u.email)} Active Tasks
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADVANCED PREMIUM ANALYTICS (SVG CHARTS) */}
        {activeTab === 'analytics' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ margin: 0, color: themeColors.textPrimary }}>📈 Enterprise Performance Analytics</h3>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
              
              {/* Chart 1: Complaint Volume Trend (SVG Area Chart) */}
              <div style={{ background: themeColors.surface, padding: '20px', borderRadius: '12px', border: `1px solid ${themeColors.border}` }}>
                <h4 style={{ margin: '0 0 15px', color: themeColors.textPrimary }}>📂 Weekly Incident Volume Trend</h4>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <svg width="100%" height="200" viewBox="0 0 500 200" preserveAspectRatio="none" style={{ background: themeColors.surfaceSecondary, borderRadius: '8px' }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line x1="50" y1="50" x2="450" y2="50" stroke={themeColors.border} strokeDasharray="5,5" />
                    <line x1="50" y1="100" x2="450" y2="100" stroke={themeColors.border} strokeDasharray="5,5" />
                    <line x1="50" y1="150" x2="450" y2="150" stroke={themeColors.border} strokeDasharray="5,5" />
                    {/* Area path */}
                    <path d="M 50 170 Q 130 110 200 130 T 350 70 T 450 60 L 450 170 L 50 170 Z" fill="url(#areaGrad)" />
                    {/* Line path */}
                    <path d="M 50 170 Q 130 110 200 130 T 350 70 T 450 60" fill="none" stroke="#3b82f6" strokeWidth="3" />
                    {/* Data Points */}
                    <circle cx="50" cy="170" r="4" fill="#3b82f6" />
                    <circle cx="130" cy="115" r="4" fill="#3b82f6" />
                    <circle cx="200" cy="130" r="4" fill="#3b82f6" />
                    <circle cx="350" cy="70" r="4" fill="#3b82f6" />
                    <circle cx="450" cy="60" r="4" fill="#3b82f6" />
                    {/* Labels */}
                    <text x="50" y="190" fill={themeColors.textSecondary} fontSize="10" textAnchor="middle">Mon</text>
                    <text x="130" y="190" fill={themeColors.textSecondary} fontSize="10" textAnchor="middle">Wed</text>
                    <text x="200" y="190" fill={themeColors.textSecondary} fontSize="10" textAnchor="middle">Thu</text>
                    <text x="350" y="190" fill={themeColors.textSecondary} fontSize="10" textAnchor="middle">Sat</text>
                    <text x="450" y="190" fill={themeColors.textSecondary} fontSize="10" textAnchor="middle">Sun</text>
                  </svg>
                </div>
              </div>

              {/* Chart 2: Category distribution (SVG Donut Chart) */}
              <div style={{ background: themeColors.surface, padding: '20px', borderRadius: '12px', border: `1px solid ${themeColors.border}` }}>
                <h4 style={{ margin: '0 0 15px', color: themeColors.textPrimary }}>📊 Category Breakdown</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
                  <svg width="150" height="150" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke={themeColors.border} strokeWidth="10" />
                    {/* 45% Roads */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="125 251" strokeDashoffset="0" />
                    {/* 30% Water */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="80 251" strokeDashoffset="-125" />
                    {/* 25% Electricity */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="46 251" strokeDashoffset="-205" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColors.textPrimary }}><span style={{ display:'block', width:'12px', height:'12px', background:'#3b82f6', borderRadius:'3px' }}></span> Roads & Potholes (45%)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColors.textPrimary }}><span style={{ display:'block', width:'12px', height:'12px', background:'#10b981', borderRadius:'3px' }}></span> Water Leakage (30%)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColors.textPrimary }}><span style={{ display:'block', width:'12px', height:'12px', background:'#f59e0b', borderRadius:'3px' }}></span> Electricity & Grid (25%)</div>
                  </div>
                </div>
              </div>

              {/* Chart 3: Backlog Zone Density Heat Map */}
              <div style={{ background: themeColors.surface, padding: '20px', borderRadius: '12px', border: `1px solid ${themeColors.border}`, gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                <h4 style={{ margin: '0 0 15px', color: themeColors.textPrimary }}>🗺️ Municipal Backlog Heat Map (By Operational Zones)</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.9)', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <strong>Zone 1 (Secunderabad)</strong><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>42 Open</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.65)', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <strong>Zone 2 (Khairatabad)</strong><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>28 Open</div>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.8)', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <strong>Zone 3 (Serilingampally)</strong><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>19 Open</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.8)', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <strong>Zone 4 (Charminar)</strong><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>6 Open</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.9)', color: '#fff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                    <strong>Zone 5 (Kukatpally)</strong><div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>2 Open</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM AUDIT LOGS LEDGER */}
        {activeTab === 'audit_logs' && (
          <div className="fade-in">
             <h2 style={{ margin: '0 0 20px', color: themeColors.textPrimary, fontSize: '1.5rem' }}>Security Audit Logs Ledger</h2>
             <AuditLogsConsole />
          </div>
        )}
      </main>
    </div>
  );
};

// --- SUB-COMPONENTS WITH THEME SUPPORT ---
const NavBtn = ({ active, onClick, icon, label, collapsed }) => {
  return (
    <button onClick={onClick} style={{
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px', 
      padding: '12px 15px',
      background: active ? 'rgba(255, 255, 255, 0.15)' : 'transparent', 
      color: active ? '#fff' : '#94a3b8',
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      fontSize: '0.95rem', 
      width: '100%', 
      textAlign: 'left',
      justifyContent: collapsed ? 'center' : 'flex-start',
      transition: 'all 0.2s ease',
      fontWeight: active ? '600' : 'normal',
    }}>
      <span style={{ fontSize: '1.25rem' }}>{icon}</span> 
      {!collapsed && <span>{label}</span>}
    </button>
  );
};

const StatCard = ({ title, value, color, icon }) => {
  const { themeColors } = useTheme();
  return (
    <div style={{ 
      background: themeColors.surface, 
      padding: '20px', 
      borderRadius: '12px', 
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      borderLeft: `5px solid ${color}`,
      border: `1px solid ${themeColors.border}`,
      transition: 'transform 0.2s',
    }}>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: themeColors.textPrimary }}>{value}</div>
        <div style={{ color: themeColors.textSecondary, fontSize: '0.85rem', marginTop: '4px', fontWeight: '500' }}>{title}</div>
      </div>
      <div style={{ fontSize: '2rem', opacity: 0.8 }}>{icon}</div>
    </div>
  );
};

// --- STYLES OBJECT ---
const localStyles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '20px' },
  modalContent: { width: '450px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', overflow:'hidden' },
  imageModalContent: { width: '600px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', overflow:'hidden' },
  modalHeader: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  workerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' },
  
  profileCard: { width:'400px', borderRadius:'16px', overflow:'hidden', boxShadow:'0 15px 35px rgba(0,0,0,0.25)', position:'relative' },
  profileAvatarContainer: { position:'absolute', top:'50px', left:'50%', transform:'translateX(-50%)', padding:'4px', borderRadius:'50%' },
  profileAvatar: { width:'90px', height:'90px', borderRadius:'50%', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'2rem', fontWeight:'bold' },
  profileBody: { padding:'60px 25px 25px', textAlign:'center' },
  profileGrid: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginTop:'20px', textAlign:'left' },
  closeProfileBtn: { width:'100%', padding:'12px', border:'none', borderRadius:'8px', marginTop:'25px', cursor:'pointer', fontWeight:'bold' }
};

const statusBadgeStyle = (status) => {
  const isResolved = status === 'Resolved';
  const isRejected = status === 'Rejected';
  return {
    padding: '4px 10px', 
    borderRadius: '12px', 
    fontSize: '0.7rem', 
    fontWeight: 'bold', 
    background: isResolved ? '#d1e7dd' : isRejected ? '#f8d7da' : '#fff3cd', 
    color: isResolved ? '#0f5132' : isRejected ? '#842029' : '#664d03'
  };
};

const roleBadgeStyle = (role) => {
  const isSuper = role === 'super_admin' || role === 'dept_admin';
  return {
    padding: '4px 10px', 
    borderRadius: '12px', 
    background: isSuper ? '#ffd700' : '#17a2b8', 
    color: isSuper ? '#000' : '#fff', 
    fontSize: '0.7rem', 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    display: 'inline-block'
  };
};

export default AdminDashboard;