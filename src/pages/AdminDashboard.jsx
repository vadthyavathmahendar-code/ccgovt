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

  // Assignment Modal State (Feature: Workload Picker)
  const [assigningComplaintId, setAssigningComplaintId] = useState(null); 

  // Filters & Inputs
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setFilterStatus] = useState('All');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  
  // Configuration State
  const [categories, setCategories] = useState(['Roads', 'Garbage', 'Water', 'Electricity', 'Traffic']);
  const [newCategory, setNewCategory] = useState('');

  const navigate = useNavigate();

  // --- 1. INITIALIZATION ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (!profile || profile.role !== 'admin') {
         console.warn("Access Check: Non-admin user.");
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
    const { data: cData } = await supabase.from('complaints').select('*').order('created_at', { ascending: false });
    setComplaints(cData || []);
    
    const { data: uData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(uData || []);

    const systemLogs = (cData || []).slice(0, 8).map(c => ({
      id: c.id, 
      action: `New Report #${String(c.id).slice(0,4)}: ${c.category}`, 
      user: 'System',
      time: new Date(c.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    }));
    setLogs(prev => [...systemLogs, ...prev].slice(0, 20)); 
  };

  const addLog = (action) => {
    const newLog = { id: Date.now(), action, user: 'Admin', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setLogs(prev => [newLog, ...prev]);
  };

  // --- 2. CORE ACTIONS ---
  
  // Feature: Smart Assignment Logic
  const handleAssignWorker = async (email) => {
    if (!assigningComplaintId) return;

    // Optimistic Update
    setComplaints(prev => prev.map(c => c.id === assigningComplaintId ? { ...c, assigned_to: email, status: 'Assigned' } : c));
    
    // DB Update
    const { error } = await supabase.from('complaints').update({ assigned_to: email, status: 'Assigned' }).eq('id', assigningComplaintId);
    
    if (error) { 
        alert("Error: " + error.message); 
        fetchAllData(); 
    } else { 
        addLog(`Assigned Report #${assigningComplaintId} to ${email}`); 
        setAssigningComplaintId(null); // Close Modal
    }
  };

  const updateComplaint = async (id, field, value) => {
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

  // --- 3. EXPORT & HELPERS ---
  const handleExport = () => {
    const headers = ["ID", "Title", "Category", "Status", "Date", "Location", "Assigned To"];
    const rows = complaints.map(c => [
        c.id, 
        `"${c.title.replace(/"/g, '""')}"`, 
        c.category, 
        c.status, 
        new Date(c.created_at).toLocaleDateString(), 
        `"${c.location}"`, 
        c.assigned_to || 'Unassigned'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `civic_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getWorkerLoad = (email) => {
      // Calculate active tasks (Assigned or In Progress) for a specific worker
      return complaints.filter(c => c.assigned_to === email && c.status !== 'Resolved').length;
  };

  const toggleRole = async (userId, currentRole, email) => {
    const newRole = currentRole === 'citizen' ? 'employee' : 'citizen';
    if (confirm(`Change role of ${email} to ${newRole.toUpperCase()}?`)) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      addLog(`Changed role of ${email} to ${newRole}`);
    }
  };

  const handleBroadcast = async () => {
    if(!broadcastMsg) return;
    const { error } = await supabase.from('broadcasts').insert([{ message: broadcastMsg }]);
    if(!error) {
        alert(`📢 Broadcast Sent!`);
        addLog(`Sent Broadcast: "${broadcastMsg}"`);
        setBroadcastMsg('');
    }
  };

  const openMaps = (loc) => {
    if(!loc) return;
    const coords = loc.match(/-?\d+(\.\d+)?/g);
    if(coords && coords.length >= 2) window.open(`https://www.google.com/maps?q=${coords[0]},${coords[1]}`, '_blank');
  };

  // --- 4. FILTERING & STATS ---
  const filteredComplaints = complaints.filter(c => {
    const matchSearch = (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || String(c.id).includes(searchTerm);
    const matchStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchUrgent = showUrgentOnly ? (c.title && c.title.includes('⚠️')) : true;
    return matchSearch && matchStatus && matchUrgent;
  });

  const staffList = users.filter(u => u.role === 'employee');
  const citizenList = users.filter(u => u.role === 'citizen');

  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'Pending').length,
    active: complaints.filter(c => ['Assigned', 'In Progress'].includes(c.status)).length,
    resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  // Analytics Helpers
  const getCategoryCount = (cat) => complaints.filter(c => c.category === cat).length;
  let currentDeg = 0;
  const pieColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6610f2', '#fd7e14'];
  const pieGradient = categories.map((cat, i) => {
      const count = getCategoryCount(cat);
      const percentage = (count / complaints.length) * 360;
      const segment = `${pieColors[i % pieColors.length]} ${currentDeg}deg ${currentDeg + percentage}deg`;
      currentDeg += percentage;
      return segment;
  }).join(', ');

  if (loading) return <div style={styles.loading}>🔄 Loading Admin System...</div>;

  return (
    <div className="fade-in" style={styles.container}>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      
      {/* --- FEATURE: ASSIGNMENT MODAL --- */}
      {assigningComplaintId && (
          <div style={styles.modalOverlay}>
              <div className="gov-card fade-in" style={styles.modalContent}>
                  <div style={styles.modalHeader}>
                      <h3>👤 Select Officer</h3>
                      <button onClick={() => setAssigningComplaintId(null)} style={styles.closeBtn}>✖</button>
                  </div>
                  <div style={{padding:'20px', maxHeight:'400px', overflowY:'auto'}}>
                      <p style={{fontSize:'0.9rem', color:'#666', marginBottom:'15px'}}>Assigning Report #{String(assigningComplaintId).slice(0,4)}</p>
                      
                      {/* Worker List Sorted by Load (Least Busy First) */}
                      {staffList
                        .sort((a,b) => getWorkerLoad(a.email) - getWorkerLoad(b.email))
                        .map(worker => {
                            const load = getWorkerLoad(worker.email);
                            const loadColor = load === 0 ? '#198754' : load < 5 ? '#ffc107' : '#dc3545';
                            return (
                                <div key={worker.id} style={styles.workerRow}>
                                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                                        <div style={styles.avatar}>{worker.full_name ? worker.full_name[0] : 'E'}</div>
                                        <div>
                                            <div style={{fontWeight:'bold'}}>{worker.full_name || 'Officer'}</div>
                                            <div style={{fontSize:'0.8rem', color:'#666'}}>{worker.email}</div>
                                        </div>
                                    </div>
                                    <div style={{textAlign:'right'}}>
                                        <span style={{fontSize:'0.75rem', fontWeight:'bold', color:loadColor, border:`1px solid ${loadColor}`, padding:'2px 6px', borderRadius:'4px', marginRight:'10px'}}>
                                            {load} Active Tasks
                                        </span>
                                        <button onClick={() => handleAssignWorker(worker.email)} style={styles.assignActionBtn}>Select</button>
                                    </div>
                                </div>
                            )
                        })
                      }
                      {staffList.length === 0 && <p style={{textAlign:'center', color:'#999'}}>No field officers found. Go to 'Staff' tab to promote users.</p>}
                  </div>
              </div>
          </div>
      )}

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
            <div style={styles.statsGrid}>
              <StatCard title="Total Complaints" value={stats.total} color="#007bff" icon="📂" />
              <StatCard title="Unassigned" value={stats.pending} color="#dc3545" icon="⚡" />
              <StatCard title="In Progress" value={stats.active} color="#ffc107" icon="🚧" />
              <StatCard title="Resolved" value={stats.resolved} color="#28a745" icon="✅" />
            </div>

            <div style={styles.dashboardSplit}>
              <div style={styles.card}>
                <h3 style={styles.cardHeader}>📠 System Audit Log</h3>
                <div style={styles.logContainer}>
                  {logs.map((log, i) => <div key={i} style={styles.logItem}><span style={styles.logTime}>[{log.time}]</span> <strong>{log.user}:</strong> {log.action}</div>)}
                </div>
              </div>
              <div style={styles.card}>
                <h3 style={styles.cardHeader}>📢 Public Broadcast</h3>
                <textarea rows="3" placeholder="Type alert message..." value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} style={styles.textarea} />
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
                   <button onClick={() => setShowUrgentOnly(!showUrgentOnly)} style={{...styles.actionBtn, background: showUrgentOnly ? '#dc3545' : 'white', color: showUrgentOnly ? 'white' : '#dc3545', border:'1px solid #dc3545'}}>⚠️ Hazard Filter</button>
                   <input placeholder="Search ID, Title..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput} />
                   <select onChange={e => setFilterStatus(e.target.value)} style={styles.filterSelect}><option value="All">All Status</option><option>Pending</option><option>Resolved</option></select>
                   <button onClick={handleExport} style={{...styles.actionBtn, background:'#198754'}}>📥 Export CSV</button>
                </div>
             </div>
             
             <div style={styles.complaintList}>
                {filteredComplaints.length === 0 ? <div style={{textAlign:'center', padding:'40px', color:'#999'}}>No matching complaints.</div> : 
                    filteredComplaints.map(c => {
                       const isUrgent = c.title.includes('⚠️');
                       return (
                           <div key={c.id} style={{...styles.complaintCard, borderLeft: isUrgent ? '5px solid #dc3545' : 'none'}}>
                              <div style={styles.complaintImage}>{c.image_url ? <img src={c.image_url} alt="Evidence" style={{width:'100%', height:'100%', objectFit:'cover'}} /> : <div style={styles.noImage}>No Image</div>}</div>
                              <div style={styles.complaintContent}>
                                 <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}>
                                     <div style={{display:'flex', gap:'10px'}}>
                                         <span style={{fontWeight:'bold', color:'#0056b3'}}>#{String(c.id).slice(0,6)}</span>
                                         {isUrgent && <span style={{background:'#dc3545', color:'white', fontSize:'0.7rem', padding:'1px 5px', borderRadius:'3px', fontWeight:'bold'}}>HAZARD</span>}
                                     </div>
                                     <span style={styles.statusBadge(c.status)}>{c.status.toUpperCase()}</span>
                                 </div>
                                 <h3 style={{margin:'0 0 5px', color:'#333'}}>{c.title.replace('⚠️ [URGENT] ', '')} <span style={styles.badge(c.category)}>{c.category}</span></h3>
                                 <p style={{color:'#666', fontSize:'0.9rem'}}>{c.description}</p>
                                 <div style={{marginBottom:'10px', fontSize:'0.8rem', color:'#555', cursor:'pointer'}} onClick={() => openMaps(c.location)}>📍 {c.location || 'No Location Data'}</div>
                                 
                                 <div style={styles.actionToolbar}>
                                    
                                    {/* Feature: The New "Assign" Button */}
                                    <div style={{display:'flex', alignItems:'center', gap:'5px', flex:1}}>
                                        <div style={{display:'flex', flexDirection:'column'}}>
                                            <span style={{fontSize:'0.75rem', color:'#888', fontWeight:'bold'}}>ASSIGNED TO:</span>
                                            <span style={{fontSize:'0.9rem', color: c.assigned_to ? '#333' : '#dc3545'}}>{c.assigned_to || "Unassigned"}</span>
                                        </div>
                                        <button onClick={() => setAssigningComplaintId(c.id)} style={styles.assignBtn}>
                                            {c.assigned_to ? '🔄 Reassign' : '👤 Assign Officer'}
                                        </button>
                                    </div>

                                    <div style={{borderLeft:'1px solid #ccc', paddingLeft:'15px', display:'flex', gap:'10px', alignItems:'center'}}>
                                        <select value={c.priority || "Normal"} onChange={(e) => updateComplaint(c.id, 'priority', e.target.value)} style={styles.prioritySelect}>
                                            <option>High</option><option>Medium</option><option>Normal</option>
                                        </select>
                                        <button onClick={() => handleDelete(c.id)} style={styles.iconBtn('red')} title="Reject">🗑</button>
                                    </div>
                                 </div>
                              </div>
                           </div>
                       )
                    })
                }
             </div>
          </div>
        )}

        {/* === TAB 3: USERS & STAFF === */}
        {activeTab === 'users' && (
          <div className="fade-in">
            <h2 style={styles.pageTitle}>User & Employee Management</h2>
            <div style={styles.card}>
              <h3 style={{margin:'0 0 15px', color:'#0056b3'}}>👮 Active Field Officers ({staffList.length})</h3>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Name</th><th style={styles.th}>Workload</th><th style={styles.th}>Action</th></tr></thead>
                <tbody>
                  {staffList.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}><strong>{u.full_name || u.email}</strong><br/><span style={{fontSize:'0.8rem', color:'#777'}}>{u.email}</span></td>
                      <td style={styles.td}>
                          <span style={{fontWeight:'bold', color: getWorkerLoad(u.email) > 4 ? 'red' : 'green'}}>{getWorkerLoad(u.email)} Active Tasks</span>
                      </td>
                      <td style={styles.td}><button onClick={() => toggleRole(u.id, u.role, u.email)} style={styles.demoteBtn}>⬇️ Demote</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div style={{height:'20px'}}></div>

            <div style={styles.card}>
              <h3 style={{margin:'0 0 15px', color:'#333'}}>👥 Citizens ({citizenList.length})</h3>
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

        {/* === TAB 4: ANALYTICS === */}
        {activeTab === 'analytics' && (
          <div className="fade-in">
             <h2 style={styles.pageTitle}>Reports & Analytics</h2>
             <div style={{display:'grid', gridTemplateColumns: '1fr 1fr', gap:'20px'}}>
                 <div style={styles.card}>
                    <h3 style={{textAlign:'center'}}>Category Distribution</h3>
                    <div style={{display:'flex', justifyContent:'center', margin:'30px 0'}}>
                        <div style={{
                            width: '200px', height: '200px', borderRadius: '50%', 
                            background: complaints.length ? `conic-gradient(${pieGradient})` : '#eee'
                        }}></div>
                    </div>
                    <div style={{display:'flex', justifyContent:'center', flexWrap:'wrap', gap:'10px'}}>
                        {categories.map((cat, i) => (
                            <div key={cat} style={{display:'flex', alignItems:'center', gap:'5px', fontSize:'0.8rem'}}>
                                <div style={{width:'10px', height:'10px', background: pieColors[i % pieColors.length], borderRadius:'50%'}}></div>
                                {cat}
                            </div>
                        ))}
                    </div>
                 </div>
                 <div style={styles.card}>
                    <h3>📊 Breakdown</h3>
                    <div style={{marginTop:'20px'}}>
                        {categories.map((cat, i) => {
                            const count = getCategoryCount(cat);
                            const width = complaints.length > 0 ? (count / complaints.length) * 100 : 0;
                            return (
                                <div key={cat} style={{marginBottom:'15px'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'5px'}}><span>{cat}</span><strong>{count}</strong></div>
                                    <div style={{width:'100%', background:'#eee', height:'10px', borderRadius:'5px', overflow:'hidden'}}><div style={{width: `${width}%`, background: pieColors[i % pieColors.length], height:'100%'}}></div></div>
                                </div>
                            );
                        })}
                    </div>
                 </div>
             </div>
          </div>
        )}

        {/* === TAB 5: SETTINGS === */}
        {activeTab === 'settings' && (
          <div className="fade-in">
             <h2 style={styles.pageTitle}>Configuration</h2>
             <div style={styles.card}>
                <h3>🏷️ Manage Categories</h3>
                <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
                    <input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="New Category Name..." style={{padding:'10px', border:'1px solid #ccc', borderRadius:'5px', flex:1}} />
                    <button onClick={() => { if(newCategory && !categories.includes(newCategory)){ setCategories([...categories, newCategory]); setNewCategory(''); addLog(`Added category: ${newCategory}`); }}} style={styles.actionBtn}>+ Add</button>
                </div>
                <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                    {categories.map(cat => (<span key={cat} style={{background:'#e9ecef', padding:'8px 15px', borderRadius:'20px', border:'1px solid #ddd'}}>{cat}</span>))}
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
  assignBtn: { padding: '8px 12px', background: '#0056b3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', marginLeft:'10px' },
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
  textarea: {width:'100%', padding:'10px', marginBottom:'10px', borderRadius:'5px', border:'1px solid #ccc'},
  
  complaintList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  complaintCard: { background: 'white', padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', alignItems: 'start' },
  complaintImage: { width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#eee' },
  noImage: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: '#777' },
  complaintContent: { flex: 1 },
  actionToolbar: { background: '#f8f9fa', padding: '10px', borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', justifyContent:'space-between' },

  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px', color: '#555', fontSize: '0.85rem', textAlign: 'left', background: '#f8f9fa', borderBottom: '2px solid #eee' },
  td: { padding: '12px', fontSize: '0.9rem', color: '#333', borderBottom: '1px solid #eee' },
  
  logContainer: { height: '300px', overflowY: 'auto', background: '#f8f9fa', padding: '10px', borderRadius: '5px', border: '1px solid #eee' },
  logItem: { fontSize: '0.85rem', marginBottom: '8px', borderBottom: '1px dashed #ddd', paddingBottom: '4px' },
  logTime: { fontFamily: 'monospace', color: '#0056b3', marginRight: '8px' },
  
  badge: (cat) => ({ background: '#e2e6ea', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: '#495057' }),
  roleBadge: (role) => ({ padding: '4px 10px', borderRadius: '12px', background: role==='employee'?'#17a2b8':'#6c757d', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }),
  statusBadge: (status) => ({ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', background: status==='Resolved'?'#d1e7dd':status==='Pending'?'#f8d7da':'#fff3cd', color: status==='Resolved'?'#0f5132':status==='Pending'?'#842029':'#664d03' }),

  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { width: '400px', background: 'white', borderRadius: '10px', boxShadow: '0 5px 20px rgba(0,0,0,0.2)', overflow:'hidden' },
  modalHeader: { background: '#f8f9fa', padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#666' },
  workerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f1f1f1' },
  avatar: { width: '40px', height: '40px', background: '#e2e6ea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#555' },
  assignActionBtn: { background: '#0d6efd', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }
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