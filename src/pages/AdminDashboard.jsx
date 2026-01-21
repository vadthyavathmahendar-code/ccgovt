import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile'; 

// --- STYLES (Moved to top to prevent errors) ---
const styles = {
  container: { display: 'flex', height: '100vh', width: '100vw', background: '#f0f2f5', overflow: 'hidden' },
  loading: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0056b3', fontSize: '1.2rem', fontWeight: 'bold' },
  sidebar: { width: '260px', background: '#1a1f36', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader: { padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
  nav: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' },
  sidebarFooter: { padding: '20px', background: 'rgba(0,0,0,0.2)' },
  main: { flex: 1, overflowY: 'auto', padding: '30px', position: 'relative' },
  
  // Buttons
  profileBtn: { width: '100%', padding: '10px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer', marginBottom: '10px' },
  logoutBtn: { width: '100%', padding: '10px', background: '#e63946', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' },
  actionBtn: { width: '100%', padding: '12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' },
  iconBtn: (color) => ({ background: 'none', border: `1px solid ${color}`, borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', color: color }),
  
  // Text & Headers
  pageTitle: { margin: '0 0 20px', color: '#1a1f36', fontSize: '1.8rem' },
  cardHeader: { margin: '0 0 15px', fontSize: '1.1rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  
  // Layouts
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
  dashboardSplit: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  card: { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  filters: { display: 'flex', gap: '10px' },
  
  // Inputs
  searchInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '250px' },
  filterSelect: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px' },
  assignSelect: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1, minWidth: '150px' },
  prioritySelect: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  
  // Complaints List
  complaintList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  complaintCard: { background: 'white', padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', alignItems: 'start' },
  complaintImage: { width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#eee' },
  noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#777' },
  complaintContent: { flex: 1 },
  actionToolbar: { background: '#f8f9fa', padding: '10px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  
  // Tables & Logs
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px', color: '#333', fontSize: '0.9rem' },
  td: { padding: '15px', fontSize: '0.9rem', color: '#555' },
  roleBtn: { padding: '6px 12px', fontSize: '0.75rem', borderRadius: '20px', border: '1px solid #ccc', cursor: 'pointer', background: 'white' },
  logContainer: { height: '300px', overflowY: 'auto', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #eee' },
  logItem: { fontSize: '0.85rem', marginBottom: '8px', borderBottom: '1px dashed #ddd', paddingBottom: '4px' },
  logTime: { fontFamily: 'monospace', color: '#0056b3', marginRight: '8px' },
  
  // Badges
  badge: (cat) => ({ background: '#e2e6ea', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#495057' }),
  roleBadge: (role) => ({ padding: '5px 10px', borderRadius: '15px', background: role==='admin'?'#343a40':role==='employee'?'#17a2b8':'#28a745', color: 'white', fontSize: '0.75rem', fontWeight: 'bold' })
};

const AdminDashboard = () => {
  // --- STATE ---
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [categories, setCategories] = useState(['Roads', 'Garbage', 'Electricity', 'Water', 'Traffic']);
  
  const [activeTab, setActiveTab] = useState('overview'); 
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setFilterStatus] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [adminName, setAdminName] = useState('Admin');
  const [newCategory, setNewCategory] = useState('');

  const navigate = useNavigate();

  // --- INITIAL LOAD ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      // Safety Check
      if (!profile || profile.role !== 'admin') {
        alert("⛔ ACCESS DENIED: Authorized Personnel Only.");
        return navigate('/');
      }

      setAdminName(profile.full_name || 'Administrator');
      await fetchAllData();
      setLoading(false);
    };

    init();

    const sub = supabase.channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchAllData())
      .subscribe();

    return () => supabase.removeChannel(sub);
  }, [navigate]);

  // --- DATA FETCH ---
  const fetchAllData = async () => {
    // 1. Get Complaints
    const { data: cData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints(cData || []);
    
    // 2. Get Users (Profiles)
    const { data: uData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(uData || []);

    // 3. Mock Logs
    const systemLogs = (cData || []).slice(0, 6).map(c => ({
      id: c.id, 
      action: `Report #${c.id.toString().slice(0,4)}: ${c.title}`, 
      user: 'System',
      time: new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
    setLogs(systemLogs);
  };

  // --- ACTIONS ---
  const addLog = (action) => {
    const newLog = { id: Date.now(), action, user: 'You', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAssign = async (id, email) => {
    if (!email) return;
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, assigned_to: email, status: 'Assigned' } : c));
    
    const { error } = await supabase.from('complaints').update({ assigned_to: email, status: 'Assigned' }).eq('id', id);
    if (error) { alert("Assignment Failed"); fetchAllData(); } 
    else { addLog(`Assigned Report ID ${id.slice(0,4)} to ${email}`); }
  };

  const updateComplaint = async (id, field, value) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    await supabase.from('complaints').update({ [field]: value }).eq('id', id);
    addLog(`Updated ${field} to "${value}"`);
  };

  const handleDelete = async (id) => {
    if (confirm("⚠️ Delete this report permanently?")) {
      setComplaints(prev => prev.filter(c => c.id !== id));
      await supabase.from('complaints').delete().eq('id', id);
      addLog("Deleted a report");
    }
  };

  const toggleUserRole = async (userId, currentRole) => {
    const newRole = currentRole === 'citizen' ? 'employee' : 'citizen';
    if (confirm(`Change role to ${newRole.toUpperCase()}?`)) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      addLog(`User role updated to ${newRole}`);
    }
  };

  // --- 4. SAFE FILTERING (The Employee Logic) ---
  // This logic is robust: Case Insensitive and Trimmed
  const employees = users.filter(u => 
    u.role && u.role.toString().toLowerCase().trim() === 'employee'
  );

  const filteredComplaints = complaints.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchPriority = priorityFilter === 'All' || (c.priority || 'Normal') === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  const openMaps = (loc) => {
    if(!loc) return;
    const coords = loc.replace('Lat: ', '').replace('Long: ', '').replace(' ', '');
    window.open(`https://www.google.com/maps?q=${coords}`, '_blank');
  };

  // --- STATS ---
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    active: complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  if (loading) return <div style={styles.loading}>🔄 Loading Admin Panel...</div>;

  return (
    <div className="fade-in" style={styles.container}>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={{fontSize: '3rem'}}>🏛️</div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '1px' }}>CIVIC<br/>ADMIN</h2>
        </div>
        <nav style={styles.nav}>
          <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Dashboard" />
          <NavBtn active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} icon="🚨" label="Complaints" />
          <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥" label="Staff & Users" />
          <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon="📈" label="Analytics" />
          <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" label="Settings" />
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '10px' }}>User: {adminName}</div>
          <button onClick={() => setShowProfile(true)} style={styles.profileBtn}>Profile</button>
          <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <h2 style={styles.pageTitle}>System Overview</h2>
            <div style={styles.statsGrid}>
              <StatCard title="Total Issues" value={stats.total} color="#007bff" icon="📂" />
              <StatCard title="Action Required" value={stats.pending} color="#dc3545" icon="⚡" />
              <StatCard title="In Progress" value={stats.active} color="#ffc107" icon="🚧" />
              <StatCard title="Resolved" value={stats.resolved} color="#28a745" icon="✅" />
            </div>
            <div style={styles.dashboardSplit}>
              <div style={styles.card}>
                <h3 style={styles.cardHeader}>📠 Live Audit Log</h3>
                <div style={styles.logContainer}>
                  {logs.map(log => <div key={log.id} style={styles.logItem}><span style={styles.logTime}>[{log.time}]</span> {log.action}</div>)}
                </div>
              </div>
              <div style={styles.card}>
                <h3 style={styles.cardHeader}>🚀 Quick Actions</h3>
                <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                   <button onClick={() => setActiveTab('complaints')} style={styles.actionBtn}>Review Pending</button>
                   <button onClick={() => setActiveTab('users')} style={styles.actionBtn}>Manage Staff</button>
                   <button onClick={fetchAllData} style={{...styles.actionBtn, background:'#6c757d'}}>Refresh Data</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div className="fade-in">
             <div style={styles.headerRow}>
                <h2 style={styles.pageTitle}>Complaint Management</h2>
                <div style={styles.filters}>
                   <input placeholder="🔍 Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput} />
                   <select onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}><option value="All">All Status</option><option>Pending</option><option>Resolved</option></select>
                </div>
             </div>
             <div style={styles.complaintList}>
                {filteredComplaints.length === 0 ? <div style={{textAlign:'center', color:'#888'}}>No complaints found.</div> : filteredComplaints.map(c => (
                   <div key={c.id} style={styles.complaintCard}>
                      <div style={styles.complaintImage}>{c.image_url ? <img src={c.image_url} alt="Proof" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={styles.noImage}>📷 No Img</div>}</div>
                      <div style={styles.complaintContent}>
                         <h3 style={{margin:'0 0 5px', color:'#333'}}>{c.title} <span style={styles.badge(c.category)}>{c.category}</span></h3>
                         <p style={{color:'#666', fontSize:'0.9rem'}}>{c.description}</p>
                         <div style={{marginBottom:'10px', fontSize:'0.8rem', color:'#555', cursor:'pointer'}} onClick={() => openMaps(c.location)}>📍 {c.location || 'No Location'}</div>
                         
                         {/* ASSIGNMENT TOOLBAR (FIXED) */}
                         <div style={styles.actionToolbar}>
                            <select 
                              value={c.assigned_to || ""} 
                              onChange={(e) => handleAssign(c.id, e.target.value)}
                              style={styles.assignSelect}
                            >
                               <option value="" disabled>👤 Assign Employee</option>
                               {employees.length > 0 ? employees.map(e => (
                                 <option key={e.id} value={e.email}>{e.full_name || e.email}</option>
                               )) : <option disabled>No Employees Found</option>}
                            </select>

                            <select value={c.priority || "Normal"} onChange={(e) => updateComplaint(c.id, 'priority', e.target.value)} style={styles.prioritySelect}>
                               <option>High</option><option>Medium</option><option>Normal</option>
                            </select>

                            <div style={{marginLeft:'auto', display:'flex', gap:'5px'}}>
                               <button onClick={() => updateComplaint(c.id, 'status', 'Resolved')} style={styles.iconBtn('green')}>✅</button>
                               <button onClick={() => updateComplaint(c.id, 'status', 'Rejected')} style={styles.iconBtn('orange')}>🚫</button>
                               <button onClick={() => handleDelete(c.id)} style={styles.iconBtn('red')}>🗑</button>
                            </div>
                         </div>
                         <div style={{marginTop:'5px', fontSize:'0.75rem', fontWeight:'bold', color: c.status==='Resolved'?'green':c.status==='Pending'?'red':'#007bff'}}>
                            Current Status: {c.status} {c.assigned_to && `(Assigned to: ${c.assigned_to})`}
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <h2 style={styles.pageTitle}>User & Staff Directory</h2>
            <div style={styles.card}>
              <table style={styles.table}>
                <thead>
                  <tr style={{background:'#f8f9fa', textAlign:'left'}}>
                    <th style={styles.th}>Name / Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{borderBottom:'1px solid #eee'}}>
                      <td style={styles.td}>
                         <div style={{fontWeight:'bold'}}>{u.full_name || 'User'}</div>
                         <div style={{fontSize:'0.8rem', color:'#666'}}>{u.email}</div>
                      </td>
                      <td style={styles.td}><span style={styles.roleBadge(u.role)}>{u.role}</span></td>
                      <td style={styles.td}>
                        {u.role !== 'admin' && (
                          <button onClick={() => toggleUserRole(u.id, u.role)} style={styles.roleBtn}>
                            {u.role.toLowerCase() === 'citizen' ? '⬆️ Promote' : '⬇️ Demote'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OTHER TABS */}
        {activeTab === 'analytics' && <div className="fade-in"><h2>Analytics</h2><div style={styles.card}>Graphs coming soon...</div></div>}
        {activeTab === 'settings' && <div className="fade-in"><h2>Settings</h2><div style={styles.card}>App settings here...</div></div>}

      </main>
    </div>
  );
};

// --- HELPER COMPONENTS ---
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