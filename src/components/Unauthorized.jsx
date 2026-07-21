import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { role, getRoleDefaultPath } = useAuth();

  const handleReturn = () => {
    const targetPath = getRoleDefaultPath(role);
    navigate(targetPath, { replace: true });
  };

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', maxWidth: '480px' }}>
        <h1 style={{ margin: '0 0 10px', color: '#0f172a', fontSize: '1.75rem', fontWeight: '800' }}>403 - Access Denied</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '25px' }}>
          You do not have the required permissions to access this module.
        </p>
        <button onClick={handleReturn} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>
          Return to My Authorized Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
