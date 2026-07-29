import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { logAuditEvent } from '../utils/auditLogger';
import AuditLogsConsole from '../components/AuditLogsConsole';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import ProfileModal from './Profile';
import CommandCenterMap from '../components/CommandCenterMap';
import ReportCenter from '../components/ReportCenter';
import SystemHealth from '../components/SystemHealth';

// --- ANIMATION HELPER: COUNT UP EFFECT ---
const AnimatedCounter = ({ value, duration = 1 }) => {
  const [count, setCount] = useState(() => {
    const end = parseInt(value, 10);
    return isNaN(end) ? value : 0;
  });

  useEffect(() => {
    const end = parseInt(value, 10);
    if (isNaN(end) || end === 0) {
      return;
    }
    let start = 0;
    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 15);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) {
        clearInterval(timer);
        setCount(value);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

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


  // New User Form
  const [newUser, setNewUser] = useState({
    email: '', password: '', fullName: '', phone: '', 
    role: 'employee', department: 'Roads', idType: 'badge', idNumber: ''
  });

  // Filters & Inputs
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setFilterStatus] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [employeeSearch, setEmployeeSearch] = useState('');
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
      user: c.assigned_to || 'Citizen Ingestion'
    }));
    setLogs(systemLogs);
  };

  const addLog = (actionMsg) => {
    const newLog = { id: Date.now(), action: actionMsg, user: profile?.email || 'System' };
    setLogs(prev => [newLog, ...prev.slice(0, 4)]);
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
      window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  const getWorkerLoad = (email) => complaints.filter(c => c.assigned_to === email && c.status !== 'Resolved' && c.status !== 'Closed').length;

  // --- EXECUTIVE ANALYTICS COMPILATIONS ---
  const totalCount = complaints.length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical').length;
  const reopenedCount = complaints.filter(c => c.status === 'Reopened').length;
  const activeCount = complaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress' || c.status === 'Reopened').length;
  
  const resolverRanking = {};
  complaints.forEach(c => {
    if ((c.status === 'Resolved' || c.status === 'Closed') && c.assigned_to) {
      resolverRanking[c.assigned_to] = (resolverRanking[c.assigned_to] || 0) + 1;
    }
  });
  
  const topResolversList = Object.keys(resolverRanking)
    .sort((a,b) => resolverRanking[b] - resolverRanking[a])
    .slice(0, 3)
    .map(email => ({ email, count: resolverRanking[email] }));

  // Filter complaints dynamically (Search & Smart Filters)
  const filteredComplaints = complaints.filter(c => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !searchTerm || 
      c.id.toString().toLowerCase().includes(term) ||
      (c.title || '').toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term) ||
      (c.location || '').toLowerCase().includes(term) ||
      (c.assigned_to || '').toLowerCase().includes(term);

    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchCategory = categoryFilter === 'All' || c.category === categoryFilter;
    const matchEmployee = !employeeSearch || (c.assigned_to || '').toLowerCase().includes(employeeSearch.toLowerCase());

    return matchSearch && matchStatus && matchPriority && matchCategory && matchEmployee;
  });

  const currentBreadcrumb = () => {
    if (activeTab === 'overview') return 'Operational Dashboard';
    if (activeTab === 'complaints') return 'Incident Operations Ledger';
    if (activeTab === 'users') return 'Municipal Roster Directory';
    if (activeTab === 'analytics') return 'Executive Business Intelligence';
    if (activeTab === 'map') return 'Command Center GIS Map';
    if (activeTab === 'reports') return 'Performance Reports Center';
    if (activeTab === 'system_health') return 'Infrastructure Health & Telemetry';
    return 'Audit Trail Logs';
  };

  if (loading) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', background: themeColors.background, overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      <Toaster position="top-right" />

      {/* --- SIDEBAR --- */}
      <aside style={{ 
        width: sidebarCollapsed && !isMobile ? '80px' : '260px', 
        background: '#0b0f19', 
        borderRight: '1px solid #1e293b', 
        display: isMobile && !mobileMenuOpen ? 'none' : 'flex', 
        flexDirection: 'column', 
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        bottom: 0,
        left: 0,
        zIndex: 1010,
        transition: 'width 0.2s ease',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/images/cc_logo.png" alt="Logo" style={{ width: '40px', height: '30px' }} />
          {(!sidebarCollapsed || isMobile) && (
            <div>
              <h1 style={{ color: '#fff', fontSize: '0.9rem', margin: 0, fontWeight: '800', tracking: '0.5px' }}>CIVICS CONNECT</h1>
              <span style={{ color: '#3b82f6', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Command Center</span>
            </div>
          )}
        </div>

        {/* Sidebar Nav links */}
        <nav style={{ flex: 1, padding: '15px 10px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          <NavBtn active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); if (isMobile) setMobileMenuOpen(false); }} icon="📊" label="Executive Console" collapsed={sidebarCollapsed && !isMobile} />
          <NavBtn active={activeTab === 'complaints'} onClick={() => { setActiveTab('complaints'); if (isMobile) setMobileMenuOpen(false); }} icon="🚨" label="Incidents Ledger" collapsed={sidebarCollapsed && !isMobile} />
          {profile?.role !== 'commissioner' && (
            <NavBtn active={activeTab === 'users'} onClick={() => { setActiveTab('users'); if (isMobile) setMobileMenuOpen(false); }} icon="👥" label="Staff Directory" collapsed={sidebarCollapsed && !isMobile} />
          )}
          <NavBtn active={activeTab === 'analytics'} onClick={() => { setActiveTab('analytics'); if (isMobile) setMobileMenuOpen(false); }} icon="📈" label="BI Analytics" collapsed={sidebarCollapsed && !isMobile} />
          <NavBtn active={activeTab === 'map'} onClick={() => { setActiveTab('map'); if (isMobile) setMobileMenuOpen(false); }} icon="🗺️" label="GIS Control Map" collapsed={sidebarCollapsed && !isMobile} />
          <NavBtn active={activeTab === 'reports'} onClick={() => { setActiveTab('reports'); if (isMobile) setMobileMenuOpen(false); }} icon="📄" label="Report Center" collapsed={sidebarCollapsed && !isMobile} />
          <NavBtn active={activeTab === 'system_health'} onClick={() => { setActiveTab('system_health'); if (isMobile) setMobileMenuOpen(false); }} icon="⚙️" label="System Health" collapsed={sidebarCollapsed && !isMobile} />
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

      {/* --- MAIN CONTENT AREA --- */}
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

        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* KPI Counts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px' }}>
              <StatCard title="Total Tickets" value={<AnimatedCounter value={totalCount} />} color="#3b82f6" icon="📂" />
              <StatCard title="Active Backlog" value={<AnimatedCounter value={activeCount} />} color="#6366f1" icon="⚡" />
              <StatCard title="Resolved SLA" value={<AnimatedCounter value={resolvedCount} />} color="#10b981" icon="✅" />
              <StatCard title="Escalation Risk" value={<AnimatedCounter value={criticalCount} />} color="#ef4444" icon="⚠️" />
              <StatCard title="Reopened Rate" value={<AnimatedCounter value={reopenedCount} />} color="#eab308" icon="🔄" />
            </div>

            {/* AI Executive Triaging Summary */}
            <div style={{ padding: '20px', borderRadius: '16px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#fff', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}>
              <h3 style={{ margin: '0 0 8px', color: '#fbcfe8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🤖</span> Gemini Executive Operations Summary
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                Incident ingestion volumes are currently within normal thresholds. <strong>Roads & Water</strong> categories account for the majority of issues. 
                SLA solve compliance is healthy at <strong>98.2%</strong>. 
                Escalation Alert: <strong>{criticalCount} critical issues</strong> require immediate dispatcher attention.
              </p>
            </div>

            {/* Sub grids: Activity & Leaderboards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1.2fr', gap: '20px' }}>
              
              {/* Leaderboards */}
              <div style={{ ...styles.card, background: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
                <h3 style={{ margin: '0 0 15px', color: themeColors.textPrimary, fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase' }}>🏆 Performance Leaderboard</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {topResolversList.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: themeColors.textSecondary }}>No solved complaints recorded.</div>
                  ) : (
                    topResolversList.map((worker, index) => (
                      <div key={worker.email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: themeColors.surfaceSecondary, borderRadius: '8px', border: `1px solid ${themeColors.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#2563eb' }}>#{index + 1}</span>
                          <span style={{ fontSize: '0.85rem', color: themeColors.textPrimary }}>{worker.email}</span>
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#10b981' }}>{worker.count} Solved</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Broadcast announcements strip */}
              <div style={{ ...styles.card, background: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
                <h3 style={{ margin: '0 0 15px', color: themeColors.textPrimary, fontSize: '0.95rem', fontWeight: 'bold', textTransform: 'uppercase' }}>📢 Send Broadcast Notification</h3>
                <textarea 
                  value={broadcastMsg} 
                  onChange={e=>setBroadcastMsg(e.target.value)} 
                  placeholder="Announce system maintenance or citizen warnings..." 
                  style={{ width:'100%', padding:'10px', marginBottom:'15px', borderRadius:'8px', border:`1px solid ${themeColors.border}`, background: themeColors.background, color: themeColors.textPrimary, height: '80px', resize: 'none', outline: 'none' }}
                />
                <button onClick={handleBroadcast} style={{ width: '100%', padding: '10px', background: themeColors.primary, color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Transmit Public Broadcast
                </button>
              </div>

            </div>

            {/* Activity Feeds */}
            <div style={{ ...styles.card, background: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <h3 style={{ margin: '0 0 15px', color: themeColors.textPrimary }}>📋 Realtime Operational Ingestion Log</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ fontSize: '0.8rem', padding: '8px 12px', background: themeColors.surfaceSecondary, borderRadius: '6px', color: themeColors.textPrimary, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{log.action}</span>
                    <strong style={{ color: '#2563eb' }}>{log.user}</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: COMPLAINTS MANAGEMENT */}
        {activeTab === 'complaints' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Search & Filters */}
            <div style={{ ...styles.card, background: themeColors.surface, border: `1px solid ${themeColors.border}`, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={e=>setSearchTerm(e.target.value)} 
                  placeholder="Global Search (ID, Citizen, Description, Address...)" 
                  style={{ ...styles.input, flex: 2, minWidth: '220px', color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }}
                />
                <input 
                  type="text" 
                  value={employeeSearch} 
                  onChange={e=>setEmployeeSearch(e.target.value)} 
                  placeholder="Assignee Staff Search" 
                  style={{ ...styles.input, flex: 1, minWidth: '150px', color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '0.8rem' }}>
                <div>
                  <span style={{ marginRight: '6px', fontWeight: 'bold' }}>Status:</span>
                  <select value={statusFilter} onChange={e=>setFilterStatus(e.target.value)} style={{ ...styles.miniSelect, color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Reopened">Reopened</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <span style={{ marginRight: '6px', fontWeight: 'bold' }}>Priority:</span>
                  <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value)} style={{ ...styles.miniSelect, color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                    <option value="All">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
                <div>
                  <span style={{ marginRight: '6px', fontWeight: 'bold' }}>Category:</span>
                  <select value={categoryFilter} onChange={e=>setCategoryFilter(e.target.value)} style={{ ...styles.miniSelect, color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }}>
                    <option value="All">All Categories</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Complaints Data Ledger Table */}
            <div style={{ ...styles.card, background: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${themeColors.border}`, color: themeColors.textSecondary }}>
                      <th style={{ padding: '12px' }}>Incident ID</th>
                      <th style={{ padding: '12px' }}>Topic</th>
                      <th style={{ padding: '12px' }}>Category</th>
                      <th style={{ padding: '12px' }}>Priority</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px' }}>Assignee</th>
                      <th style={{ padding: '12px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComplaints.map((c) => (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${themeColors.border}`, color: themeColors.textPrimary }}>
                        <td style={{ padding: '12px', fontFamily: 'monospace' }}>#{String(c.id).slice(0, 6).toUpperCase()}</td>
                        <td style={{ padding: '12px', fontWeight: '600' }}>{c.title}</td>
                        <td style={{ padding: '12px' }}>{c.category}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', background: c.priority==='Critical'?'rgba(239,68,68,0.15)':'rgba(0,0,0,0.03)', color: c.priority==='Critical'?'#ef4444':themeColors.textSecondary }}>
                            {c.priority || 'Normal'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={statusBadgeStyle(c.status)}>{c.status}</span>
                        </td>
                        <td style={{ padding: '12px', color: '#2563eb' }}>{c.assigned_to || 'Unassigned'}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setAssigningComplaintId(c.id)} style={{ padding: '4px 8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Assign</button>
                            <button onClick={() => handleReject(c.id)} style={{ padding: '4px 8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Reject</button>
                            {c.latitude && c.longitude && (
                              <button onClick={() => openMap(c.latitude, c.longitude)} style={{ padding: '4px 8px', background: 'none', border: `1px solid ${themeColors.border}`, color: themeColors.textPrimary, borderRadius: '4px', cursor: 'pointer' }}>📍 Map</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: STAFF DIRECTORY */}
        {activeTab === 'users' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: themeColors.textPrimary }}>👥 Municipal Roster Directory</h3>
              <button onClick={() => setShowAddUserModal(true)} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>+ Create Worker Accounts</button>
            </div>

            <div style={{ ...styles.card, background: themeColors.surface, border: `1px solid ${themeColors.border}` }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${themeColors.border}`, color: themeColors.textSecondary }}>
                    <th style={{ padding: '12px' }}>Full Name</th>
                    <th style={{ padding: '12px' }}>Email Address</th>
                    <th style={{ padding: '12px' }}>Role Badge</th>
                    <th style={{ padding: '12px' }}>Department</th>
                    <th style={{ padding: '12px' }}>Active Load</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u=>u.role!=='citizen').map((u) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${themeColors.border}`, color: themeColors.textPrimary }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>{u.full_name || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={roleBadgeStyle(u.role)}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{u.department}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: getWorkerLoad(u.email) > 3 ? '#ef4444' : '#22c55e' }}>{getWorkerLoad(u.email)} Complaints</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: ADVANCED BI ANALYTICS */}
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
                    <line x1="50" y1="50" x2="450" y2="50" stroke={themeColors.border} strokeDasharray="5,5" />
                    <line x1="50" y1="100" x2="450" y2="100" stroke={themeColors.border} strokeDasharray="5,5" />
                    <line x1="50" y1="150" x2="450" y2="150" stroke={themeColors.border} strokeDasharray="5,5" />
                    <path d="M 50 170 Q 130 110 200 130 T 350 70 T 450 60 L 450 170 L 50 170 Z" fill="url(#areaGrad)" />
                    <path d="M 50 170 Q 130 110 200 130 T 350 70 T 450 60" fill="none" stroke="#3b82f6" strokeWidth="3" />
                    <circle cx="50" cy="170" r="4" fill="#3b82f6" />
                    <circle cx="130" cy="115" r="4" fill="#3b82f6" />
                    <circle cx="200" cy="130" r="4" fill="#3b82f6" />
                    <circle cx="350" cy="70" r="4" fill="#3b82f6" />
                    <circle cx="450" cy="60" r="4" fill="#3b82f6" />
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
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="10" strokeDasharray="125 251" strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="10" strokeDasharray="80 251" strokeDashoffset="-125" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="46 251" strokeDashoffset="-205" />
                  </svg>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColors.textPrimary }}><span style={{ display:'block', width:'12px', height:'12px', background:'#3b82f6', borderRadius:'3px' }}></span> Roads & Potholes (45%)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColors.textPrimary }}><span style={{ display:'block', width:'12px', height:'12px', background:'#10b981', borderRadius:'3px' }}></span> Water Leakage (30%)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: themeColors.textPrimary }}><span style={{ display:'block', width:'12px', height:'12px', background:'#f59e0b', borderRadius:'3px' }}></span> Electricity & Grid (25%)</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: GIS MAP */}
        {activeTab === 'map' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '550px' }}>
            <h3 style={{ margin: 0, color: themeColors.textPrimary }}>🗺️ Municipal Command Center GIS Map</h3>
            <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: `1px solid ${themeColors.border}` }}>
              <CommandCenterMap complaints={complaints} onSelectComplaint={(c) => { setActiveTab('complaints'); setSearchTerm(c.title); }} />
            </div>
          </div>
        )}

        {/* TAB 6: REPORT CENTER */}
        {activeTab === 'reports' && (
          <div className="fade-in">
            <h3 style={{ margin: '0 0 15px 0', color: themeColors.textPrimary }}>📄 Performance Reports Center</h3>
            <ReportCenter complaints={complaints} theme={theme} themeColors={themeColors} />
          </div>
        )}

        {/* TAB 7: INFRASTRUCTURE TELEMETRY */}
        {activeTab === 'system_health' && (
          <div className="fade-in">
            <h3 style={{ margin: '0 0 15px 0', color: themeColors.textPrimary }}>⚙️ Infrastructure Health & Telemetry</h3>
            <SystemHealth theme={theme} themeColors={themeColors} />
          </div>
        )}

        {/* TAB 8: AUDIT TRAIL LOGS */}
        {activeTab === 'audit_logs' && (
          <div className="fade-in">
             <h2 style={{ margin: '0 0 20px', color: themeColors.textPrimary, fontSize: '1.5rem' }}>Security Audit Logs Ledger</h2>
             <AuditLogsConsole />
          </div>
        )}

      </main>

      {/* --- ADD USER MODAL --- */}
      {showAddUserModal && (
        <div style={localStyles.modalOverlay} onClick={() => setShowAddUserModal(false)}>
          <div style={{ ...localStyles.modalContent, background: themeColors.surface, color: themeColors.textPrimary, border: `1px solid ${themeColors.border}` }} onClick={e=>e.stopPropagation()}>
            <div style={{ ...localStyles.modalHeader, borderBottom: `1px solid ${themeColors.border}` }}>
              <h3 style={{ margin: 0 }}>Create Worker Account</h3>
              <button onClick={() => setShowAddUserModal(false)} style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color: themeColors.textPrimary }}>&times;</button>
            </div>
            <form onSubmit={handleCreateUser} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={styles.formLabel}>Full Name</label>
                <input required value={newUser.fullName} onChange={e=>setNewUser(prev=>({...prev, fullName: e.target.value}))} style={{ ...styles.input, color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }} />
              </div>
              <div>
                <label style={styles.formLabel}>Email Address</label>
                <input required type="email" value={newUser.email} onChange={e=>setNewUser(prev=>({...prev, email: e.target.value}))} style={{ ...styles.input, color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }} />
              </div>
              <div>
                <label style={styles.formLabel}>Temporary Password</label>
                <input required type="password" value={newUser.password} onChange={e=>setNewUser(prev=>({...prev, password: e.target.value}))} style={{ ...styles.input, color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }} />
              </div>
              <div>
                <label style={styles.formLabel}>Govt ID Number</label>
                <input required value={newUser.idNumber} onChange={e=>setNewUser(prev=>({...prev, idNumber: e.target.value}))} style={{ ...styles.input, color: themeColors.textPrimary, background: themeColors.background, border: `1px solid ${themeColors.border}` }} />
              </div>
              <button type="submit" style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</button>
            </form>
          </div>
        </div>
      )}

      {/* --- WORKER ASSIGNMENT MODAL --- */}
      {assigningComplaintId && (
        <div style={localStyles.modalOverlay} onClick={() => setAssigningComplaintId(null)}>
          <div style={{ ...localStyles.modalContent, background: themeColors.surface, color: themeColors.textPrimary, border: `1px solid ${themeColors.border}`, maxHeight: '400px', display: 'flex', flexDirection: 'column' }} onClick={e=>e.stopPropagation()}>
            <div style={{ ...localStyles.modalHeader, borderBottom: `1px solid ${themeColors.border}` }}>
              <h3 style={{ margin: 0 }}>Allocate Field Dispatcher</h3>
              <button onClick={() => setAssigningComplaintId(null)} style={{ background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer', color: themeColors.textPrimary }}>&times;</button>
            </div>
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {users.filter(u=>u.role==='employee').map(worker => (
                <div key={worker.email} style={{ ...localStyles.workerRow, borderBottom: `1px solid ${themeColors.border}` }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{worker.full_name}</div>
                    <div style={{ fontSize: '0.75rem', color: themeColors.textSecondary }}>{worker.email} &bull; Load: {getWorkerLoad(worker.email)}</div>
                  </div>
                  <button onClick={() => handleAssignWorker(worker.email)} style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Select</button>
                </div>
              ))}
              {users.filter(u=>u.role==='employee').length === 0 && <p style={{ color: themeColors.textSecondary, textAlign: 'center' }}>No active field workers registered.</p>}
            </div>
          </div>
        </div>
      )}

      {/* --- MY PROFILE PORTAL TRIGGER --- */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---
const NavBtn = ({ active, onClick, icon, label, collapsed }) => {
  return (
    <button onClick={onClick} style={{
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px', 
      padding: '12px 15px',
      background: active ? 'rgba(255, 255, 255, 0.12)' : 'transparent', 
      color: active ? '#fff' : '#94a3b8',
      border: 'none', 
      borderRadius: '8px', 
      cursor: 'pointer', 
      fontSize: '0.9rem', 
      width: '100%', 
      textAlign: 'left',
      justifyContent: collapsed ? 'center' : 'flex-start',
      transition: 'all 0.2s ease',
      fontWeight: active ? '700' : 'normal',
    }}>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span> 
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
        <div style={{ fontSize: '1.6rem', fontWeight: '800', color: themeColors.textPrimary }}>{value}</div>
        <div style={{ color: themeColors.textSecondary, fontSize: '0.8rem', marginTop: '4px', fontWeight: '600' }}>{title}</div>
      </div>
      <div style={{ fontSize: '1.8rem', opacity: 0.8 }}>{icon}</div>
    </div>
  );
};

const styles = {
  card: {
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
  },
  input: {
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    outline: 'none',
    boxSizing: 'border-box'
  },
  miniSelect: {
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    outline: 'none'
  },
  formLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginBottom: '4px',
    color: '#64748b'
  }
};

const localStyles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '20px' },
  modalContent: { width: '450px', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', overflow:'hidden' },
  modalHeader: { padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  workerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }
};

const statusBadgeStyle = (status) => {
  const isResolved = status === 'Resolved' || status === 'Closed';
  const isRejected = status === 'Rejected';
  return {
    padding: '4px 10px', 
    borderRadius: '12px', 
    fontSize: '0.7rem', 
    fontWeight: 'bold', 
    background: isResolved ? 'rgba(34,197,94,0.12)' : isRejected ? 'rgba(239,68,68,0.12)' : 'rgba(234,88,12,0.12)', 
    color: isResolved ? '#22c55e' : isRejected ? '#ef4444' : '#ea580c'
  };
};

const roleBadgeStyle = (role) => {
  const isSuper = role === 'super_admin' || role === 'dept_admin';
  return {
    padding: '4px 10px', 
    borderRadius: '12px', 
    background: isSuper ? 'rgba(234,88,12,0.12)' : 'rgba(37,99,235,0.12)', 
    color: isSuper ? '#ea580c' : '#2563eb', 
    fontSize: '0.7rem', 
    fontWeight: 'bold', 
    textTransform: 'uppercase', 
    display: 'inline-block'
  };
};

export default AdminDashboard;