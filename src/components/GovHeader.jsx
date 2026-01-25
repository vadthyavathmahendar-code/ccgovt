import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const GovHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
      
      {/* 1. Top Strip (Accessibility & Language) */}
      <div style={{ background: '#f1f1f1', padding: '5px 20px', fontSize: '0.75rem', display: 'flex', justifyContent: 'flex-end', gap: '15px', color: '#555', borderBottom: '1px solid #ddd' }}>
        <span style={{ marginRight: 'auto', fontWeight: 'bold' }}>Government of Telangana</span>
        <span style={{ cursor: 'pointer' }}>Skip to Main Content</span>
        <span style={{ cursor: 'pointer' }}>A+</span>
        <span style={{ cursor: 'pointer' }}>A-</span>
        <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>English | తెలుగు</span>
      </div>

      {/* 2. Main Logo Area */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 20px' }}>
        
        {/* Left Side: TS Logo + Govt Text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          {/* TS LOGO */}
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Government_of_Telangana_Logo.png/600px-Government_of_Telangana_Logo.png" 
            alt="Telangana Govt Logo" 
            style={{ height: '85px', width: 'auto', objectFit: 'contain' }} 
          />
          
          {/* TEXT */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ margin: 0, color: '#1a202c', fontSize: '1.8rem', fontWeight: 'bold', lineHeight: '1.1', fontFamily: '"Times New Roman", serif', letterSpacing: '0.5px' }}>
              Government of Telangana
            </h1>
            <h2 style={{ margin: '5px 0 0 0', color: '#0056b3', fontSize: '1.4rem', fontWeight: '700', lineHeight: '1.1' }}>
              తెలంగాణ ప్రభుత్వం
            </h2>
          </div>
        </div>

        {/* Right Side: Civic Connect Text + New Logo */}
        <div style={{ display: window.innerWidth < 768 ? 'none' : 'flex', alignItems: 'center', gap: '15px' }}>
          
          {/* Text Block */}
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#0056b3', fontWeight: '800', letterSpacing: '-1px' }}>Civic Connect</h1>
            <p style={{ margin: 0, fontSize: '1.2rem', color: '#333', fontWeight: '600' }}>పౌర సేవలు</p>
          </div>

          {/* NEW CIVIC CONNECT LOGO (Right Side) */}
          <img 
            src="/images/cc_logo.png" 
            alt="Civic Connect Logo" 
            style={{ height: '70px', width: 'auto', objectFit: 'contain' }} 
          />

        </div>

      </div>

      {/* 3. Navigation Bar */}
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
      padding: '12px 25px', 
      fontSize: '1rem', 
      cursor: 'pointer', 
      fontWeight: '500',
      transition: 'all 0.2s ease-in-out',
      borderBottom: active ? '4px solid #facc15' : '4px solid transparent', 
      whiteSpace: 'nowrap'
    }}
    onMouseOver={(e) => !active && (e.target.style.background = '#004494')}
    onMouseOut={(e) => !active && (e.target.style.background = 'transparent')}
  >
    {label}
  </button>
);

export default GovHeader;