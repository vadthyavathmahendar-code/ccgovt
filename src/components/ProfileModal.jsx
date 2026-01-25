import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

const ProfileModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const fileInputRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [role, setRole] = useState('citizen');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        if (data) {
          setRole(data.role || 'citizen');
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
          if (data.avatar_url) setAvatarUrl(data.avatar_url);
        }
      }
      setLoading(false);
    };
    fetchProfile();
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

      setAvatarUrl(publicUrl);
      toast.success('📸 Photo Updated Successfully!');

    } catch (error) {
      toast.error('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    if (phone && !/^\d{10}$/.test(phone)) {
      toast.error('⚠️ Phone number must be 10 digits.');
      return;
    }

    const { error } = await supabase.from('profiles').update({ 
      full_name: fullName, phone, address, updated_at: new Date() 
    }).eq('id', user.id);

    if (!error) {
      toast.success('✅ Details Updated Successfully');
      setIsFlipped(false);
    } else {
      toast.error('Error: ' + error.message);
    }
  };

  if (loading) return null;

  const cardId = user ? `TS-${user.id.slice(0, 4).toUpperCase()}-${user.id.slice(user.id.length - 4).toUpperCase()}` : 'TS-0000';
  
  const getRoleColor = () => {
    if (role === 'admin') return 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)'; 
    if (role === 'employee') return 'linear-gradient(135deg, #b45309 0%, #fbbf24 100%)'; 
    return 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'; 
  };

  return createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.perspectiveContainer} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          
          {/* --- FRONT SIDE --- */}
          <div style={styles.cardFront}>
            <button onClick={onClose} style={{...styles.closeBtn, left: '15px', top: '15px'}}>&times;</button>
            
            <div style={styles.cardHeader}>
               <span style={{fontSize: '2rem'}}>🏛️</span>
               <div style={{textAlign: 'right'}}>
                 <div style={styles.headerTitle}>CIVIC CONNECT</div>
                 <div style={styles.headerSubtitle}>OFFICIAL DIGITAL ID</div>
               </div>
            </div>
            
            <div style={{display: 'flex', marginTop: '10px', gap: '20px', alignItems: 'center', height: '100%'}}>
              <div style={styles.photoContainer} onClick={() => fileInputRef.current.click()} title="Click to change photo">
                <input type="file" ref={fileInputRef} onChange={uploadAvatar} accept="image/*" style={{ display: 'none' }} disabled={uploading} />
                {uploading ? <span style={{fontSize:'0.6rem'}}>Wait...</span> : 
                 avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'15px'}} /> : 
                 <div style={{fontSize: '3rem'}}>👤</div>}
                <div style={styles.roleBadge(getRoleColor())}>{role.toUpperCase()}</div>
                <div style={styles.cameraOverlay}>📷</div>
              </div>

              <div style={{flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                <div style={styles.label}>FULL NAME</div>
                <div style={styles.valueLarge}>{fullName || 'Citizen'}</div>
                <div style={styles.row}>
                  <div><div style={styles.label}>ID NUMBER</div><div style={styles.valueMono}>{cardId}</div></div>
                  <div><div style={styles.label}>STATUS</div><div style={{...styles.value, color: '#10b981', display:'flex', alignItems:'center', gap:'4px', fontWeight:'bold', fontSize:'0.9rem'}}>✅ Active</div></div>
                </div>
              </div>
            </div>

            <div style={styles.cardFooter}>
              <div style={styles.qrPlaceholder}><div style={{fontSize:'0.6rem', fontWeight:'bold', textAlign:'center', lineHeight:'1.2'}}>TS<br/>GOV</div></div>
              <div style={{textAlign: 'right'}}>
                <button onClick={() => setIsFlipped(true)} style={styles.editBtn}>⚙️ Update Details</button>
              </div>
            </div>
          </div>

          {/* --- BACK SIDE --- */}
          <div style={styles.cardBack}>
             {/* Close Button - Top Right Absolute */}
             <button onClick={onClose} style={{...styles.closeBtn, right: '15px', left: 'auto', top: '15px'}}>&times;</button>
             
             <h3 style={{margin: '0 0 10px 0', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', fontSize:'1rem', paddingRight: '40px'}}>
               Update Information
             </h3>
             
             <div style={styles.formGroup}>
               <label style={styles.formLabel}>Full Name</label>
               <input value={fullName} onChange={e => setFullName(e.target.value)} style={styles.input} />
             </div>
             
             <div style={styles.formGroup}>
               <label style={styles.formLabel}>Mobile Number</label>
               <input value={phone} onChange={e => { const val = e.target.value.replace(/\D/g, ''); if (val.length <= 10) setPhone(val); }} placeholder="9999999999" style={styles.input} />
             </div>
             
             <div style={styles.formGroup}>
               <label style={styles.formLabel}>Residential Address</label>
               <textarea value={address} onChange={e => setAddress(e.target.value)} style={{...styles.input, height: '45px', resize: 'none'}} />
             </div>
             
             <div style={{display: 'flex', gap: '10px', marginTop: 'auto'}}>
               <button onClick={() => setIsFlipped(false)} style={styles.cancelBtn}>Cancel</button>
               <button onClick={handleSave} style={styles.saveBtn}>Save Changes</button>
             </div>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

// --- STYLES ---
const styles = {
  // 1. Z-INDEX FIX: 90 is usually lower than Header (100) but higher than Content (1)
  // 2. ALIGNMENT FIX: 'inset: 0' forces full screen coverage without scrollbar shift
  overlay: { 
    position: 'fixed', 
    inset: 0, // Top/Left/Right/Bottom: 0
    background: 'rgba(0, 0, 0, 0.65)', 
    backdropFilter: 'blur(10px)',      
    WebkitBackdropFilter: 'blur(10px)',   
    zIndex: 90, // <--- LOWERED to sit BEHIND the Header
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    boxSizing: 'border-box'
  },
  
  // 3. OPTICAL CENTERING: 'marginTop: -50px' lifts it slightly
  perspectiveContainer: { 
    perspective: '1000px', 
    width: '450px', 
    height: '280px', 
    position: 'relative',
    marginTop: '-50px', 
    boxSizing: 'border-box' 
  },

  cardInner: { position: 'relative', width: '100%', height: '100%', textAlign: 'left', transition: 'transform 0.8s', transformStyle: 'preserve-3d' },
  
  cardFront: { 
    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', 
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', 
    borderRadius: '20px', padding: '20px', 
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', 
    display: 'flex', flexDirection: 'column',
    boxSizing: 'border-box'
  },
  
  cardBack: { 
    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', 
    background: '#ffffff', borderRadius: '20px', padding: '20px', 
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column',
    boxSizing: 'border-box'
  },

  closeBtn: { 
    position: 'absolute', width: '28px', height: '28px', 
    background: '#fee2e2', color: '#ef4444', borderRadius: '50%', border: 'none', 
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    fontWeight: 'bold', fontSize: '1.2rem', zIndex: 100,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px', paddingLeft: '35px' }, 
  headerTitle: { fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' },
  headerSubtitle: { fontSize: '0.6rem', fontWeight: 'bold', color: '#64748b', letterSpacing: '2px' },
  
  photoContainer: { 
    width: '90px', height: '90px', background: '#e2e8f0', borderRadius: '15px', 
    display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', 
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', overflow: 'visible' 
  },
  
  cameraOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s', borderRadius: '15px', fontSize: '1.5rem', ':hover': { opacity: 1 } },
  
  roleBadge: (gradient) => ({ 
    position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', 
    background: gradient, color: 'white', fontSize: '0.6rem', fontWeight: '800', 
    padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap', 
    boxShadow: '0 4px 6px rgba(0,0,0,0.3)', zIndex: 20, border: '2px solid white' 
  }),

  label: { fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' },
  valueLarge: { fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
  valueMono: { fontFamily: 'monospace', fontSize: '0.85rem', color: '#334155', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' },
  row: { display: 'flex', gap: '20px' },
  cardFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'end' },
  qrPlaceholder: { width: '40px', height: '40px', background: '#0f172a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' },
  
  editBtn: { 
    background: '#eff6ff', border: '1px solid #2563eb', color: '#2563eb', 
    fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem', padding: '6px 14px', 
    borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', 
    transition: '0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },

  formGroup: { marginBottom: '8px' },
  formLabel: { display: 'block', fontSize: '0.7rem', fontWeight: '600', color: '#475569', marginBottom: '3px' },
  input: { width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', transition: '0.2s', background: '#f8fafc', boxSizing: 'border-box' },
  saveBtn: { flex: 1, padding: '8px', background: '#0f172a', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' },
  cancelBtn: { padding: '8px 20px', background: '#f1f5f9', color: '#64748b', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }
};

export default ProfileModal;