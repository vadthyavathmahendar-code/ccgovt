import { useNavigate, useLocation } from 'react-router-dom';

const GovHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Strip */}
      <div style={{ background: '#f1f1f1', padding: '5px 20px', fontSize: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '15px', color: '#555', borderBottom: '1px solid #ddd' }}>
        <span>Government of Telangana</span>
        <span>Skip to Main Content</span>
        <span>A+</span>
        <span>A-</span>
        <span>English | తెలుగు</span>
      </div>

      {/* Main Logo Area */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Ensure this image exists in public/images/ folder */}
          <div style={{ fontSize: '3rem' }}><img src="/images/ts_logo.png" alt="Logo" style={{ width: '50px', height: '50px' }} /></div> 
          <div>
            <h1 style={{ margin: 0, color: '#1a202c', fontSize: '2rem', fontWeight: '700' , fontFamily : 'serif'}}>Government of Telangana</h1>
            <h3 style={{ margin: 0, color: '#0056b3', fontSize: '1.5rem' }}>తెలంగాణ ప్రభుత్వం</h3>
          </div>
        </div>
        <div style={{ textAlign: 'right', display: window.innerWidth < 600 ? 'none' : 'block' }}>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#0056b3', fontWeight: '800' }}>Civic Connect</h1>
          <p style={{ margin: 0, fontSize: '1.5rem', color: 'black', fontWeight: '600' }}>పౌర సేవలు</p>
        </div>
      </div>

      {/* Nav Bar */}
      <nav style={{ background: '#0056b3', padding: '0 20px' }}>
        <div className="container" style={{ padding: 0, display: 'flex', gap: '5px', overflowX: 'auto' }}>
          
          <NavBtn 
            label="Home" 
            onClick={() => navigate('/')} 
            active={isActive('/')} 
          />
          
          <NavBtn 
            label="About Us" 
            onClick={() => navigate('/about')} 
            active={isActive('/about')}
          />
          
          <NavBtn 
            label="Services" 
            onClick={() => navigate('/services')}
            active={isActive('/services')}
          />
          
          <NavBtn 
            label="Report Issue" 
            onClick={() => navigate('/login')} 
            active={isActive('/login') || isActive('/signup')} 
          />
          
          {/* ✅ FIXED: Now points to '/contact-us' to match your App.jsx */}
          <NavBtn 
            label="Contact Us" 
            onClick={() => navigate('/contact-us')} 
            active={isActive('/contact-us')}
          />
        </div>
      </nav>
    </div>
  );
};

// Button Component
const NavBtn = ({ label, onClick, active }) => (
  <button 
    onClick={onClick} 
    style={{ 
      background: active ? '#003d80' : 'transparent', 
      color: 'white', 
      border: 'none', 
      padding: '12px 20px', 
      fontSize: '0.95rem', 
      cursor: 'pointer', 
      fontWeight: '500',
      transition: 'background 0.3s ease-in-out',
      borderBottom: active ? '4px solid #eab308' : '4px solid transparent',
      whiteSpace: 'nowrap'
    }}
    onMouseOver={(e) => !active && (e.target.style.background = '#004494')}
    onMouseOut={(e) => !active && (e.target.style.background = 'transparent')}
  >
    {label}
  </button>
);

export default GovHeader;