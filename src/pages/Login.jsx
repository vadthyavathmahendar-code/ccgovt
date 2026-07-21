import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { getRoleDefaultPath } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Authenticating identity...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user profile role from database
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();

      const userRole = profile?.role || 'citizen';
      toast.success('Login Successful! Welcome to Civic Connect.', { id: toastId });

      // Redirect to target return URL or default role path
      const targetPath = location.state?.from?.pathname || getRoleDefaultPath(userRole);
      navigate(targetPath, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Authentication failed.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={styles.pageContainer}>
      <div className="gov-card" style={styles.loginCard}>
        {/* Card Header */}
        <div style={styles.cardHeader}>
          <div style={styles.logoWrapper}>
            <img src="/images/cc_logo.png" alt="Civic Connect Logo" style={{ height: '100%', width: 'auto' }} />
          </div>
          <h2 style={styles.title}>Civic Connect</h2>
          <p style={styles.subtitle}>Login to Access Municipal Services</p>
        </div>

        {/* Login Form */}
        <div style={{ padding: '30px' }}>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label htmlFor="login-email" style={styles.label}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="citizen@example.com"
                style={styles.input}
              />
            </div>

            <div>
              <label htmlFor="login-password" style={styles.label}>
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Authenticating...' : '🔐 Secure Login'}
            </button>
          </form>

          {/* Footer Divider */}
          <div style={styles.divider}>
            <span style={{ background: 'white', padding: '0 10px', color: '#94a3b8', fontSize: '0.85rem' }}>OR</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              First time citizen user?{' '}
              <Link to="/signup" style={styles.link}>
                Register Account Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    minHeight: '80vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f8fafc',
    padding: '20px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '420px',
    padding: '0',
    borderTop: '5px solid #2563eb',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    background: 'white',
  },
  cardHeader: {
    background: '#f1f5f9',
    padding: '30px 25px 20px',
    textAlign: 'center',
    borderBottom: '1px solid #e2e8f0',
  },
  logoWrapper: {
    height: '65px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    margin: '5px 0',
    color: '#0f172a',
    fontSize: '1.6rem',
    fontWeight: '800',
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9rem',
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#334155',
    fontSize: '0.9rem',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '0.95rem',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
  },
  submitBtn: {
    width: '100%',
    justifyContent: 'center',
    marginTop: '10px',
    padding: '14px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    borderTop: '1px solid #e2e8f0',
    marginTop: '25px',
    marginBottom: '25px',
    height: '0px',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    textDecoration: 'none',
  },
};

export default Login;