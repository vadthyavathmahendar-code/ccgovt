import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ProfileModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('citizen');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('role, full_name, phone, address').eq('id', session.user.id).single();
        if (data) {
          setRole(data.role || 'citizen');
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone, address }).eq('id', user.id);
    if (!error) {
      alert('✅ Details Updated Successfully');
      setEditing(false);
    } else {
      alert('Error updating details.');
    }
  };

  if (loading) return null;

  const cardId = user ? `TS-${user.id.slice(0, 4).toUpperCase()}-${user.id.slice(user.id.length - 4).toUpperCase()}` : 'TS-0000-0000';
  const roleLabel = role === 'admin' ? 'ADMINISTRATOR' : role === 'employee' ? 'FIELD OFFICER' : 'CITIZEN';
  const idColor = role === 'admin' ? '#dc3545' : role === 'employee' ? '#eab308' : '#0056b3';

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(3px)' }}>
      
      <div className="gov-card" style={{ 
        width: '500px', background: '#fff', position: 'relative', 
        border: '1px solid #ccc', borderRadius: '10px', overflow: 'hidden',
        boxShadow: '0 15px 40px rgba(0,0,0,0.4)'
      }}>
        
        {/* HEADER */}
        <div style={{ background: 'linear-gradient(to right, #f8f9fa, #e9ecef)', padding: '15px 20px', borderBottom: '3px solid #eab308', display: 'flex', alignItems: 'center', gap: '15px' }}>
           <div style={{ fontSize: '2.8rem', lineHeight: 1 }}>🏛️</div>
           <div>
             <h3 style={{ margin: 0, color: '#333', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Government of Telangana</h3>
             <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', fontWeight: 'bold' }}>Civic Services Identity Card</p>
           </div>
           <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '2rem', lineHeight: '0.8', cursor: 'pointer', color: '#999' }}>&times;</button>
        </div>

        {/* BODY */}
        <div style={{ padding: '25px', display: 'flex', gap: '25px', background: '#fff', position:'relative', minHeight:'280px' }}>
          
          {/* WATERMARK BACKGROUND */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '10rem', opacity: 0.03, pointerEvents: 'none' }}>🏛️</div>

          {/* LEFT: PHOTO & QR */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '130px' }}>
            <div style={{ 
              width: '110px', height: '130px', background: '#f1f3f5', border: '1px solid #dee2e6', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', color: '#adb5bd', borderRadius:'4px' 
            }}>
              👤
            </div>
            {/* Fake QR */}
            <div style={{ 
              width: '90px', height: '90px', background: '#000', color:'white', 
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.6rem', textAlign:'center',
              backgroundImage: 'repeating-linear-gradient(45deg, #333 0, #333 2px, #000 0, #000 50%)'
            }}>
              <div style={{background:'white', padding:'2px', color:'black', fontWeight:'bold'}}>TS-GOV</div>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div style={{ flex: 1, zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            
            {editing ? (
              // EDIT FORM
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666' }}>FULL NAME</label>
                  <input value={fullName} onChange={e => setFullName(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius:'4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666' }}>MOBILE NUMBER</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius:'4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#666' }}>RESIDENTIAL ADDRESS</label>
                  <textarea rows="2" value={address} onChange={e => setAddress(e.target.value)} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius:'4px' }} placeholder="H.No, Street, District" />
                </div>
                
                {/* Save/Cancel Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                   <button onClick={handleSave} style={{ flex: 1, padding: '8px', background: '#198754', color: 'white', border: 'none', cursor: 'pointer', borderRadius:'4px', fontWeight:'bold' }}>Save</button>
                   <button onClick={() => setEditing(false)} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer', borderRadius:'4px' }}>Cancel</button>
                </div>
              </div>
            ) : (
              // ID CARD VIEW
              <>
                <div>
                   <div style={{ marginBottom: '15px', borderBottom:'1px dashed #ccc', paddingBottom:'10px' }}>
                      <label style={{ fontSize: '0.65rem', color: '#888', fontWeight: 'bold', letterSpacing: '1px' }}>CARD NO</label>
                      <div style={{ fontSize: '0.9rem', color: '#0056b3', fontFamily: 'monospace', fontWeight:'bold' }}>{cardId}</div>
                   </div>

                   <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', fontWeight: 'bold' }}>NAME</label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#000', textTransform:'uppercase' }}>{fullName || '---'}</div>
                   </div>
                   
                   <div style={{ display:'flex', gap:'20px', marginBottom:'10px' }}>
                      <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', fontWeight: 'bold' }}>MOBILE</label>
                          <div style={{ fontSize: '0.95rem', color: '#333' }}>{phone || '---'}</div>
                      </div>
                      <div>
                          <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', fontWeight: 'bold' }}>VALID</label>
                          <div style={{ fontSize: '0.95rem', color: '#333' }}>Lifetime</div>
                      </div>
                   </div>

                   <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontSize: '0.65rem', color: '#888', fontWeight: 'bold' }}>ADDRESS</label>
                      <div style={{ fontSize: '0.85rem', color: '#444', lineHeight:'1.4', height:'40px', overflow:'hidden' }}>{address || 'Address not updated.'}</div>
                   </div>
                </div>

                {/* BOTTOM ACTION ROW */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px' }}>
                   <span style={{ 
                      background: idColor, color: 'white', padding: '5px 15px', 
                      borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'
                    }}>
                      {roleLabel}
                   </span>

                   {/* NEW EDIT BUTTON PLACEMENT */}
                   <button 
                     onClick={() => setEditing(true)} 
                     style={{ 
                       background: 'none', border: '1px solid #0056b3', color: '#0056b3', 
                       padding:'5px 12px', borderRadius:'4px', fontSize:'0.75rem', cursor: 'pointer', fontWeight:'bold',
                       display: 'flex', alignItems: 'center', gap: '5px'
                     }}
                   >
                     ✏️ Edit Details
                   </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BOTTOM BAR CODE STRIP */}
        <div style={{ height: '30px', background: '#e9ecef', borderTop: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6 }}>
           <div style={{ letterSpacing: '3px', fontSize: '0.6rem', fontFamily: 'monospace' }}>||| || ||| | |||| ||| | || |||||</div>
        </div>

      </div>
    </div>
  );
};

export default ProfileModal;