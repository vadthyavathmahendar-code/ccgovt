import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  
  // User Data
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return navigate('/login');

    setUser(session.user);

    // Fetch details (No avatar needed)
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name, phone')
      .eq('id', session.user.id)
      .single();

    if (data) {
      setRole(data.role);
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
    }
    setLoading(false);
  };

  const handleSave = async () => {
    try {
      const updates = {
        full_name: fullName,
        phone: phone,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      alert('✅ Profile updated successfully!');
      setEditing(false); // Go back to View Mode
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div className="container" style={{padding:'20px'}}>Loading...</div>;

  return (
    <div className="container fade-in" style={{ maxWidth: '500px', marginTop: '40px' }}>
      
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '10px' }}>
        ← Back to Dashboard
      </button>

      <div className="gov-card" style={{ padding: '0', overflow: 'hidden', textAlign: 'center' }}>
        
        {/* TOP BLUE SECTION */}
        <div style={{ background: '#0056b3', padding: '30px', color: 'white' }}>
          {/* Simple User Icon instead of Photo */}
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>👤</div>
          <h2 style={{ margin: 0 }}>{fullName || 'Citizen Profile'}</h2>
          <p style={{ margin: '5px 0 0', opacity: 0.8 }}>{user.email}</p>
        </div>

        {/* CONTENT SECTION */}
        <div style={{ padding: '30px' }}>
          
          {editing ? (
            // === EDIT MODE ===
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
              
              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Full Name</label>
                <input 
                  value={fullName} onChange={e => setFullName(e.target.value)} 
                  placeholder="e.g. Rahul Sharma"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Mobile Number</label>
                <input 
                  value={phone} onChange={e => setPhone(e.target.value)} 
                  placeholder="+91 99999 00000"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button onClick={handleSave} className="btn-gov" style={{ flex: 1, background: '#198754' }}>💾 Save Changes</button>
                <button onClick={() => setEditing(false)} className="btn-gov" style={{ background: '#6c757d' }}>Cancel</button>
              </div>

            </div>
          ) : (
            // === VIEW MODE ===
            <div>
              {fullName ? (
                // EXISTING USER VIEW
                <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block' }}>FULL NAME</label>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>{fullName}</div>
                  </div>
                  <div style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block' }}>MOBILE</label>
                    <div style={{ fontSize: '1.2rem', fontWeight: '600', color: '#333' }}>{phone || 'Not Provided'}</div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ color: '#888', fontSize: '0.8rem', display: 'block' }}>ROLE</label>
                    <span style={{ background: '#eab308', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: 'black' }}>
                      {role.toUpperCase()}
                    </span>
                  </div>
                </div>
              ) : (
                // NEW USER VIEW
                <div style={{ marginBottom: '30px', color: '#666' }}>
                  <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#d9534f' }}>⚠️ Profile Incomplete</p>
                  <p style={{ fontSize: '0.9rem' }}>Please add your Name and Phone Number to continue.</p>
                </div>
              )}

              <button 
                onClick={() => setEditing(true)} 
                className="btn-gov" 
                style={{ width: '100%', background: fullName ? '#0056b3' : '#eab308', color: fullName ? 'white' : 'black' }}
              >
                {fullName ? '✏️ Edit Details' : '✨ Complete My Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;