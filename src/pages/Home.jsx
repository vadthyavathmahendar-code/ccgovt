import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="fade-in">
      {/* 1. HERO BANNER */}
      <div style={{ 
        height: '500px', 
        backgroundImage: 'url("/images/hyd_banner.jpg")', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center', 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'flex-start' // <--- 1. Forces everything to start from the left
      }}>
        {/* Gradient Overlay: Dark on left, transparent on right to see the image */}
        <div style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 100%)' }}></div>
        
        {/* TEXT CONTENT WRAPPER */}
        <div style={{ 
          position: 'relative', 
          color: 'white', 
          zIndex: 2, 
          paddingLeft: '80px', // <--- 2. Pushes content slightly away from the edge
          textAlign: 'left',
          maxWidth: '600px'    // <--- 3. Limits width so it doesn't cover the image on the right
        }}>
          
          <h1 style={{ fontSize: '4rem', margin: '0 0 15px', fontWeight: '800', lineHeight: '1.2' ,color : '#0056b3'}}>
            Civic <br/> Connect
          </h1>
          <p style={{ fontSize: '2rem', opacity: 0.9, lineHeight: '1.6', margin: '0 0 30px 0' ,}}>
            See it, Click it, Fix it.
          </p>
          
          {/* BUTTONS */}
          <div style={{ display: 'flex', gap: '15px' }}> 
            <button onClick={() => navigate('/login')} className="btn-gov" style={{ padding: '15px 35px', fontSize: '1.1rem', background: '#eab308', color: 'black', border: 'none' }}>
              Login
            </button>
            <button onClick={() => navigate('/signup')} className="btn-gov" style={{ padding: '15px 35px', fontSize: '1.1rem', background: 'transparent', border: '2px solid white' }}>
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* ... (Keep the rest of the Feature Cards and Footer code exactly as it was) ... */}
      
      {/* 2. FEATURE CARDS */}
      <div style={{ background: '#f0f9ff', padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginTop: '-100px', position: 'relative', zIndex: 10 }}>
            <FeatureCard icon="📸" title="Snap & Upload" desc="Spotted a pothole? Take a photo. Our system automatically tags the location instantly." />
            <FeatureCard icon="🛰️" title="GPS Precision" desc="We use advanced geolocation to pinpoint exactly where repairs are needed with 100% accuracy." />
            <FeatureCard icon="✅" title="Verified Proof" desc="Don't just take our word for it. See 'Before & After' photos when jobs are done." />
          </div>
        </div>
      </div>

      {/* 3. INITIATIVE FOOTER */}
      
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }) => (
  <div className="gov-card" style={{ padding: '30px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
    <div style={{ fontSize: '3rem', marginBottom: '15px' }}>{icon}</div>
    <h3 style={{ fontSize: '1.5rem', color: '#1a202c', margin: '0 0 10px', fontWeight: 'bold' }}>{title}</h3>
    <p style={{ color: '#555', fontSize: '1rem', lineHeight: '1.6', margin: 0 }}>{desc}</p>
  </div>
);

export default Home;