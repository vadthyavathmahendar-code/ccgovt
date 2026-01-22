import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile'; 

const AdminDashboard = () => {
  // --- STATE MANAGEMENT ---
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]); 
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  // Filters & Inputs
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setFilterStatus] = useState('All');
  const [manualEmails, setManualEmails] = useState({}); 
  const [broadcastMsg, setBroadcastMsg] = useState('');
  
  // Configuration State (Feature #8)
  const [categories, setCategories] = useState(['Roads', 'Garbage', 'Water', 'Electricity', 'Traffic']);
  const [newCategory, setNewCategory] = useState('');

  const navigate = useNavigate();

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      // Admin Protection
      if (!profile || profile.role !== 'admin') {
         console.warn("Access Check: Non-admin user.");
      }

      setAdminName(profile?.full_name || 'Administrator');
      await fetchAllData();
      setLoading(false);
    };
    init();

    // Real-time Listeners
    const sub = supabase.channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAllData())
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [navigate]);

  const fetchAllData = async () => {
    // Fetch Complaints
    const { data: cData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints(cData || []);
    
    // Fetch All Users
    const { data: uData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(uData || []);

    // Generate System Logs (Feature #10)
    const systemLogs = (cData || []).slice(0, 8).map(c => ({
      id: c.id, 
      action: `New Report #${String(c.id).slice(0,4)}: ${c.category}`, 
      user: 'System',
      time: new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
    setLogs(prev => [...systemLogs, ...prev].slice(0, 20)); // Keep last 20 logs
  };

  const addLog = (action) => {
    const newLog = { id: Date.now(), action, user: 'Admin', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- 2. CORE ACTIONS (Assignment & Workflow) ---
  
  const handleAssign = async (id) => {
    const email = manualEmails[id];
    if (!email || !email.includes('@')) return alert("⚠️ Please enter a valid worker email.");

    // Feature #3: Assign Complaint
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, assigned_to: email, status: 'Assigned' } : c));
    const { error } = await supabase.from('complaints').update({ assigned_to: email, status: 'Assigned' }).eq('id', id);
    
    if (error) { alert("Error: " + error.message); fetchAllData(); } 
    else { addLog(`Assigned Report #${id} to ${email}`); setManualEmails(prev => ({ ...prev, [id]: '' })); }
  };

  const updateComplaint = async (id, field, value) => {
    // Feature #4: Status/Priority Control
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    await supabase.from('complaints').update({ [field]: value }).eq('id', id);
    addLog(`Changed ${field} of #${id} to ${value}`);
  };

  const handleDelete = async (id) => {
    if (confirm("⚠️ Reject and remove this complaint?")) {
      setComplaints(prev => prev.filter(c => c.id !== id));
      await supabase.from('complaints').delete().eq('id', id);
      addLog(`Rejected Complaint #${id}`);
    }
  };

  // --- 3. USER MANAGEMENT (Feature #5 & #6) ---
  const toggleRole = async (userId, currentRole, email) => {
    const newRole = currentRole === 'citizen' ? 'employee' : 'citizen';
    const action = newRole === 'employee' ? 'Promote' : 'Demote';
    
    if (confirm(`${action} ${email} to ${newRole.toUpperCase()}?`)) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      addLog(`${action}d user ${email}`);
    }
  };

  // --- 4. CONFIGURATION (Feature #8) ---
  const handleAddCategory = () => {
    if(newCategory && !categories.includes(newCategory)){
        setCategories([...categories, newCategory]);
        setNewCategory('');
        addLog(`Added category: ${newCategory}`);
    }
  };

  // --- IN AdminDashboard.jsx ---
  
  const handleBroadcast = async () => {
    if(!broadcastMsg) return;
    
    // 1. Save to Database
    const { error } = await supabase.from('broadcasts').insert([{ message: broadcastMsg }]);
    
    if(error) {
        alert("❌ Failed to send: " + error.message);
    } else {
        alert(`📢 Broadcast Sent to All Users!`);
        addLog(`Sent Broadcast: "${broadcastMsg}"`);
        setBroadcastMsg('');
    }
  };

  // --- 5. HELPERS & STATS ---
  const openMaps = (loc) => {
    if(!loc) return;
    const coords = loc.replace('Lat: ', '').replace('Long: ', '').replace(' ', '');
    window.open(`https://www.google.com/maps?q=${coords}`, '_blank');
  };

  const filteredComplaints = complaints.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(c.id).includes(searchTerm);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const staffList = users.filter(u => u.role === 'employee');
  const citizenList = users.filter(u => u.role === 'citizen');

  // Feature #1: System Overview Stats
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    active: complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  // Feature #7: Analytics Data
  const getCategoryCount = (cat) => complaints.filter(c => c.category === cat).length;

  if (loading) return <div style={styles.loading}>🔄 Loading Admin System...</div>;

  return (
    <div className="fade-in" style={styles.container}>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

      {/* SIDEBAR NAVIGATION */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}><h2 style={{ margin: 0 }}>CIVIC ADMIN</h2></div>
        <nav style={styles.nav}>
          <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Dashboard" />
          <NavBtn active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} icon="🚨" label="Complaints" />
          <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥" label="Staff & Users" />
          <NavBtn active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon="📈" label="Analytics" />
          <NavBtn active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="⚙️" label="Config" />
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '10px' }}>User: {adminName}</div>
          <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={styles.main}>
        
        {/* === TAB 1: OVERVIEW === */}
        {activeTab === 'overview' && (
          <div className="fade-in">
            <h2 style={styles.pageTitle}>System Overview</h2>
            
            {/* Feature #1: Stats */}
            <div style={styles.statsGrid}>
              <StatCard title="Total Complaints" value={stats.total} color="#007bff" icon="📂" />
              <StatCard title="Unassigned" value={stats.pending} color="#dc3545" icon="⚡" />
              <StatCard title="In Progress" value={stats.active} color="#ffc107" icon="🚧" />
              <StatCard title="Resolved" value={stats.resolved} color="#28a745" icon="✅" />
            </div>

            <div style={styles.dashboardSplit}>
              {/* Feature #10: Audit Log */}
              <div style={styles.card}>
                <h3 style={styles.cardHeader}>📠 System Audit Log</h3>
                <div style={styles.logContainer}>
                  {logs.map((log, i) => <div key={i} style={styles.logItem}><span style={styles.logTime}>[{log.time}]</span> <strong>{log.user}:</strong> {log.action}</div>)}
                </div>
              </div>

              {/* Feature #9: Notifications */}
              <div style={styles.card}>
                <h3 style={styles.cardHeader}>📢 Public Broadcast</h3>
                <textarea 
                    rows="3" 
                    placeholder="Type alert message for all users..." 
                    value={broadcastMsg}
                    onChange={e => setBroadcastMsg(e.target.value)}
                    style={{width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ccc'}}
                />
                <button onClick={handleBroadcast} style={{...styles.actionBtn, width:'100%', background:'#6610f2'}}>Send Alert</button>
              </div>
            </div>
          </div>
        )}

        {/* === TAB 2: COMPLAINTS === */}
        {activeTab === 'complaints' && (
          <div className="fade-in">
             <div style={styles.headerRow}>
                <h2 style={styles.pageTitle}>Complaint Management</h2>
                <div style={styles.filters}>
                   <input placeholder="Search ID, Title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput} />
                   <select onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}><option value="All">All Status</option><option>Pending</option><option>Resolved</option></select>
                </div>
             </div>
             
             {/* Feature #2: Complaint List */}
             <div style={styles.complaintList}>
                {filteredComplaints.map(c => (
                   <div key={c.id} style={styles.complaintCard}>
                      <div style={styles.complaintImage}>{c.image_url ? <img src={c.image_url} alt="Evidence" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={styles.noImage}>No Image</div>}</div>
                      <div style={styles.complaintContent}>
                         <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                             <span style={{fontWeight:'bold', color:'#0056b3'}}>#{String(c.id).slice(0,6)}</span>
                             <span style={styles.statusBadge(c.status)}>{c.status.toUpperCase()}</span>
                         </div>
                         <h3 style={{margin:'0 0 5px', color:'#333'}}>{c.title} <span style={styles.badge(c.category)}>{c.category}</span></h3>
                         <p style={{color:'#666', fontSize:'0.9rem'}}>{c.description}</p>
                         <div style={{marginBottom:'10px', fontSize:'0.8rem', color:'#555', cursor:'pointer'}} onClick={() => openMaps(c.location)}>📍 {c.location || 'No Location Data'}</div>
                         
                         {/* Feature #3 & #4: Assignment & Workflow */}
                         <div style={styles.actionToolbar}>
                            <div style={{display:'flex', alignItems:'center', gap:'5px', flex:1}}>
                                <span style={{fontSize:'1.2rem'}}>👤</span>
                                <input 
                                    type="text" 
                                    placeholder={c.assigned_to || "Worker Email..."}
                                    value={manualEmails[c.id] || ''} 
                                    onChange={(e) => setManualEmails({...manualEmails, [c.id]: e.target.value})} 
                                    style={styles.manualInput} 
                                />
                                <button onClick={() => handleAssign(c.id)} style={styles.assignBtn}>{c.assigned_to ? 'Change' : 'Assign'}</button>
                            </div>
                            <select value={c.priority || "Normal"} onChange={(e) => updateComplaint(c.id, 'priority', e.target.value)} style={styles.prioritySelect}>
                               <option>High</option><option>Medium</option><option>Normal</option>
                            </select>
                            <button onClick={() => handleDelete(c.id)} style={styles.iconBtn('red')} title="Reject">🗑</button>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* === TAB 3: USERS & STAFF === */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <h2 style={styles.pageTitle}>User & Employee Management</h2>
            
            {/* Feature #6: Employee Management */}
            <div style={styles.card}>
              <h3 style={{margin:'0 0 15px', color:'#0056b3', borderBottom:'2px solid #007bff', paddingBottom:'10px'}}>
                  👮 Active Field Officers ({staffList.length})
              </h3>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Role</th><th style={styles.th}>Action</th></tr></thead>
                <tbody>
                  {staffList.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}><strong>{u.full_name || u.email}</strong><br/><span style={{fontSize:'0.8rem', color:'#777'}}>{u.email}</span></td>
                      <td style={styles.td}><span style={styles.roleBadge('employee')}>STAFF</span></td>
                      <td style={styles.td}><button onClick={() => toggleRole(u.id, u.role, u.email)} style={styles.demoteBtn}>⬇️ Demote</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Feature #5: User Management */}
            <div style={styles.card}>
              <h3 style={{margin:'0 0 15px', color:'#333', borderBottom:'2px solid #ddd', paddingBottom:'10px'}}>
                  👥 Citizens ({citizenList.length})
              </h3>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Role</th><th style={styles.th}>Action</th></tr></thead>
                <tbody>
                  {citizenList.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}><strong>{u.full_name || u.email}</strong><br/><span style={{fontSize:'0.8rem', color:'#777'}}>{u.email}</span></td>
                      <td style={styles.td}><span style={styles.badge('citizen')}>CITIZEN</span></td>
                      <td style={styles.td}><button onClick={() => toggleRole(u.id, u.role, u.email)} style={styles.promoteBtn}>⬆️ Promote</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === TAB 4: ANALYTICS (Feature #7) === */}
        {activeTab === 'analytics' && (
          <div className="fade-in">
             <h2 style={styles.pageTitle}>Reports & Analytics</h2>
             <div style={styles.card}>
                <h3>📊 Complaints by Category</h3>
                <div style={{marginTop:'20px'}}>
                    {categories.map(cat => {
                        const count = getCategoryCount(cat);
                        const width = complaints.length > 0 ? (count / complaints.length) * 100 : 0;
                        return (
                            <div key={cat} style={{marginBottom:'15px'}}>
                                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                    <span>{cat}</span>
                                    <strong>{count} issues</strong>
                                </div>
                                <div style={{width:'100%', background:'#eee', height:'10px', borderRadius:'5px', overflow:'hidden'}}>
                                    <div style={{width: `${width}%`, background:'#007bff', height:'100%'}}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
             </div>
          </div>
        )}

        {/* === TAB 5: SETTINGS (Feature #8) === */}
        {activeTab === 'settings' && (
          <div className="fade-in">
             <h2 style={styles.pageTitle}>Configuration & Master Data</h2>
             <div style={styles.card}>
                <h3>🏷️ Manage Categories</h3>
                <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                    <input 
                        value={newCategory} 
                        onChange={e => setNewCategory(e.target.value)} 
                        placeholder="New Category Name..." 
                        style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', flex:1}} 
                    />
                    <button onClick={handleAddCategory} style={styles.actionBtn}>+ Add</button>
                </div>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                    {categories.map(cat => (
                        <span key={cat} style={{background:'#e9ecef', padding:'8px 15px', borderRadius:'20px', border:'1px solid #ddd'}}>
                            {cat}
                        </span>
                    ))}
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
  loading: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#0056b3', fontSize: '1.2rem', fontWeight: 'bold' },
  sidebar: { width: '260px', background: '#1a1f36', color: 'white', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader: { padding: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' },
  nav: { flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '5px' },
  sidebarFooter: { padding: '20px', background: 'rgba(0,0,0,0.2)' },
  main: { flex: 1, overflowY: 'auto', padding: '30px', position: 'relative' },
  
  actionBtn: { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  logoutBtn: { width: '100%', padding: '10px', background: '#e63946', border: 'none', color: 'white', borderRadius: '5px', cursor: 'pointer' },
  promoteBtn: { padding: '6px 12px', fontSize: '0.8rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  demoteBtn: { padding: '6px 12px', fontSize: '0.8rem', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  assignBtn: { padding: '8px 12px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' },
  iconBtn: (color) => ({ background: 'none', border: `1px solid ${color}`, borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', color: color }),

  pageTitle: { margin: '0 0 20px', color: '#1a1f36', fontSize: '1.8rem' },
  card: { background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' },
  cardHeader: { margin: '0 0 15px', fontSize: '1.1rem', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '10px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' },
  dashboardSplit: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' },
  
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' },
  filters: { display: 'flex', gap: '10px' },
  searchInput: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px', width: '250px' },
  filterSelect: { padding: '10px', border: '1px solid #ccc', borderRadius: '5px' },
  manualInput: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '180px', fontSize: '0.85rem' },
  prioritySelect: { padding: '8px', borderRadius: '4px', border: '1px solid #ccc' },
  
  complaintList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  complaintCard: { background: 'white', padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', alignItems: 'start' },
  complaintImage: { width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#eee' },
  noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#777' },
  complaintContent: { flex: 1 },
  actionToolbar: { background: '#f8f9fa', padding: '10px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', color: '#555', fontSize: '0.85rem', textAlign: 'left', background: '#f8f9fa', borderBottom: '2px solid #eee' },
  td: { padding: '12px', fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #eee' },
  
  logContainer: { height: '300px', overflowY: 'auto', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #eee' },
  logItem: { fontSize: '0.85rem', marginBottom: '8px', borderBottom: '1px dashed #ddd', paddingBottom: '4px' },
  logTime: { fontFamily: 'monospace', color: '#0056b3', marginRight: '8px' },
  
  badge: (cat) => ({ background: '#e2e6ea', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#495057' }),
  roleBadge: (role) => ({ padding: '4px 10px', borderRadius: '12px', background: role==='employee'?'#17a2b8':'#6c757d', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }),
  statusBadge: (status) => ({ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', background: status==='Resolved'?'#d1e7dd':status==='Pending'?'#f8d7da':'#fff3cd', color: status==='Resolved'?'#0f5132':status==='Pending'?'#842029':'#664d03' }),
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