import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import LoadingScreen from '../components/LoadingScreen'; // <--- IMPORT THE NEW COMPONENT

const Home = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // --- TRAFFIC CONTROLLER LOGIC ---
  useEffect(() => {
    const checkSession = async () => {
      // 1. Artificial delay for smoother UX (prevents flickering)
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // 2. User is logged in! Let's find out who they are.
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        const role = profile?.role || 'citizen';

        // 3. Redirect based on Role
        if (role === 'admin') navigate('/admin-dashboard');
        else if (role === 'employee') navigate('/employee-dashboard');
        else navigate('/user-dashboard');
      } else {
        // 4. Not logged in? Stop loading and show the Landing Page.
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate]);

  // 
  // 5. Show the Professional Loading Screen while checking
  if (loading) return <LoadingScreen message="Verifying Credentials..." />;

  return (
    <div className="fade-in">
      
      {/* 1. HERO SECTION */}
      <section style={styles.heroSection}>
        {/* Gradient Overlay */}
        <div style={styles.heroOverlay}></div>

        <div className="container" style={styles.heroContainer}>
          <div style={styles.heroContent}>
            
            <span style={styles.badge}>🚀 Better Cities, Faster</span>
            
            <h1 style={styles.heroTitle}>
              Civic <span style={{ color: '#60a5fa' }}>Connect</span>
            </h1>
            
            <p style={styles.heroText}>
              Don't just complain—report it. We connect citizens directly with city officials to fix potholes, garbage, and streetlights.
            </p>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Login 
              </button>
              <button onClick={() => navigate('/signup')} className="btn btn-outline">
                Create Account
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID (Floating Overlap) */}
      <section style={{ background: '#f8fafc', paddingBottom: '80px' }}>
        <div className="container">
          <div style={styles.gridContainer}>
            <FeatureCard 
              icon="📸" 
              title="Snap & Upload" 
              desc="See an issue? Take a photo. Our AI automatically tags the category and location for you." 
            />
            <FeatureCard 
              icon="📍" 
              title="GPS Precision" 
              desc="No need to explain the address. We use satellite geolocation to pinpoint the exact repair spot." 
            />
            <FeatureCard 
              icon="✅" 
              title="Verified Proof" 
              desc="Transparency first. See 'Before' and 'After' photos for every single complaint you raise." 
            />
          </div>
        </div>
      </section>

      {/* 3. CALL TO ACTION STRIP */}
      <section style={{ background: '#1e293b', color: 'white', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ margin: '0 0 10px' }}>Ready to clean up your city?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Join 5,000+ active citizens making a difference today.</p>
          <button onClick={() => navigate('/signup')} className="btn" style={{ background: '#f59e0b', color: 'black' }}>
            Get Started Now
          </button>
        </div>
      </section>

    </div>
  );
};

// --- SUB-COMPONENTS ---
const FeatureCard = ({ icon, title, desc }) => (
  <div className="gov-card">
    <div style={{ fontSize: '2.5rem', marginBottom: '15px', background: '#eff6ff', width: '70px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>{icon}</div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0 0 10px', color: '#1e293b' }}>{title}</h3>
    <p style={{ color: '#64748b', margin: 0 }}>{desc}</p>
  </div>
);

// --- LOCAL STYLES ---
const styles = {
  heroSection: {
    height: '85vh',
    backgroundImage: 'url("/images/hyd_banner.jpg")', // Make sure this image exists in public/images/
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'linear-gradient(90deg, #0f172a 0%, rgba(15, 23, 42, 0.9) 40%, rgba(15, 23, 42, 0.2) 100%)',
  },
  heroContainer: {
    position: 'relative',
    zIndex: 10,
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
  },
  heroContent: {
    maxWidth: '650px',
    color: 'white',
    textAlign: 'left',
  },
  badge: {
    background: 'rgba(37, 99, 235, 0.2)',
    color: '#60a5fa',
    padding: '8px 16px',
    borderRadius: '30px',
    fontSize: '0.85rem',
    fontWeight: '600',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    marginBottom: '25px',
    display: 'inline-block',
    backdropFilter: 'blur(4px)',
  },
  heroTitle: {
    fontSize: '4rem',
    fontWeight: '800',
    lineHeight: '1.1',
    margin: '0 0 20px 0',
    letterSpacing: '-1px',
  },
  heroText: {
    fontSize: '1.25rem',
    color: '#cbd5e1',
    marginBottom: '40px',
    lineHeight: '1.6',
    maxWidth: '500px',
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginTop: '-80px',
    position: 'relative',
    zIndex: 20,
  }
};

export default Home;