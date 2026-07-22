import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../pages/Profile';
import { logAuditEvent } from '../utils/auditLogger';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/useTheme';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { borderRadius, shadows, typography, spacing } from '../styles/designTokens';

const UserDashboard = () => {
  const { themeColors } = useTheme();

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

  // --- DATA FETCHING & HELPERS ---
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

  // --- INITIALIZATION ---
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return navigate('/');
      setUser(session.user);
      fetchHistory(session.user.id);
      fetchBroadcasts(); 
    };
    checkUser();

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

  // --- ACTIONS ---
  const handleGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(pos => {
        setFormData(prev => ({ ...prev, location: `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)}` }));
      });
    } else {
      alert("GPS not supported");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let publicImageUrl = null;

    try {
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        const filePath = `user_uploads/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('complaints').upload(filePath, image);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('complaints').getPublicUrl(filePath);
        publicImageUrl = urlData.publicUrl;
      }

      const { data: insertedData, error: dbError } = await supabase.from('complaints').insert([{
        user_id: user.id,
        title: formData.title,
        description: formData.desc,
        category: formData.category,
        location: formData.location,
        image_url: publicImageUrl,
        is_urgent: isUrgent, 
        status: 'Pending'
      }]).select();

      if (dbError) throw dbError;

      const createdComplaint = insertedData?.[0];
      if (createdComplaint) {
        await logAuditEvent({
          userId: user.id,
          userRole: 'citizen',
          action: 'complaint_created',
          entityType: 'complaints',
          entityId: createdComplaint.id,
          newData: createdComplaint,
          status: 'success'
        });
      }

      alert("🎉 Report Logged Successfully!");
      setFormData({ title: '', desc: '', location: '', category: 'Roads' });
      setIsUrgent(false);
      setImage(null);
      setPreviewUrl(null);
      fetchHistory(user.id);
    } catch (err) {
      alert("Error logging report: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering Logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeType = (st) => {
    if (st === 'Resolved') return 'success';
    if (st === 'Rejected') return 'danger';
    if (['Assigned', 'In Progress'].includes(st)) return 'warning';
    return 'info';
  };

  return (
    <div style={{ background: themeColors.background, minHeight: '100vh', padding: '30px 20px', color: themeColors.textPrimary }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* TOP DASHBOARD HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.extrabold }}>Citizen Command Center</h1>
            <p style={{ margin: '4px 0 0', color: themeColors.textSecondary, fontSize: typography.fontSize.sm }}>
              Report issues, monitor resolution SLAs, and track live status.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Button variant="outline" size="sm" onClick={() => setShowNotifications(!showNotifications)}>
              🔔 Notifications {unreadCount > 0 && <span style={{ background: themeColors.danger, color: '#fff', padding: '2px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>{unreadCount}</span>}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowProfile(true)}>
              👤 View Profile
            </Button>
          </div>
        </div>

        {/* NOTIFICATIONS PANEL */}
        {showNotifications && (
          <Card style={{ marginBottom: '25px', borderColor: themeColors.primary }}>
            <h4 style={{ margin: '0 0 10px', fontSize: typography.fontSize.base, color: themeColors.textPrimary }}>Live Activity Alerts</h4>
            {notifications.length === 0 ? (
              <p style={{ fontSize: typography.fontSize.xs, color: themeColors.textSecondary }}>No new alerts.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: '8px 12px', background: themeColors.surfaceSecondary, borderRadius: borderRadius.sm, fontSize: typography.fontSize.xs }}>
                    {n.msg}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* STATS METRICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
          <MetricCard title="Total Issues Logged" count={stats.total} icon="📋" color={themeColors.primary} />
          <MetricCard title="Pending Triage" count={stats.pending} icon="⏳" color={themeColors.warning} />
          <MetricCard title="Work In Progress" count={stats.inProgress} icon="⚙️" color={themeColors.info} />
          <MetricCard title="Resolved Issues" count={stats.resolved} icon="✅" color={themeColors.secondary} />
        </div>

        {/* MAIN DASHBOARD CONTENT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px', alignItems: 'start' }}>
          
          {/* LEFT: SUBMIT REPORT FORM */}
          <Card title="📢 Report Civic Issue" subtitle="File a ticket for municipal response">
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Issue Title"
                id="issue-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Broken streetlight near Main Gate"
                required
              />

              <Select
                label="Category"
                id="category-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                options={[
                  { label: 'Roads & Potholes', value: 'Roads' },
                  { label: 'Water Supply & Sewage', value: 'Water' },
                  { label: 'Electricity & Streetlights', value: 'Electricity' },
                  { label: 'Sanitation & Garbage', value: 'Garbage' },
                  { label: 'Drainage Overflow', value: 'Drainage' },
                  { label: 'Public Parks', value: 'Parks' },
                ]}
              />

              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Location / Civic Address"
                    id="location-input"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Enter landmark or civic address"
                    required
                  />
                </div>
                <Button variant="outline" size="md" onClick={handleGPS} type="button">
                  📍 GPS
                </Button>
              </div>

              <Textarea
                label="Detailed Description"
                id="issue-desc"
                value={formData.desc}
                onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                placeholder="Describe the condition, safety hazard, or urgency..."
                rows={3}
              />

              <div>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: '6px' }}>
                  Upload Photo Evidence
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ fontSize: typography.fontSize.xs }}
                />
                {previewUrl && (
                  <img src={previewUrl} alt="Upload preview" style={{ marginTop: '10px', height: '80px', borderRadius: borderRadius.md, objectFit: 'cover' }} />
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="urgent-check"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                />
                <label htmlFor="urgent-check" style={{ fontSize: typography.fontSize.sm, color: themeColors.danger, fontWeight: '700' }}>
                  ⚠️ Flag as Urgent Hazardous Risk
                </label>
              </div>

              <Button type="submit" variant="primary" loading={submitting} fullWidth>
                🚀 Submit Report to Municipal Office
              </Button>
            </form>
          </Card>

          {/* RIGHT: LIVE COMPLAINTS HISTORY */}
          <Card title="📜 My Reported Issues" subtitle="Track real-time progress and resolutions">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <Input
                  id="search-complaints"
                  placeholder="🔍 Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { label: 'All Statuses', value: 'All' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'In Progress', value: 'In Progress' },
                  { label: 'Resolved', value: 'Resolved' },
                  { label: 'Rejected', value: 'Rejected' },
                ]}
              />
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Skeleton height="60px" />
                <Skeleton height="60px" />
                <Skeleton height="60px" />
              </div>
            ) : filteredComplaints.length === 0 ? (
              <EmptyState title="No Issues Found" description="You have not filed any reports matching this filter." />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredComplaints.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedComplaint(item)}
                    style={{
                      background: themeColors.surfaceSecondary,
                      padding: '16px',
                      borderRadius: borderRadius.md,
                      border: `1px solid ${themeColors.borderLight}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: typography.fontSize.base }}>{item.title}</strong>
                        {item.is_urgent && <Badge status="danger">URGENT</Badge>}
                      </div>
                      <p style={{ margin: 0, fontSize: typography.fontSize.xs, color: themeColors.textSecondary }}>
                        📍 {item.location || 'Municipal Area'} • Logged: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <Badge status={getStatusBadgeType(item.status)}>{item.status}</Badge>
                      {item.servicenow_ticket_number && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: themeColors.info, marginTop: '4px' }}>
                          🎫 {item.servicenow_ticket_number}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* MODALS */}
      {showProfile && <ProfileModal isOpen={showProfile} onClose={() => setShowProfile(false)} />}

      {selectedComplaint && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050, padding: '20px' }}>
          <div style={{ background: themeColors.surface, padding: '24px', borderRadius: borderRadius.lg, maxWidth: '500px', width: '100%', boxShadow: shadows.lg }}>
            <h3 style={{ margin: '0 0 10px', fontSize: typography.fontSize.xl }}>Report #{String(selectedComplaint.id).slice(0, 8)}</h3>
            <p><strong>Title:</strong> {selectedComplaint.title}</p>
            <p><strong>Category:</strong> {selectedComplaint.category}</p>
            <p><strong>Status:</strong> <Badge status={getStatusBadgeType(selectedComplaint.status)}>{selectedComplaint.status}</Badge></p>
            <p><strong>Location:</strong> {selectedComplaint.location}</p>
            <p><strong>Description:</strong> {selectedComplaint.description || 'N/A'}</p>
            {selectedComplaint.image_url && (
              <img src={selectedComplaint.image_url} alt="Evidence" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: borderRadius.md, marginTop: '10px' }} />
            )}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button variant="primary" size="sm" onClick={() => setSelectedComplaint(null)}>Close</Button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

const MetricCard = ({ title, count, icon, color }) => {
  const { themeColors } = useTheme();
  return (
    <div style={{
      background: themeColors.surface,
      padding: spacing.lg,
      borderRadius: borderRadius.lg,
      boxShadow: shadows.md,
      border: `1px solid ${themeColors.borderLight}`,
      display: 'flex',
      alignItems: 'center',
      gap: spacing.md,
    }}>
      <div style={{ fontSize: '2.2rem', padding: '10px', borderRadius: borderRadius.md, background: themeColors.surfaceSecondary }}>
        {icon}
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.8rem', fontWeight: typography.fontWeight.extrabold, color }}>{count}</h3>
        <p style={{ margin: '2px 0 0', fontSize: typography.fontSize.xs, color: themeColors.textSecondary, fontWeight: typography.fontWeight.medium }}>{title}</p>
      </div>
    </div>
  );
};

export default UserDashboard;