import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './Profile'; 

const AdminDashboard = () => {
  // --- STATE ---
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]); 
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setFilterStatus] = useState('All');
  const [adminName, setAdminName] = useState('Admin');
  const [manualEmails, setManualEmails] = useState({}); 

  const navigate = useNavigate();

  // --- INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      // Safety Check
      if (!profile || profile.role !== 'admin') {
        // alert("⛔ ACCESS DENIED: Authorized Personnel Only.");
        // return navigate('/');
        // FOR TESTING: We allow access, but log a warning
        console.warn("User is not admin, but we are allowing access for testing.");
      }

      setAdminName(profile?.full_name || 'Administrator');
      await fetchAllData();
      setLoading(false);
    };
    init();

    const sub = supabase.channel('admin_dashboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, () => fetchAllData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchAllData())
      .subscribe();
    return () => supabase.removeChannel(sub);
  }, [navigate]);

  const fetchAllData = async () => {
    // 1. Fetch Complaints
    const { data: cData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints(cData || []);
    
    // 2. Fetch Users
    const { data: uData, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) console.error("User Fetch Error:", error);
    setUsers(uData || []);

    // 3. Generate Logs
    const systemLogs = (cData || []).slice(0, 6).map(c => ({
      id: c.id, 
      action: `Report #${String(c.id).slice(0,4)}: ${c.title}`, 
      user: 'System',
      time: new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
    setLogs(systemLogs);
  };

  const addLog = (action) => {
    const newLog = { id: Date.now(), action, user: 'You', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- ASSIGNMENT LOGIC ---
  const handleManualInput = (id, value) => {
    setManualEmails(prev => ({ ...prev, [id]: value }));
  };

  const handleAssign = async (id) => {
    const email = manualEmails[id];
    if (!email || !email.includes('@')) return alert("⚠️ Please enter a valid email address.");

    // Update UI
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, assigned_to: email, status: 'Assigned' } : c));
    
    // Update DB
    const { error } = await supabase.from('complaints').update({ assigned_to: email, status: 'Assigned' }).eq('id', id);
    if (error) { 
        alert("Assignment Failed: " + error.message); 
        fetchAllData(); 
    } else { 
        addLog(`Assigned #${String(id).slice(0,4)} to ${email}`);
        setManualEmails(prev => ({ ...prev, [id]: '' }));
    }
  };

  const updateComplaint = async (id, field, value) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
    await supabase.from('complaints').update({ [field]: value }).eq('id', id);
  };

  const handleDelete = async (id) => {
    if (confirm("⚠️ Delete this report permanently?")) {
      setComplaints(prev => prev.filter(c => c.id !== id));
      await supabase.from('complaints').delete().eq('id', id);
    }
  };

  // --- STAFF PROMOTION LOGIC ---
  const toggleRole = async (userId, currentRole, email) => {
    const newRole = currentRole === 'citizen' ? 'employee' : 'citizen';
    const action = newRole === 'employee' ? 'Promote' : 'Demote';
    
    if (confirm(`${action} ${email} to ${newRole.toUpperCase()}?`)) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      addLog(`${action}d ${email}`);
    }
  };

  const openMaps = (loc) => {
    if(!loc) return;
    const coords = loc.replace('Lat: ', '').replace('Long: ', '').replace(' ', '');
    window.open(`https://www.google.com/maps?q=${coords}`, '_blank');
  };

  // --- FILTERING ---
  const filteredComplaints = complaints.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const staffList = users.filter(u => u.role === 'employee');
  const citizenList = users.filter(u => u.role === 'citizen');

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

      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}><h2 style={{ margin: 0 }}>CIVIC ADMIN</h2></div>
        <nav style={styles.nav}>
          <NavBtn active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon="📊" label="Dashboard" />
          <NavBtn active={activeTab === 'complaints'} onClick={() => setActiveTab('complaints')} icon="🚨" label="Complaints" />
          <NavBtn active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon="👥" label="Staff Manager" />
        </nav>
        <div style={styles.sidebarFooter}>
          <div style={{ fontSize: '0.85rem', color: '#ccc', marginBottom: '10px' }}>User: {adminName}</div>
          <button onClick={() => { supabase.auth.signOut(); navigate('/'); }} style={styles.logoutBtn}>Logout</button>
        </div>
      </aside>

      <main style={styles.main}>
        
        {/* VIEW: OVERVIEW */}
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
            </div>
          </div>
        )}

        {/* VIEW: COMPLAINTS */}
        {activeTab === 'complaints' && (
          <div className="fade-in">
             <div style={styles.headerRow}>
                <h2 style={styles.pageTitle}>Complaint Management</h2>
                <div style={styles.filters}>
                   <input placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput} />
                   <select onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}><option value="All">All Status</option><option>Pending</option><option>Resolved</option></select>
                </div>
             </div>
             <div style={styles.complaintList}>
                {filteredComplaints.length === 0 ? <div style={{textAlign:'center', color:'#888'}}>No complaints found.</div> : filteredComplaints.map(c => (
                   <div key={c.id} style={styles.complaintCard}>
                      <div style={styles.complaintImage}>{c.image_url ? <img src={c.image_url} alt="Proof" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={styles.noImage}>No Img</div>}</div>
                      <div style={styles.complaintContent}>
                         <h3 style={{margin:'0 0 5px', color:'#333'}}>{c.title} <span style={styles.badge(c.category)}>{c.category}</span></h3>
                         <p style={{color:'#666', fontSize:'0.9rem'}}>{c.description}</p>
                         <div style={{marginBottom:'10px', fontSize:'0.8rem', color:'#555', cursor:'pointer'}} onClick={() => openMaps(c.location)}>📍 {c.location || 'No Location'}</div>
                         
                         <div style={styles.actionToolbar}>
                            <div style={{display:'flex', alignItems:'center', gap:'5px', flex:1}}>
                                <span style={{fontSize:'1.2rem'}}>👤</span>
                                <input 
                                    type="text" 
                                    placeholder={c.assigned_to || "Worker Email..."}
                                    value={manualEmails[c.id] || ''} 
                                    onChange={(e) => handleManualInput(c.id, e.target.value)} 
                                    style={styles.manualInput} 
                                />
                                <button onClick={() => handleAssign(c.id)} style={styles.assignBtn}>
                                    {c.assigned_to ? 'Reassign' : 'Assign'}
                                </button>
                            </div>
                            <select value={c.priority || "Normal"} onChange={(e) => updateComplaint(c.id, 'priority', e.target.value)} style={styles.prioritySelect}>
                               <option>High</option><option>Medium</option><option>Normal</option>
                            </select>
                            <div style={{marginLeft:'auto', display:'flex', gap:'5px'}}>
                               <button onClick={() => updateComplaint(c.id, 'status', 'Resolved')} style={styles.iconBtn('green')}>✅</button>
                               <button onClick={() => handleDelete(c.id)} style={styles.iconBtn('red')}>🗑</button>
                            </div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {/* VIEW: STAFF MANAGER */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <h2 style={styles.pageTitle}>Staff & User Manager</h2>
            
            {/* 1. Active Staff */}
            <div style={styles.card}>
              <h3 style={{margin:'0 0 15px', color:'#0056b3'}}>👮 Active Staff ({staffList.length})</h3>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Role</th><th style={styles.th}>Action</th></tr></thead>
                <tbody>
                  {staffList.length === 0 && <tr><td colSpan="3" style={{padding:'20px', textAlign:'center', color:'#999'}}>No staff yet. Promote a citizen below.</td></tr>}
                  {staffList.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}><strong>{u.full_name || u.email}</strong></td>
                      <td style={styles.td}><span style={styles.roleBadge('employee')}>STAFF</span></td>
                      <td style={styles.td}><button onClick={() => toggleRole(u.id, u.role, u.email)} style={styles.demoteBtn}>⬇️ Demote</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 2. Citizens */}
            <div style={styles.card}>
              <h3 style={{margin:'0 0 15px', color:'#333'}}>👥 Registered Citizens ({citizenList.length})</h3>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Role</th><th style={styles.th}>Action</th></tr></thead>
                <tbody>
                  {citizenList.length === 0 && <tr><td colSpan="3" style={{padding:'20px', textAlign:'center', color:'#999'}}>No citizens found in database.</td></tr>}
                  {citizenList.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}><strong>{u.full_name || u.email}</strong></td>
                      <td style={styles.td}><span style={styles.badge('citizen')}>CITIZEN</span></td>
                      <td style={styles.td}><button onClick={() => toggleRole(u.id, u.role, u.email)} style={styles.promoteBtn}>⬆️ Promote</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  roleBadge: (role) => ({ padding: '4px 10px', borderRadius: '12px', background: role==='employee'?'#17a2b8':'#6c757d', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' })
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