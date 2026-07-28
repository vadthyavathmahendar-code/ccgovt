import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import ProfileModal from '../pages/Profile';
import { logAuditEvent } from '../utils/auditLogger';
import { createPortal } from 'react-dom';
import { useTheme } from '../context/useTheme';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import MapView from '../components/MapView';
import { borderRadius, shadows, typography, spacing } from '../styles/designTokens';

class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.warn("Map rendering error caught:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '12px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', fontSize: '0.8rem', border: '1px solid #fca5a5', marginTop: '5px' }}>
          ⚠️ Map visualization temporarily unavailable. You can still type your address manually above.
        </div>
      );
    }
    return this.props.children;
  }
}

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
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [mapLocation, setMapLocation] = useState(null);
  const fileInputRef = useRef(null);
  
  // Filter & UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  
  // Modals
  const [showProfile, setShowProfile] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null); 
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  
  // Feedback states
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  
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
    setSelectedComplaint((current) => {
      if (!current) return null;
      return all.find(c => c.id === current.id) || current;
    });

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
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      const userRole = profile?.role || 'citizen';
      if (['super_admin', 'dept_admin', 'commissioner'].includes(userRole)) {
        navigate('/admin-dashboard', { replace: true });
        return;
      } else if (userRole === 'employee') {
        navigate('/employee-dashboard', { replace: true });
        return;
      }

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
  const handleLocationSelected = (loc) => {
    setMapLocation(loc);
    setFormData(prev => ({ ...prev, location: loc.address }));
  };

  const validateFile = (file) => {
    if (!file) return false;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("❌ Invalid file type. Please upload a PNG, JPEG, or WEBP image.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("❌ File is too large. Photo evidence must be under 5MB.");
      return false;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file)); 
    } else if (e.target) {
      e.target.value = null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && validateFile(file)) {
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

        setUploadProgress(10);
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 90) return prev;
            return prev + 10;
          });
        }, 100);

        const { error: uploadError } = await supabase.storage.from('complaint_images').upload(filePath, image);
        clearInterval(progressInterval);
        if (uploadError) throw uploadError;
        setUploadProgress(100);

        const { data: urlData } = supabase.storage.from('complaint_images').getPublicUrl(filePath);
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
        status: 'Pending',
        priority: isUrgent ? 'High' : 'Medium',
        latitude: mapLocation ? mapLocation.latitude : null,
        longitude: mapLocation ? mapLocation.longitude : null
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

      toast.success("🎉 Report Logged Successfully!");
      setFormData({ title: '', desc: '', location: '', category: 'Roads' });
      setIsUrgent(false);
      setImage(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      setMapLocation(null);
      fetchHistory(user.id);
    } catch (err) {
      toast.error("Error logging report: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitFeedback = async () => {
    if (!selectedComplaint) return;
    try {
      const { error } = await supabase.from('complaint_feedback').insert([{
        complaint_id: selectedComplaint.id,
        rating_stars: feedbackRating,
        feedback_comments: feedbackComments,
        user_id: user.id
      }]);
      if (error) throw error;
      
      await logAuditEvent({
        userId: user.id,
        userRole: 'citizen',
        action: 'feedback_submitted',
        entityType: 'complaints',
        entityId: selectedComplaint.id,
        newData: { rating: feedbackRating, comments: feedbackComments },
        status: 'success'
      });
      
      toast.success("Thank you for your feedback! ⭐");
      setFeedbackComments('');
      setSelectedComplaint(null);
    } catch (err) {
      toast.error("Error submitting feedback: " + err.message);
    }
  };

  const reopenComplaint = async () => {
    if (!selectedComplaint) return;
    try {
      const { error } = await supabase.from('complaints').update({
        status: 'Pending',
        assigned_to: null,
        resolve_image_url: null
      }).eq('id', selectedComplaint.id);
      
      if (error) throw error;

      await logAuditEvent({
        userId: user.id,
        userRole: 'citizen',
        action: 'complaint_reopened',
        entityType: 'complaints',
        entityId: selectedComplaint.id,
        oldData: { status: selectedComplaint.status },
        newData: { status: 'Pending' },
        status: 'success'
      });

      toast.success("Issue Reopened successfully! 🚨");
      setSelectedComplaint(null);
      fetchHistory(user.id);
    } catch (err) {
      toast.error("Error reopening issue: " + err.message);
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
            <Button variant="danger" size="sm" onClick={() => setShowEmergencyModal(true)} style={{ fontWeight: 'bold' }}>
              🚨 Emergency SOS
            </Button>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Input
                  label="Location / Civic Address"
                  id="location-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter landmark or civic address"
                  required
                />
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: '-2px' }}>
                  Select Location on GIS Map
                </label>
                <MapErrorBoundary>
                  <MapView 
                    onLocationSelected={handleLocationSelected} 
                    initialLocation={mapLocation ? [mapLocation.latitude, mapLocation.longitude] : null}
                  />
                </MapErrorBoundary>
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
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${isDragging ? themeColors.primary : themeColors.border}`,
                    borderRadius: borderRadius.md,
                    padding: '20px',
                    textAlign: 'center',
                    background: isDragging ? themeColors.surfaceSecondary : themeColors.surface,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '10px'
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📸</div>
                  <p style={{ fontSize: typography.fontSize.sm, color: themeColors.textPrimary, margin: '0 0 4px 0', fontWeight: '550' }}>
                    {image ? image.name : 'Drag & drop your image here, or click to browse'}
                  </p>
                  <p style={{ fontSize: typography.fontSize.xs, color: themeColors.textSecondary, margin: 0 }}>
                    PNG, JPEG or WEBP (Max 5MB)
                  </p>
                </div>
                {previewUrl && (
                  <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px' }}>
                    <img src={previewUrl} alt="Upload preview" style={{ height: '80px', borderRadius: borderRadius.md, objectFit: 'cover', border: `1px solid ${themeColors.border}` }} />
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); setImage(null); setPreviewUrl(null); }}
                      style={{ position: 'absolute', top: '-5px', right: '-5px', background: themeColors.danger, color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      ✖
                    </button>
                  </div>
                )}
                {uploadProgress > 0 && (
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: typography.fontSize.xs, color: themeColors.textSecondary, marginBottom: '4px' }}>
                      <span>Uploading evidence...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div style={{ width: '100%', background: themeColors.border, height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${uploadProgress}%`, background: themeColors.primary, height: '100%', transition: 'width 0.1s ease' }} />
                    </div>
                  </div>
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
          <div style={{ background: themeColors.surface, padding: '24px', borderRadius: borderRadius.lg, maxWidth: '500px', width: '100%', boxShadow: shadows.lg, color: themeColors.textPrimary }}>
            <h3 style={{ margin: '0 0 10px', fontSize: typography.fontSize.xl }}>Report #{String(selectedComplaint.id).slice(0, 8)}</h3>
            <p><strong>Title:</strong> {selectedComplaint.title}</p>
            <p><strong>Category:</strong> {selectedComplaint.category}</p>
            <p><strong>Status:</strong> <Badge status={getStatusBadgeType(selectedComplaint.status)}>{selectedComplaint.status}</Badge></p>
            <p><strong>Location:</strong> {selectedComplaint.location}</p>
            <p><strong>Description:</strong> {selectedComplaint.description || 'N/A'}</p>
            {selectedComplaint.image_url && (
              <img src={selectedComplaint.image_url} alt="Evidence" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: borderRadius.md, marginTop: '10px' }} />
            )}

            {/* FEEDBACK & REOPEN WORKFLOW PANEL */}
            {['Resolved', 'Rejected'].includes(selectedComplaint.status) && (
              <div style={{ marginTop: '20px', padding: '15px', background: themeColors.surfaceSecondary, borderRadius: borderRadius.md, border: `1px solid ${themeColors.border}` }}>
                <h4 style={{ margin: '0 0 8px', fontSize: typography.fontSize.sm, fontWeight: 'bold' }}>Resolution Feedback & Action</h4>
                
                {/* Rating Input */}
                <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: typography.fontSize.xs }}>Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: star <= feedbackRating ? '#fbbf24' : '#cbd5e1' }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  placeholder="Tell us what you think of the resolution..."
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: borderRadius.sm, border: `1px solid ${themeColors.border}`, fontSize: '0.8rem', background: themeColors.surface, color: themeColors.textPrimary, resize: 'none', marginBottom: '10px' }}
                  rows={2}
                />

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="primary" size="sm" onClick={submitFeedback}>
                    Submit Rating
                  </Button>
                  <Button variant="outline" size="sm" onClick={reopenComplaint} style={{ color: themeColors.danger, borderColor: themeColors.danger }}>
                    Reopen Issue
                  </Button>
                </div>
              </div>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>Close</Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* EMERGENCY SOS MODAL */}
      {showEmergencyModal && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1060, padding: '20px' }}>
          <div style={{ background: themeColors.surface, padding: '24px', borderRadius: borderRadius.lg, maxWidth: '450px', width: '100%', boxShadow: shadows.lg, color: themeColors.textPrimary }}>
            <h3 style={{ margin: '0 0 10px', fontSize: typography.fontSize.xl, color: themeColors.danger }}>🚨 Emergency SOS Response Panel</h3>
            <p style={{ fontSize: typography.fontSize.sm, color: themeColors.textSecondary, marginBottom: '20px' }}>
              If there is an active life-safety hazard, chemical spill, fire, or collapse, call the emergency control rooms immediately:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: themeColors.surfaceSecondary, borderRadius: borderRadius.md }}>
                <strong>🔥 Fire & Rescue Services</strong>
                <a href="tel:101" style={{ color: themeColors.primary, fontWeight: 'bold' }}>Dial 101</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: themeColors.surfaceSecondary, borderRadius: borderRadius.md }}>
                <strong>🚑 Ambulance & Medical</strong>
                <a href="tel:108" style={{ color: themeColors.primary, fontWeight: 'bold' }}>Dial 108</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: themeColors.surfaceSecondary, borderRadius: borderRadius.md }}>
                <strong>🏛️ Municipal Disaster Control Room</strong>
                <a href="tel:04021111111" style={{ color: themeColors.primary, fontWeight: 'bold' }}>Dial 040-21111111</a>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Button variant="primary" size="sm" onClick={() => {
                logAuditEvent({
                  userId: user?.id || null,
                  userRole: 'citizen',
                  action: 'emergency_sos_triggered',
                  entityType: 'system',
                  status: 'success'
                });
                setShowEmergencyModal(false);
                toast.success("Emergency logged. Help is on the way!");
              }}>
                Acknowledge & Close
              </Button>
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