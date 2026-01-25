import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true); 
  const navigate = useNavigate();

  // --- 1. THE TRAFFIC CONTROLLER (LOGIC UNCHANGED) ---
  useEffect(() => {
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
        else navigate('/user-dashboard'); 
      } catch (error) {
        console.error("Error checking role:", error);
        navigate('/user-dashboard');
      }
    };

    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await checkRoleAndRedirect(session.user.id);
      } else {
        setCheckingSession(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setCheckingSession(true); 
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
  };

  // --- 2. LOADING SCREEN ---
  if (checkingSession) {
    return (
      <div className="fade-in" style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <h3 style={{ color: '#0f172a', fontWeight: '600', marginTop: '20px' }}>Verifying Credentials...</h3>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- 3. MAIN UI ---
  return (
    <div className="fade-in" style={styles.pageContainer}>
      
      <div className="gov-card" style={styles.loginCard}>
        
        {/* Header Section */}
        <div style={styles.cardHeader}>
          
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to Civic Connect</p>
        </div>
        
        {/* Form Section */}
        <div style={{ padding: '30px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div>
              <label style={styles.label}>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="name@gmail.com"
                style={styles.input} 
              />
            </div>

            <div>
              <label style={styles.label}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={styles.input} 
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Authenticating...' : ' Login'}
            </button>
          </form>

          {/* Footer Section */}
          <div style={styles.divider}>
            <span style={{ background: 'white', padding: '0 10px', color: '#94a3b8', fontSize: '0.85rem' }}>OR</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Don't have an account? <Link to="/signup" style={styles.link}>Create Account</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- STYLES ---
const styles = {
  pageContainer: {
    minHeight: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc', // Light gray background
    padding: '20px'
  },
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc'
  },
  spinner: {
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    width: '50px',
    height: '50px',
    animation: 'spin 1s linear infinite'
  },
  loginCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '0', // Reset padding because we use inner sections
    borderTop: '5px solid #2563eb', // Nice accent bar at top
    overflow: 'hidden'
  },
  cardHeader: {
    background: '#f1f5f9',
    padding: '40px 30px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0'
  },
  logoCircle: {
    fontSize: '2.5rem',
    marginBottom: '10px',
    display: 'inline-block',
    background: 'white',
    width: '70px',
    height: '70px',
    lineHeight: '70px',
    borderRadius: '50%',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
  },
  title: {
    margin: '10px 0 5px',
    color: '#0f172a',
    fontSize: '1.75rem',
    fontWeight: '700'
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '1rem',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    background: '#f8fafc'
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '10px',
    padding: '14px'
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    borderTop: '1px solid #e2e8f0',
    marginTop: '30px',
    marginBottom: '30px',
    height: '0px' // Height 0 so the border sits in the middle
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

export default Login;