import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [secretCode, setSecretCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Your specific secret code logic for ccgovt
    if (role === 'employee' && secretCode !== 'CITYWORKER') {
      setLoading(false);
      return alert("Invalid Employee Code");
    }
    if (role === 'admin' && secretCode !== 'ADMINMASTER') {
      setLoading(false);
      return alert("Invalid Admin Code");
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { role: role } // Saving role to database
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('✅ Registration Successful! Please check your email.');
      navigate('/login');
    }
    setLoading(false);
  };

  // ✅ Google Signup Logic
  // Redirects to LOGIN page so your "Traffic Controller" can check the role there
 const handleGoogleSignup = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/login' 
      }
    });
    if (error) alert(error.message);
  };

  return (
    <div className="fade-in" style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="gov-card" style={{ width: '100%', maxWidth: '450px', padding: '0', borderTop: '4px solid #0056b3' }}>
        
        {/* Header */}
        <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: '#0056b3' }}>SignUp</h2>
          <p style={{ margin: 5, fontSize: '0.9rem', color: '#666' }}>Create account for Civic Connect</p>
        </div>

        <div style={{ padding: '30px' }}>
          
          {/* Main Form */}
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
            />
            <input 
              type="password" 
              placeholder="Create Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} 
            />
            
            <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '-10px' }}>Register As:</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value="citizen">Citizen</option>
              <option value="employee">Govt Employee</option>
              <option value="admin">Admin</option>
            </select>

            {/* Secret Code Input (Only shows if NOT citizen) */}
            {role !== 'citizen' && (
              <input 
                type="password" 
                placeholder="Enter Official Code" 
                value={secretCode} 
                onChange={e => setSecretCode(e.target.value)} 
                style={{ borderColor: 'red', padding: '10px', borderRadius: '4px', border: '1px solid red' }} 
              />
            )}

            <button type="submit" className="btn-gov" disabled={loading}>
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
            <span style={{ padding: '0 10px', color: '#888', fontSize: '0.85rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }}></div>
          </div>

         
        </div>

        {/* Footer */}
        <div style={{ padding: '15px', background: '#f8f9fa', borderTop: '1px solid #e9ecef', textAlign: 'center', fontSize: '0.9rem' }}>
          Already Registered? <Link to="/login" style={{ color: '#0056b3', fontWeight: 'bold' }}>Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;