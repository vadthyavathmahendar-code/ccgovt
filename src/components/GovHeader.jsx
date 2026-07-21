import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';

const GovHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, profile, role, logout, getRoleDefaultPath } = useAuth();
  const { theme, toggleTheme, themeColors } = useTheme();

  const isActive = (path) => location.pathname === path;

  const handleDashboardClick = () => {
    const defaultPath = getRoleDefaultPath(role);
    navigate(defaultPath);
  };

  return (
    <div style={{ background: themeColors.surface, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* 1. Top Accessibility Strip */}
      <div style={{ background: themeColors.surfaceSecondary, padding: '6px 20px', fontSize: '0.75rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', color: themeColors.textSecondary, borderBottom: `1px solid ${themeColors.border}` }}>
        <span style={{ marginRight: 'auto', fontWeight: 'bold' }}>Government of Telangana • Civic Operations Portal</span>
        
        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            border: `1px solid ${themeColors.border}`,
            borderRadius: '15px',
            padding: '2px 10px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: themeColors.textPrimary,
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
          aria-label="Toggle Theme Mode"
        >
          {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: themeColors.textPrimary, fontWeight: '600' }}>
              👤 {profile?.full_name || user.email}
            </span>
            <span style={roleBadgeStyle(role)}>
              {(role || 'CITIZEN').toUpperCase().replace('_', ' ')}
            </span>
            <button onClick={logout} style={topLogoutBtnStyle}>
              Logout
            </button>
          </div>
        ) : (
          <span>Official Municipal Gateway</span>
        )}
      </div>

      {/* 2. Main Logo Header Area */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
        {/* Left Side Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <img 
            src="/images/cc_logo.png" 
            alt="Telangana Govt Logo" 
            style={{ height: '75px', width: 'auto', objectFit: 'contain' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ margin: 0, color: themeColors.textPrimary, fontSize: '1.6rem', fontWeight: 'bold', lineHeight: '1.1', fontFamily: '"Times New Roman", serif', letterSpacing: '0.5px' }}>
              Government of Telangana
            </h1>
            <h2 style={{ margin: '4px 0 0 0', color: themeColors.primary, fontSize: '1.25rem', fontWeight: '700', lineHeight: '1.1' }}>
              తెలంగాణ ప్రభుత్వం
            </h2>
          </div>
        </div>

        {/* Right Side Application Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ textAlign: 'right' }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: themeColors.primary, fontWeight: '800', letterSpacing: '-0.5px' }}>Civic Connect</h1>
            <p style={{ margin: 0, fontSize: '1rem', color: themeColors.textSecondary, fontWeight: '600' }}>పౌర సేవలు</p>
          </div>
          <img 
            src="/images/cc_logo.png" 
            alt="Civic Connect Logo" 
            style={{ height: '60px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>
      </div>

      {/* 3. Navigation Bar */}
      <nav style={{ background: themeColors.primary, padding: '0 20px' }}>
        <div className="container" style={{ padding: 0, display: 'flex', gap: '5px', overflowX: 'auto' }}>
          <NavBtn label="Home" onClick={() => navigate('/')} active={isActive('/')} />
          <NavBtn label="About Us" onClick={() => navigate('/about')} active={isActive('/about')} />
          <NavBtn label="Services" onClick={() => navigate('/services')} active={isActive('/services')} />
          <NavBtn label="Contact Us" onClick={() => navigate('/contact-us')} active={isActive('/contact-us')} />

          {user ? (
            <NavBtn 
              label="My Dashboard ➔" 
              onClick={handleDashboardClick} 
              active={isActive('/user-dashboard') || isActive('/admin-dashboard') || isActive('/employee-dashboard')}
              highlight={true}
            />
          ) : (
            <NavBtn 
              label="Citizen Portal Login" 
              onClick={() => navigate('/login')} 
              active={isActive('/login') || isActive('/signup')} 
              highlight={true}
            />
          )}
        </div>
      </nav>
    </div>
  );
};

const NavBtn = ({ label, onClick, active, highlight }) => (
  <button 
    onClick={onClick} 
    style={{ 
      background: active ? '#003d80' : highlight ? '#facc15' : 'transparent', 
      color: highlight && !active ? '#0f172a' : 'white', 
      border: 'none', 
      padding: '12px 22px', 
      fontSize: '0.95rem', 
      cursor: 'pointer', 
      fontWeight: highlight || active ? '700' : '500',
      transition: 'all 0.2s ease-in-out',
      borderBottom: active ? '4px solid #facc15' : '4px solid transparent', 
      whiteSpace: 'nowrap',
      borderRadius: highlight && !active ? '4px 4px 0 0' : '0'
    }}
  >
    {label}
  </button>
);

const roleBadgeStyle = (role) => ({
  padding: '2px 8px',
  borderRadius: '10px',
  background: role === 'super_admin' ? '#ffd700' : role === 'dept_admin' ? '#0284c7' : role === 'employee' ? '#16a34a' : '#64748b',
  color: role === 'super_admin' ? '#000' : '#fff',
  fontSize: '0.7rem',
  fontWeight: 'bold',
});

const topLogoutBtnStyle = {
  background: '#ef4444',
  color: 'white',
  border: 'none',
  padding: '2px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.75rem',
  fontWeight: '600',
};

export default GovHeader;