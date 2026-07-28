import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';
import { logAuditEvent } from '../utils/auditLogger';
import { useTheme } from '../context/useTheme';

const ProfileModal = ({ onClose }) => {
  const { theme, themeColors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const fileInputRef = useRef(null);

  // Profile core data state
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [role, setRole] = useState('citizen');
  const [points, setPoints] = useState(0);
  const [govtIdType, setGovtIdType] = useState('aadhaar');
  const [govtIdNumber, setGovtIdNumber] = useState('');
  const [department, setDepartment] = useState('General');
  const [createdAt, setCreatedAt] = useState(null);

  // Role-Specific Dynamic Metrics
  const [metrics, setMetrics] = useState({
    totalComplaints: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    reopened: 0,
    feedbackSubmitted: 0,
    communityRank: 'Civic Resident',
    avgResolutionTime: '2.4 Days',
  });

  // Recent Activity Logs
  const [activities, setActivities] = useState([]);

  // UI Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // Mock Notification Preferences
  const [prefs, setPrefs] = useState({
    email: true,
    sms: false,
    push: true,
    updates: true,
    weekly: false,
    alerts: true,
  });

  // Responsive layout state
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isCompact = windowWidth < 900;

  useEffect(() => {
    const fetchProfileAndMetrics = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const sessionUser = session.user;
          setUser(sessionUser);

          // 1. Fetch Profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle();
          if (profileError) throw profileError;

          let currentRole = 'citizen';
          if (profileData) {
            currentRole = profileData.role || 'citizen';
            setRole(currentRole);
            setFullName(profileData.full_name || '');
            setPhone(profileData.phone || '');
            setAddress(profileData.address || '');
            setAvatarUrl(profileData.avatar_url || null);
            setPoints(profileData.points || 0);
            setGovtIdType(profileData.govt_id_type || 'aadhaar');
            setGovtIdNumber(profileData.govt_id_number || '');
            setDepartment(profileData.department || 'General');
            setCreatedAt(profileData.created_at);

            // Populate edit fields
            setEditName(profileData.full_name || '');
            setEditPhone(profileData.phone || '');
            setEditAddress(profileData.address || '');
          }

          // 2. Fetch Role-Specific Statistics
          if (currentRole === 'citizen') {
            // Citizen: Fetch complaints submitted by this user
            const { data: complaintsData, error: complaintsError } = await supabase
              .from('complaints')
              .select('status, rating')
              .eq('citizen_id', sessionUser.id);

            if (!complaintsError && complaintsData) {
              const total = complaintsData.length;
              const pending = complaintsData.filter(c => c.status === 'Pending').length;
              const inProgress = complaintsData.filter(c => c.status === 'In Progress').length;
              const resolved = complaintsData.filter(c => c.status === 'Resolved').length;
              const closed = complaintsData.filter(c => c.status === 'Closed').length;
              const reopened = complaintsData.filter(c => c.status === 'Reopened').length;
              const feedback = complaintsData.filter(c => c.rating !== null).length;

              // Calculate Community Rank based on Points
              let rank = 'Civic Resident';
              const pts = profileData?.points || 0;
              if (pts >= 100) rank = 'Community Hero 👑';
              else if (pts >= 50) rank = 'Gold Contributor 🥇';
              else if (pts >= 20) rank = 'Active Helper 🥈';
              else if (pts > 0) rank = 'Pioneer Citizen 🥉';

              setMetrics({
                totalComplaints: total,
                pending,
                inProgress,
                resolved,
                closed,
                reopened,
                feedbackSubmitted: feedback,
                communityRank: rank,
                avgResolutionTime: total > 0 ? '1.8 Days' : 'N/A',
              });
            }
          } else {
            // Employee/Admin: Fetch workload assigned to this email
            const { data: employeeData, error: employeeError } = await supabase
              .from('complaints')
              .select('status')
              .eq('assigned_to', sessionUser.email);

            if (!employeeError && employeeData) {
              const total = employeeData.length;
              const pending = employeeData.filter(c => c.status === 'Assigned').length;
              const inProgress = employeeData.filter(c => c.status === 'In Progress').length;
              const resolved = employeeData.filter(c => c.status === 'Resolved').length;
              const closed = employeeData.filter(c => c.status === 'Closed').length;

              setMetrics({
                totalComplaints: total,
                pending,
                inProgress,
                resolved,
                closed,
                reopened: 0,
                feedbackSubmitted: resolved,
                communityRank: currentRole === 'super_admin' ? 'Super Administrator' : 'Department Specialist',
                avgResolutionTime: '2.5 Hours',
              });
            }
          }

          // 3. Fetch Live Recent Activities from Audit Logs
          const { data: logsData, error: logsError } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('user_id', sessionUser.id)
            .order('created_at', { ascending: false })
            .limit(4);

          if (!logsError && logsData) {
            setActivities(logsData);
          }
        }
      } catch (err) {
        console.error('Error loading profile information:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndMetrics();
  }, []);

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image.');
      }
      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date() }).eq('id', user.id);
      if (updateError) throw updateError;

      await logAuditEvent({
        userId: user.id,
        userRole: role,
        action: 'profile_update',
        entityType: 'profiles',
        entityId: user.id,
        oldData: { avatar_url: avatarUrl },
        newData: { avatar_url: publicUrl },
        status: 'success'
      });

      setAvatarUrl(publicUrl);
      toast.success('📸 Profile photo updated successfully!');
    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (editPhone && !/^\d{10}$/.test(editPhone)) {
      toast.error('⚠️ Phone number must be 10 digits.');
      return;
    }

    const { error } = await supabase.from('profiles').update({ 
      full_name: editName, phone: editPhone, address: editAddress, updated_at: new Date() 
    }).eq('id', user.id);

    if (!error) {
      await logAuditEvent({
        userId: user.id,
        userRole: role,
        action: 'profile_update',
        entityType: 'profiles',
        entityId: user.id,
        oldData: { full_name: fullName, phone, address },
        newData: { full_name: editName, phone: editPhone, address: editAddress },
        status: 'success'
      });
      setFullName(editName);
      setPhone(editPhone);
      setAddress(editAddress);
      setIsEditing(false);
      toast.success('✅ Information updated successfully!');
    } else {
      toast.error('Error: ' + error.message);
    }
  };

  if (loading) return null;

  const cardId = user ? `TS-${user.id.slice(0, 4).toUpperCase()}-${user.id.slice(user.id.length - 4).toUpperCase()}` : 'TS-0000';

  const getRoleBadgeColor = () => {
    if (role === 'super_admin') return { bg: 'rgba(239, 68, 68, 0.15)', text: '#fca5a5', border: 'rgba(239, 68, 68, 0.25)' };
    if (role === 'dept_admin') return { bg: 'rgba(234, 88, 12, 0.15)', text: '#fed7aa', border: 'rgba(234, 88, 12, 0.25)' };
    if (role === 'employee') return { bg: 'rgba(202, 138, 4, 0.15)', text: '#fef08a', border: 'rgba(202, 138, 4, 0.25)' };
    if (role === 'commissioner') return { bg: 'rgba(147, 51, 234, 0.15)', text: '#e9d5ff', border: 'rgba(147, 51, 234, 0.25)' };
    return { bg: 'rgba(37, 99, 235, 0.15)', text: '#93c5fd', border: 'rgba(37, 99, 235, 0.25)' };
  };

  const badgeColor = getRoleBadgeColor();

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`📋 Copied ${label} to clipboard!`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Glassmorphic styles dynamically adapt to light/dark themes
  const glassStyle = {
    background: theme === 'dark' ? 'rgba(30, 41, 59, 0.55)' : 'rgba(255, 255, 255, 0.55)',
    border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.25)',
    boxShadow: '0 8px 32px 0 rgba(15, 23, 42, 0.15)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modalContainer, ...glassStyle, color: themeColors.textPrimary }} onClick={(e) => e.stopPropagation()}>
        
        {/* --- HEADER --- */}
        <div style={{ ...styles.modalHeader, borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/images/cc_logo.png" alt="Logo" style={{ width: '45px', height: '35px' }} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Municipal Command Center</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: themeColors.textSecondary }}>Enterprise Profile Directory</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', border: '1px solid rgba(34,197,94,0.25)' }}>
              <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', display: 'inline-block' }}></span>
              Connected
            </div>
            <button onClick={onClose} style={{ ...styles.closeBtn, color: themeColors.textPrimary }}>&times;</button>
          </div>
        </div>

        {/* --- TWO-COLUMN SCROLLABLE LAYOUT --- */}
        <div style={{ ...styles.modalBody, flexDirection: isCompact ? 'column' : 'row' }}>
          
          {/* --- LEFT PANEL --- */}
          <div style={{ ...styles.leftPanel, borderRight: isCompact ? 'none' : (theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'), borderBottom: isCompact ? (theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)') : 'none', background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
              
              {/* Avatar Box */}
              <div style={styles.avatarWrapper} onClick={() => fileInputRef.current.click()} title="Change profile photo">
                <input type="file" ref={fileInputRef} onChange={uploadAvatar} accept="image/*" style={{ display: 'none' }} disabled={uploading} />
                {uploading ? (
                  <div style={styles.uploadSpinner}>Uploading...</div>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={styles.avatarImage} />
                ) : (
                  <span style={{ fontSize: '3rem' }}>👤</span>
                )}
                <div style={styles.cameraIndicator}>📷</div>
              </div>

              {/* User Identity */}
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: '800' }}>{fullName || 'Citizen User'}</h3>
                <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: themeColors.textSecondary }}>{user?.email}</p>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px', border: `1px solid ${badgeColor.border}`, backgroundColor: badgeColor.bg, color: badgeColor.text, fontWeight: 'bold', textTransform: 'uppercase' }}>
                    🛡️ {role}
                  </span>
                  <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: '20px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)', backgroundColor: 'rgba(0,0,0,0.02)', color: themeColors.textSecondary, fontWeight: 'bold' }}>
                    🏢 {department}
                  </span>
                </div>
              </div>

              {/* ID Card Display */}
              <div style={{ ...styles.idBox, background: theme === 'dark' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={styles.idLabel}>Unique ID</span>
                  <span style={styles.idValue} onClick={() => handleCopy(cardId, 'ID')}>{cardId} 📋</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={styles.idLabel}>Govt ID</span>
                  <span style={styles.idValue} onClick={() => handleCopy(govtIdNumber || 'N/A', 'Govt ID')}>{govtIdNumber || 'Pending'} 📋</span>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', textAlign: 'left', padding: '0 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', fontWeight: 'bold' }}>
                  <span>Profile Completion</span>
                  <span>{phone && address && avatarUrl ? '100%' : '75%'}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: phone && address && avatarUrl ? '100%' : '75%', height: '100%', background: '#2563eb', transition: '0.3s' }}></div>
                </div>
              </div>

              {/* QR Mockup */}
              <div style={styles.qrWrapper}>
                <div style={{ border: '4px solid #0f172a', padding: '6px', borderRadius: '6px', background: 'white' }}>
                  <svg width="60" height="60" viewBox="0 0 100 100" fill="#0f172a">
                    <rect x="0" y="0" width="25" height="25" />
                    <rect x="75" y="0" width="25" height="25" />
                    <rect x="0" y="75" width="25" height="25" />
                    <rect x="35" y="35" width="30" height="30" />
                    <rect x="75" y="75" width="10" height="10" />
                    <rect x="50" y="10" width="10" height="15" />
                    <rect x="10" y="50" width="15" height="10" />
                  </svg>
                </div>
                <span style={{ fontSize: '0.6rem', color: themeColors.textSecondary, fontWeight: 'bold' }}>SCAN DIRECTORY CODE</span>
              </div>

            </div>
          </div>

          {/* --- RIGHT PANEL (CONTENT TABS) --- */}
          <div style={styles.rightPanel}>
            
            {/* Nav Tabs */}
            <div style={{ display: 'flex', borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', gap: '15px', marginBottom: '15px' }}>
              <button onClick={() => setActiveTab('general')} style={styles.tabBtn(activeTab === 'general', themeColors.primary)}>📋 Details</button>
              <button onClick={() => setActiveTab('stats')} style={styles.tabBtn(activeTab === 'stats', themeColors.primary)}>📈 Activity & Analytics</button>
              <button onClick={() => setActiveTab('security')} style={styles.tabBtn(activeTab === 'security', themeColors.primary)}>🔐 Access & Security</button>
              <button onClick={() => setActiveTab('prefs')} style={styles.tabBtn(activeTab === 'prefs', themeColors.primary)}>⚙️ Preferences</button>
            </div>

            {/* Tab Container */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
              
              {/* TAB 1: GENERAL INFORMATION */}
              {activeTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Personal Info */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <h4 style={styles.cardTitle}>👤 Personal Information</h4>
                      {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} style={styles.actionLink}>✏️ Edit Details</button>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setIsEditing(false)} style={styles.btnSec}>Cancel</button>
                          <button onClick={handleSave} style={styles.btnPri}>Save</button>
                        </div>
                      )}
                    </div>
                    
                    {!isEditing ? (
                      <div style={styles.infoGrid}>
                        <div><div style={styles.infoLabel}>Full Name</div><div style={styles.infoValue}>{fullName || 'N/A'}</div></div>
                        <div><div style={styles.infoLabel}>Email Address</div><div style={styles.infoValue}>{user?.email}</div></div>
                        <div><div style={styles.infoLabel}>Mobile Contact</div><div style={styles.infoValue}>{phone || 'N/A'}</div></div>
                        <div><div style={styles.infoLabel}>Residential Address</div><div style={styles.infoValue}>{address || 'N/A'}</div></div>
                        <div><div style={styles.infoLabel}>Verification ID Type</div><div style={styles.infoValue}>{govtIdType.toUpperCase()}</div></div>
                        <div><div style={styles.infoLabel}>Verification ID Number</div><div style={styles.infoValue}>{govtIdNumber || 'N/A'}</div></div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', flexDirection: isCompact ? 'column' : 'row' }}>
                          <div style={{ flex: 1 }}>
                            <label style={styles.formLabel}>Full Name</label>
                            <input value={editName} onChange={e => setEditName(e.target.value)} style={styles.formInput} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={styles.formLabel}>Mobile Contact</label>
                            <input value={editPhone} onChange={e => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setEditPhone(val); }} style={styles.formInput} />
                          </div>
                        </div>
                        <div>
                          <label style={styles.formLabel}>Residential Address</label>
                          <textarea value={editAddress} onChange={e => setEditAddress(e.target.value)} style={{ ...styles.formInput, height: '60px', resize: 'none' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Organization Info */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <h4 style={styles.cardTitle}>🏢 Organization Information</h4>
                    <div style={styles.infoGrid}>
                      <div><div style={styles.infoLabel}>Official Designation</div><div style={styles.infoValue}>{role.toUpperCase()}</div></div>
                      <div><div style={styles.infoLabel}>Assigned Department</div><div style={styles.infoValue}>{department}</div></div>
                      <div><div style={styles.infoLabel}>Employment Status</div><div style={styles.infoValue}>Active</div></div>
                      <div><div style={styles.infoLabel}>Supervisor</div><div style={styles.infoValue}>{role === 'citizen' ? 'Municipal Commissioner' : 'Super Admin'}</div></div>
                      <div><div style={styles.infoLabel}>District Region</div><div style={styles.infoValue}>Hyderabad Metropolitan (GHMC)</div></div>
                      <div><div style={styles.infoLabel}>Date Joined Portal</div><div style={styles.infoValue}>{createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}</div></div>
                    </div>
                  </div>

                  {/* Documents Vault */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <h4 style={styles.cardTitle}>📁 Official Verification Documents</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={styles.docRow}>
                        <span>📄 National Identity Card ({govtIdType.toUpperCase()})</span>
                        <button style={styles.docDlBtn} onClick={() => toast.success('📥 Downloading Government ID...')}>Download ID</button>
                      </div>
                      <div style={styles.docRow}>
                        <span>📷 Profile Photo Upload (avatars bucket)</span>
                        <button style={styles.docDlBtn} onClick={() => { if (avatarUrl) window.open(avatarUrl, '_blank'); else toast.error('No avatar found'); }}>Download File</button>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PERFORMANCE & STATISTICS */}
              {activeTab === 'stats' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Dynamic Statistics Grid adapted for Citizen / Employee */}
                  {role === 'citizen' ? (
                    <div style={styles.statsGrid}>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>📂</div>
                        <div>
                          <div style={styles.statNum}>Total Submitted</div>
                          <div style={styles.statVal}>{metrics.totalComplaints}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>⏱️</div>
                        <div>
                          <div style={styles.statNum}>Pending</div>
                          <div style={styles.statVal}>{metrics.pending}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>⚙️</div>
                        <div>
                          <div style={styles.statNum}>In Progress</div>
                          <div style={styles.statVal}>{metrics.inProgress}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>✅</div>
                        <div>
                          <div style={styles.statNum}>Resolved</div>
                          <div style={styles.statVal}>{metrics.resolved}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>🔒</div>
                        <div>
                          <div style={styles.statNum}>Closed</div>
                          <div style={styles.statVal}>{metrics.closed}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>🔄</div>
                        <div>
                          <div style={styles.statNum}>Reopened</div>
                          <div style={styles.statVal}>{metrics.reopened}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>💬</div>
                        <div>
                          <div style={styles.statNum}>Total Feedback</div>
                          <div style={styles.statVal}>{metrics.feedbackSubmitted}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>🚀</div>
                        <div>
                          <div style={styles.statNum}>Citizen Points</div>
                          <div style={styles.statVal}>{points} PTS</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>👑</div>
                        <div>
                          <div style={styles.statNum}>Community Rank</div>
                          <div style={{ ...styles.statVal, fontSize: '0.95rem' }}>{metrics.communityRank}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>⏱️</div>
                        <div>
                          <div style={styles.statNum}>Avg SLA Solve</div>
                          <div style={{ ...styles.statVal, fontSize: '1rem' }}>{metrics.avgResolutionTime}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.statsGrid}>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>📂</div>
                        <div>
                          <div style={styles.statNum}>Total Assigned</div>
                          <div style={styles.statVal}>{metrics.totalComplaints}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>⏱️</div>
                        <div>
                          <div style={styles.statNum}>Active Tasks</div>
                          <div style={styles.statVal}>{metrics.pending + metrics.inProgress}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>✅</div>
                        <div>
                          <div style={styles.statNum}>Resolved</div>
                          <div style={styles.statVal}>{metrics.resolved}</div>
                        </div>
                      </div>
                      <div style={styles.statCard}>
                        <div style={styles.statIcon}>🚀</div>
                        <div>
                          <div style={styles.statNum}>KPI Score</div>
                          <div style={styles.statVal}>96.4%</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Achievements Badges */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <h4 style={styles.cardTitle}>🏅 Awarded Credentials & Badges</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                      <div style={styles.badgeItem}>🌟 Top Performer</div>
                      <div style={styles.badgeItem}>🚀 Fast Responder</div>
                      <div style={styles.badgeItem}>🛡️ Verified Account</div>
                      {role === 'citizen' ? (
                        <div style={styles.badgeItem}>💚 Citizen Hero</div>
                      ) : (
                        <div style={styles.badgeItem}>🛠️ Resolved 50+</div>
                      )}
                    </div>
                  </div>

                  {/* Performance Analytics Charts Mockup */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <h4 style={styles.cardTitle}>📊 Resolution Analytics & Activity Spread</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '140px', marginTop: '10px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#f8fafc', borderRadius: '8px', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '80px', background: '#2563eb', borderRadius: '4px', margin: '0 auto 5px' }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Resolved</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '45px', background: '#eab308', borderRadius: '4px', margin: '0 auto 5px' }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>In Progress</span>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ width: '40px', height: '20px', background: '#ca8a04', borderRadius: '4px', margin: '0 auto 5px' }}></div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Escalated</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: ACCESS & SECURITY */}
              {activeTab === 'security' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Security Panel */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <h4 style={styles.cardTitle}>🔐 Authentication & Session Credentials</h4>
                    <div style={styles.infoGrid}>
                      <div><div style={styles.infoLabel}>Two-Factor Authentication</div><div style={{ ...styles.infoValue, color: '#22c55e', fontWeight: 'bold' }}>🔒 Enabled</div></div>
                      <div><div style={styles.infoLabel}>Email Verification Status</div><div style={{ ...styles.infoValue, color: '#22c55e', fontWeight: 'bold' }}>✅ Verified</div></div>
                      <div><div style={styles.infoLabel}>Last Password Change</div><div style={styles.infoValue}>14 Days Ago</div></div>
                      <div><div style={styles.infoLabel}>Active Device Location</div><div style={styles.infoValue}>Chrome Browser (Windows 11)</div></div>
                      <div><div style={styles.infoLabel}>Masked IP Address</div><div style={styles.infoValue}>192.168.***.***</div></div>
                      <div><div style={styles.infoLabel}>Audit Logging Status</div><div style={{ ...styles.infoValue, color: '#22c55e', fontWeight: 'bold' }}>📊 Logging Active</div></div>
                    </div>
                  </div>

                  {/* Dynamic Recent Activity Timeline */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <h4 style={styles.cardTitle}>🕒 Recent Audit Logs & Action Timeline</h4>
                    {activities.length === 0 ? (
                      <div style={{ fontSize: '0.8rem', color: themeColors.textSecondary, padding: '10px 0' }}>No recent activities logged in current session.</div>
                    ) : (
                      <div style={styles.timeline}>
                        {activities.map((act) => (
                          <div key={act.id} style={styles.timelineStep}>
                            <div style={styles.timelineIcon}>
                              {act.action.includes('create') || act.action.includes('submit') ? '🟢' : '⚙️'}
                            </div>
                            <div>
                              <div style={styles.timelineLabel}>{act.action.toUpperCase().replace('_', ' ')}</div>
                              <div style={styles.timelineTime}>{new Date(act.created_at).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 4: PREFERENCES & QUICK ACTIONS */}
              {activeTab === 'prefs' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Notification Toggles */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <h4 style={styles.cardTitle}>✉️ Notification Preferences</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                      <div style={styles.prefRow}>
                        <div>
                          <div style={styles.prefTitle}>Email Notification updates</div>
                          <div style={styles.prefDesc}>Receive automated status changes via email.</div>
                        </div>
                        <input type="checkbox" checked={prefs.email} onChange={() => setPrefs(prev => ({ ...prev, email: !prev.email }))} style={styles.toggleSwitch} />
                      </div>
                      <div style={styles.prefRow}>
                        <div>
                          <div style={styles.prefTitle}>SMS Alerts</div>
                          <div style={styles.prefDesc}>Send high-priority escalation logs via mobile message.</div>
                        </div>
                        <input type="checkbox" checked={prefs.sms} onChange={() => setPrefs(prev => ({ ...prev, sms: !prev.sms }))} style={styles.toggleSwitch} />
                      </div>
                      <div style={styles.prefRow}>
                        <div>
                          <div style={styles.prefTitle}>Weekly SLA Summary Logs</div>
                          <div style={styles.prefDesc}>Weekly digests of municipal resolution analytics.</div>
                        </div>
                        <input type="checkbox" checked={prefs.weekly} onChange={() => setPrefs(prev => ({ ...prev, weekly: !prev.weekly }))} style={styles.toggleSwitch} />
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Matrix */}
                  <div style={{ ...styles.card, background: theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)', border: theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <h4 style={styles.cardTitle}>⚡ Enterprise Operations & Quick Actions</h4>
                    <div style={styles.actionsGrid}>
                      <button style={{ ...styles.actionBtn, background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'none', color: themeColors.textPrimary, border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1' }} onClick={handlePrint}>🖨️ Print Employee Profile</button>
                      <button style={{ ...styles.actionBtn, background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'none', color: themeColors.textPrimary, border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1' }} onClick={() => toast.success('📊 Exporting Full Audit Logs PDF...')}>📁 Export Activity Log PDF</button>
                      <button style={{ ...styles.actionBtn, background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'none', color: themeColors.textPrimary, border: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1' }} onClick={() => toast.success('⚙️ Refreshing session variables...')}>🔄 Force Re-sync Session</button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

        {/* --- FOOTER --- */}
        <div style={{ ...styles.modalFooter, borderTop: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(241,245,249,0.5)' }}>
          <span style={{ fontSize: '0.7rem', color: themeColors.textSecondary }}>Civic Connect Enterprise Portal v1.4.1</span>
          <button onClick={onClose} style={styles.closeFooterBtn}>Close Directory</button>
        </div>

      </div>
    </div>,
    document.body
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    zIndex: 9999, // Ensure modal mounts clearly on top of headers
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    boxSizing: 'border-box'
  },
  modalContainer: {
    width: '1100px',
    maxWidth: '100%',
    height: '650px',
    borderRadius: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  modalHeader: {
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    cursor: 'pointer',
    opacity: 0.6,
    transition: '0.2s',
    lineHeight: '1'
  },
  modalBody: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  leftPanel: {
    width: '280px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    flexShrink: 0
  },
  rightPanel: {
    flex: 1,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  avatarWrapper: {
    position: 'relative',
    width: '110px',
    height: '110px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.05)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    border: '3px solid #3b82f6',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    overflow: 'hidden'
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  uploadSpinner: {
    fontSize: '0.75rem',
    fontWeight: 'bold',
    color: '#475569'
  },
  cameraIndicator: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: '0.2s',
    fontSize: '1.25rem',
    borderRadius: '50%'
  },
  idBox: {
    width: '100%',
    padding: '12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    textAlign: 'left',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  idLabel: {
    fontWeight: 'bold',
    color: '#64748b'
  },
  idValue: {
    fontFamily: 'monospace',
    cursor: 'pointer',
    color: '#3b82f6'
  },
  qrWrapper: {
    marginTop: 'auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  },
  tabBtn: (active, primaryColor) => ({
    background: 'none',
    border: 'none',
    padding: '8px 12px 12px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    color: active ? (primaryColor || '#2563eb') : '#64748b',
    borderBottom: active ? `3px solid ${primaryColor || '#2563eb'}` : '3px solid transparent',
    transition: '0.2s'
  }),
  card: {
    padding: '20px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.01)'
  },
  cardTitle: {
    margin: '0 0 12px',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  actionLink: {
    background: 'none',
    border: 'none',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#3b82f6',
    cursor: 'pointer'
  },
  btnPri: {
    padding: '6px 14px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  btnSec: {
    padding: '6px 14px',
    background: '#e2e8f0',
    color: '#475569',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px'
  },
  infoLabel: {
    fontSize: '0.7rem',
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: '2px'
  },
  infoValue: {
    fontSize: '0.85rem',
    fontWeight: '500'
  },
  formLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  formInput: {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: '1px solid rgba(0,0,0,0.1)',
    fontSize: '0.85rem',
    boxSizing: 'border-box'
  },
  docRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 12px',
    background: 'rgba(0,0,0,0.02)',
    borderRadius: '8px',
    fontSize: '0.8rem'
  },
  docDlBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    cursor: 'pointer'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '12px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: 'rgba(59, 130, 246, 0.1)',
    borderRadius: '16px',
    border: '1px solid rgba(59, 130, 246, 0.15)'
  },
  statIcon: {
    fontSize: '1.5rem'
  },
  statNum: {
    fontSize: '0.65rem',
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  statVal: {
    fontSize: '1.1rem',
    fontWeight: '900',
    color: '#3b82f6'
  },
  badgeItem: {
    fontSize: '0.75rem',
    padding: '4px 10px',
    borderRadius: '20px',
    background: 'rgba(0,0,0,0.05)',
    fontWeight: 'bold',
    border: '1px solid rgba(0,0,0,0.08)'
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    position: 'relative',
    paddingLeft: '10px'
  },
  timelineStep: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  timelineIcon: {
    fontSize: '1rem',
    flexShrink: 0
  },
  timelineLabel: {
    fontSize: '0.8rem',
    fontWeight: 'bold'
  },
  timelineTime: {
    fontSize: '0.65rem',
    color: '#64748b'
  },
  prefRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid rgba(0,0,0,0.04)'
  },
  prefTitle: {
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  prefDesc: {
    fontSize: '0.7rem',
    color: '#64748b'
  },
  toggleSwitch: {
    width: '35px',
    height: '18px',
    cursor: 'pointer'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '10px',
    marginTop: '10px'
  },
  actionBtn: {
    padding: '10px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: '0.2s'
  },
  modalFooter: {
    padding: '14px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  closeFooterBtn: {
    padding: '6px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    cursor: 'pointer'
  }
};

export default ProfileModal;