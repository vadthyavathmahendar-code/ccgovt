import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true); // Default to true to prevent form flash
  const navigate = useNavigate();

  // 1. The Traffic Controller
  useEffect(() => {
    // Function to check role and redirect
    const checkRoleAndRedirect = async (userId) => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();
        
        const role = profile?.role;
        
        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'employee') navigate('/employee-dashboard');
        else navigate('/user-dashboard'); // Default
      } catch (error) {
        console.error("Error checking role:", error);
        navigate('/user-dashboard');
      }
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User is logged in! Check role and redirect.
        await checkRoleAndRedirect(session.user.id);
      } else {
        // No user found, show the login form
        setCheckingSession(false);
      }
    };
    
    // Run the initial check
    checkSession();

    // Listen for auth changes (like after Google redirect finishes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setCheckingSession(true); // Show loading while we redirect
        await checkRoleAndRedirect(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      alert(error.message);
      setLoading(false);
    } 
    // If success, the onAuthStateChange listener above will handle the redirect
  };

  const handleGoogleLogin = async () => {
    // 🚨 CRITICAL FIX: Force redirect to the CURRENT website origin
    const currentURL = window.location.origin; 

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect back to /login so the 'useEffect' above can check the role
        redirectTo: `${currentURL}/login`
      }
    });
    if (error) alert(error.message);
  };

  // ✅ LOADING SCREEN (Prevents seeing the form if you are already logged in)
  if (checkingSession) {
    return (
      <div className="fade-in" style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column' }}>
        <div style={{ 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #0056b3', 
          borderRadius: '50%', 
          width: '40px', 
          height: '40px', 
          animation: 'spin 1s linear infinite', 
          marginBottom: '15px' 
        }}></div>
        <h3 style={{ color: '#0056b3' }}>Verifying Credentials...</h3>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center' }}>
      <div className="gov-card" style={{ width: '100%', maxWidth: '450px', padding: '0', borderTop: '4px solid #0056b3' }}>
        
        {/* Header */}
        <div style={{ padding: '20px', background: '#f8f9fa', borderBottom: '1px solid #e9ecef', textAlign: 'center' }}>
          <img src="/images/ts_logo.png" alt="Logo" style={{ height: '50px', marginBottom: '10px' }} />
          <h2 style={{ margin: 0, color: '#0056b3' }}>Sign In</h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}> To Civic Connect </p>
        </div>
        
        <div style={{ padding: '30px' }}>
          
          {/* Login Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Email ID</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', color: '#333' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>
            <button type="submit" className="btn-gov" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login'}
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
          Don't have an account? <Link to="/signup" style={{ color: '#0056b3', fontWeight: 'bold' }}>Create account here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;