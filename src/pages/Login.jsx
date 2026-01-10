import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. NEW: Check if already logged in when page loads
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If logged in, find role and redirect immediately
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        redirectUser(profile?.role);
      }
    };
    checkSession();
  }, [navigate]);

  // Helper function to handle redirects
  const redirectUser = (role) => {
    if (role === 'admin') navigate('/admin-dashboard');
    else if (role === 'employee') navigate('/employee-dashboard');
    else navigate('/user-dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // Fetch role after successful login
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      redirectUser(profile?.role);
    }
  };

  return (
    <div className="fade-in" style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="gov-card" style={{ width: '100%', maxWidth: '450px', padding: '0', borderTop: '4px solid #0056b3' }}>
        
        {/* Header Section */}
        <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
          <img src="/images/ts_logo.png" alt="Logo" style={{ height: '50px', marginBottom: '10px' }} />
          <h2 style={{ margin: 0, color: '#0056b3' }}>Sign In</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}> To Civic Connect </p>
        </div>
        
        {/* Form Section */}
        <form onSubmit={handleLogin} style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Email ID</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <button type="submit" className="btn-gov" disabled={loading}>{loading ? 'Authenticating...' : 'Login'}</button>
        </form>

        {/* Footer Section */}
        <div style={{ padding: '15px', background: '#f8f9fa', borderTop: '1px solid #e9ecef', textAlign: 'center', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#0056b3', fontWeight: 'bold' }}>Create account here</Link>
        </div>
      </div>
    </div>
  );
};
export default Login;