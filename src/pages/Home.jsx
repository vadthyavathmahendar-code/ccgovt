import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingScreen from '../components/LoadingScreen';

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- TRAFFIC CONTROLLER LOGIC ---
  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && isMounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          const role = profile?.role || 'citizen';

          if (role === 'super_admin' || role === 'dept_admin' || role === 'commissioner') {
            navigate('/admin-dashboard', { replace: true });
          } else if (role === 'employee') {
            navigate('/employee-dashboard', { replace: true });
          } else {
            navigate('/user-dashboard', { replace: true });
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  if (loading) return <LoadingScreen message="Verifying Credentials..." />;

  return (
    <div className="fade-in">
      {/* HERO SECTION */}
      <section style={styles.heroSection}>
        <div style={styles.heroOverlay}></div>

        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroContent}>
            <span style={styles.badge}>🚀 Better Cities, Faster</span>
            
            <h1 style={styles.heroTitle}>
              Civic <span style={{ color: '#60a5fa' }}>Connect</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Empowering Citizens, Streamlining Municipal Governance. Report issues, track progress, and build better communities together.
            </p>

            <div style={styles.buttonGroup}>
              <button 
                onClick={() => navigate('/login')} 
                style={styles.primaryBtn}
              >
                Get Started
              </button>

              <button 
                onClick={() => navigate('/services')} 
                style={styles.secondaryBtn}
              >
                View Services
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK STATS */}
      <section style={styles.statsSection}>
        <div className="container" style={styles.statsGrid}>
          <StatCard number="24/7" label="Support Active" icon="⚡" />
          <StatCard number="100%" label="Transparent Process" icon="🛡️" />
          <StatCard number="Fast" label="Resolution SLA" icon="⏱️" />
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ number, label, icon }) => (
  <div style={styles.statCard}>
    <span style={{ fontSize: '2rem' }}>{icon}</span>
    <h3 style={styles.statNumber}>{number}</h3>
    <p style={styles.statLabel}>{label}</p>
  </div>
);

const styles = {
  heroSection: {
    position: 'relative',
    minHeight: '75vh',
    display: 'flex',
    alignItems: 'center',
    backgroundImage: 'url("/images/hyd_banner.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.85) 45%, rgba(15, 23, 42, 0.15) 100%)',
  },
  heroContainer: {
    position: 'relative',
    zIndex: 1,
    padding: '60px 20px',
    display: 'flex',
    justifyContent: 'flex-start',
    width: '100%',
  },
  heroContent: {
    maxWidth: '650px',
    textAlign: 'left',
  },
  badge: {
    display: 'inline-block',
    padding: '6px 16px',
    borderRadius: '20px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '20px',
    textAlign: 'left',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '800',
    lineHeight: '1.1',
    marginBottom: '20px',
    letterSpacing: '-1px',
    textAlign: 'left',
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    marginBottom: '35px',
    textAlign: 'left',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  primaryBtn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    background: 'transparent',
    color: 'white',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    padding: '14px 32px',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  statsSection: {
    padding: '40px 0',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
  },
  statCard: {
    background: 'white',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  statNumber: {
    margin: '10px 0 5px',
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#0f172a',
  },
  statLabel: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9rem',
  },
};

export default Home;