import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ProfileModal = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('role, full_name, phone').eq('id', session.user.id).single();
        if (data) {
          setRole(data.role || 'citizen');
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id);
    if (!error) {
      alert('✅ Profile Saved!');
      setEditing(false);
    } else {
      alert('Error saving profile');
    }
  };

  // Helper for Role Colors/Titles
  const getTheme = () => {
    if (role === 'admin') return { color: '#dc3545', title: 'Administrator', icon: '👮' };
    if (role === 'employee') return { color: '#eab308', title: 'Official', icon: '👷' };
    return { color: '#0056b3', title: 'Citizen', icon: '👤' };
  };

  const theme = getTheme();

  if (loading) return null;

  return (
    // BACKDROP
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.2s' }}>
      
      {/* MODAL BOX */}
      <div className="gov-card" style={{ width: '400px', padding: 0, background: 'white', position: 'relative', animation: 'slideUp 0.3s' }}>
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>

        {/* HEADER */}
        <div style={{ background: theme.color, padding: '30px', color: role === 'employee' ? 'black' : 'white', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>{theme.icon}</div>
          <h2 style={{ margin: '10px 0 0' }}>{fullName || `${theme.title} Profile`}</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>{user?.email}</p>
        </div>

        {/* BODY */}
        <div style={{ padding: '30px' }}>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone Number" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSave} className="btn-gov" style={{ flex: 1, background: '#198754' }}>Save</button>
                <button onClick={() => setEditing(false)} className="btn-gov" style={{ background: '#6c757d' }}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>FULL NAME</label>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{fullName || 'Not set'}</div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '0.8rem', color: '#888' }}>MOBILE</label>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{phone || 'Not set'}</div>
              </div>
              <button onClick={() => setEditing(true)} className="btn-gov" style={{ width: '100%', background: theme.color, color: role === 'employee' ? 'black' : 'white' }}>
                Edit Details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;