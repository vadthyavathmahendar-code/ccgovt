import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import { logAuditEvent } from '../utils/auditLogger';
import LoadingScreen from '../components/LoadingScreen';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, role, loading: authLoading, getRoleDefaultPath } = useAuth();
  const navigate = useNavigate();

  // --- 1. REDIRECT ON SUCCESSFUL AUTHENTICATION ---
  useEffect(() => {
    if (!authLoading && user) {
      const path = getRoleDefaultPath(role);
      navigate(path, { replace: true });
    }
  }, [user, role, authLoading, navigate, getRoleDefaultPath]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        await logAuditEvent({
          userId: null,
          userRole: 'anonymous',
          action: 'auth_failed_login',
          entityType: 'auth',
          oldData: { email },
          status: 'failed'
        });
        throw error;
      }
      
      // Log audit details upon sign-in resolver completion
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        await logAuditEvent({
          userId: data.user.id,
          userRole: profile?.role || 'citizen',
          action: 'auth_login',
          entityType: 'auth',
          entityId: data.user.id,
          newData: { email },
          status: 'success'
        });
      }

      toast.success("Login Successful!");
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  // --- 2. LOADING SCREEN ---
  if (authLoading) {
    return <LoadingScreen message="Verifying Identity..." />;
  }

  // --- 3. MAIN UI ---
  return (
    <div className="fade-in" style={styles.pageContainer}>
      <Toaster />
      <div className="gov-card" style={styles.loginCard}>
        
        {/* Header Section */}
        <div style={styles.cardHeader}>
          <div style={styles.logoWrapper}>
             <img src="/images/cc_logo.png" alt="Logo" style={{height:'100%', width:'auto'}} />
          </div>
          <h2 style={styles.title}>Civic Connect</h2>
          <p style={styles.subtitle}>Login to acess</p>
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
                placeholder="example@gmial.com"
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
              First time user? <Link to="/signup" style={styles.link}>Register Here</Link>
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
    minHeight: '90vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc', 
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
    padding: '0', 
    borderTop: '5px solid #2563eb', 
    overflow: 'hidden'
  },
  cardHeader: {
    background: '#f1f5f9',
    padding: '35px 30px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0'
  },
  logoWrapper: {
    height: '70px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    margin: '10px 0 5px',
    color: '#0f172a',
    fontSize: '1.75rem',
    fontWeight: '800'
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
    background: '#f8fafc',
    boxSizing: 'border-box'
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
    height: '0px'
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

export default Login;