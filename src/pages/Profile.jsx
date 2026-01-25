import { useState, useEffect, useRef } from 'react'; // <--- Added useRef
import { supabase } from '../supabaseClient';

const ProfileModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false); // <--- New State for upload
  const [isFlipped, setIsFlipped] = useState(false);
  const fileInputRef = useRef(null); // <--- Reference for hidden input
  
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null); // <--- New State for Photo
  const [role, setRole] = useState('citizen');

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase
          .from('profiles')
          .select('*') // Get all columns including avatar_url
          .eq('id', session.user.id)
          .maybeSingle();
          
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

  // --- HANDLE PHOTO UPLOAD ---
  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update Profile Table with URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl, updated_at: new Date() })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      alert('📸 Photo Updated Successfully!');

    } catch (error) {
      alert('Error uploading avatar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- SAVE DETAILS ---
  const handleSave = async (e) => {
    e.stopPropagation();
    
    // Simple Validation: Phone must be 10 digits
    if (phone && !/^\d{10}$/.test(phone)) {
      alert('⚠️ Phone number must be exactly 10 digits.');
      return;
    }

    const { error } = await supabase.from('profiles').update({ 
      full_name: fullName, phone, address, updated_at: new Date() 
    }).eq('id', user.id);

    if (!error) {
      alert('✅ Details Updated Successfully');
      setIsFlipped(false);
    } else {
      alert('Error: ' + error.message);
    }
  };

  if (loading) return null;

  const cardId = user ? `TS-${user.id.slice(0, 4).toUpperCase()}-${user.id.slice(user.id.length - 4).toUpperCase()}` : 'TS-0000';
  const getRoleColor = () => {
    if (role === 'admin') return 'linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)'; 
    if (role === 'employee') return 'linear-gradient(135deg, #b45309 0%, #fbbf24 100%)'; 
    return 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)'; 
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      
      <div style={styles.perspectiveContainer} onClick={(e) => e.stopPropagation()}>
        <div style={{ ...styles.cardInner, transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
          
          {/* --- FRONT SIDE --- */}
          <div style={styles.cardFront}>
            <button onClick={onClose} style={styles.closeBtn}>&times;</button>

            <div style={styles.cardHeader}>
               <span style={{fontSize: '2rem'}}>🏛️</span>
               <div style={{textAlign: 'right'}}>
                 <div style={styles.headerTitle}>CIVIC CONNECT</div>
                 <div style={styles.headerSubtitle}>OFFICIAL DIGITAL ID</div>
               </div>
            </div>

            <div style={{display: 'flex', marginTop: '20px', gap: '20px'}}>
              
              {/* PHOTO AREA (Clickable) */}
              <div 
                style={styles.photoContainer} 
                onClick={() => fileInputRef.current.click()} // Trigger hidden input
                title="Click to change photo"
              >
                 {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={uploadAvatar}
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={uploading}
                />

                {uploading ? (
                  <span style={{fontSize:'0.6rem'}}>Wait...</span>
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:'15px'}} />
                ) : (
                  <div style={{fontSize: '3rem'}}>👤</div>
                )}

                <div style={styles.roleBadge(getRoleColor())}>{role.toUpperCase()}</div>
                
                {/* Camera Icon Overlay */}
                <div style={styles.cameraOverlay}>📷</div>
              </div>

              <div style={{flex: 1}}>
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
             <button onClick={onClose} style={styles.closeBtn}>&times;</button>
             <h3 style={{margin: '0 0 20px 0', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', fontSize:'1.1rem'}}>Update Information</h3>
             
             <div style={styles.formGroup}><label style={styles.formLabel}>Full Name</label><input value={fullName} onChange={e => setFullName(e.target.value)} style={styles.input} /></div>
             
             {/* Phone Input with Validation Styling */}
             <div style={styles.formGroup}>
               <label style={styles.formLabel}>Mobile Number (10 Digits)</label>
               <input 
                 value={phone} 
                 onChange={e => {
                   const val = e.target.value.replace(/\D/g, ''); // Remove non-numbers instantly
                   if (val.length <= 10) setPhone(val);
                 }} 
                 placeholder="9999999999"
                 style={styles.input} 
               />
             </div>

             <div style={styles.formGroup}><label style={styles.formLabel}>Residential Address</label><textarea value={address} onChange={e => setAddress(e.target.value)} style={{...styles.input, height: '60px', resize: 'none'}} /></div>

             <div style={{display: 'flex', gap: '10px', marginTop: 'auto'}}>
               <button onClick={() => setIsFlipped(false)} style={styles.cancelBtn}>Cancel</button>
               <button onClick={handleSave} style={styles.saveBtn}>Save Changes</button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(5px)',
    zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center'
  },
  perspectiveContainer: {
    perspective: '1000px', width: '450px', height: '280px', position: 'relative', marginTop: '-50px'
  },
  cardInner: {
    position: 'relative', width: '100%', height: '100%', textAlign: 'left',
    transition: 'transform 0.8s', transformStyle: 'preserve-3d'
  },
  cardFront: {
    position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
    background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
    borderRadius: '20px', padding: '25px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column'
  },
  cardBack: {
    position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)',
    background: '#ffffff', borderRadius: '20px', padding: '25px',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column'
  },
  closeBtn: {
    position: 'absolute', top: '15px', left: '15px', width: '30px', height: '30px',
    background: '#fee2e2', color: '#ef4444', borderRadius: '50%', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '1.2rem', zIndex: 100
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  headerTitle: { fontSize: '1.2rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' },
  headerSubtitle: { fontSize: '0.6rem', fontWeight: 'bold', color: '#64748b', letterSpacing: '2px' },
  
  photoContainer: {
    width: '80px', height: '80px', background: '#e2e8f0', borderRadius: '15px',
    display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', overflow: 'hidden'
  },
  cameraOverlay: {
    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0,
    transition: '0.2s', borderRadius: '15px', fontSize: '1.5rem',
    ':hover': { opacity: 1 } // Note: Inline styles don't support pseudo-selectors easily, added for structure logic
  },
  roleBadge: (gradient) => ({
    position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)',
    background: gradient, color: 'white', fontSize: '0.6rem', fontWeight: 'bold',
    padding: '4px 8px', borderRadius: '10px', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', zIndex: 10
  }),
  label: { fontSize: '0.6rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '2px' },
  valueLarge: { fontSize: '1.2rem', fontWeight: '700', color: '#1e293b', marginBottom: '10px' },
  valueMono: { fontFamily: 'monospace', fontSize: '0.9rem', color: '#334155', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' },
  row: { display: 'flex', gap: '20px' },
  cardFooter: { marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'end' },
  qrPlaceholder: {
    width: '40px', height: '40px', background: '#0f172a', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px'
  },
  editBtn: {
    background: 'none', border: '1px solid #2563eb', color: '#2563eb', fontWeight: '600',
    cursor: 'pointer', fontSize: '0.75rem', padding: '6px 12px', borderRadius: '20px',
    display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s'
  },
  formGroup: { marginBottom: '12px' },
  formLabel: { display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#475569', marginBottom: '4px' },
  input: {
    width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.9rem', outline: 'none', transition: '0.2s', background: '#f8fafc'
  },
  saveBtn: { flex: 1, padding: '10px', background: '#0f172a', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' },
  cancelBtn: { padding: '10px 20px', background: '#f1f5f9', color: '#64748b', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }
};

export default ProfileModal;