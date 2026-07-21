import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { role, getRoleDefaultPath } = useAuth();

  const handleReturn = () => {
    const targetPath = getRoleDefaultPath(role);
    navigate(targetPath, { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🛑</div>
        <h1 style={styles.title}>403 - Access Denied</h1>
        <p style={styles.subtitle}>
          You do not have the required permissions to access this municipal portal module.
        </p>
        <button onClick={handleReturn} style={styles.btn}>
          Return to My Authorized Dashboard
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '70vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: '#f8fafc',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '480px',
    borderTop: '5px solid #ef4444',
  },
  icon: {
    fontSize: '3.5rem',
    marginBottom: '10px',
  },
  title: {
    margin: '0 0 10px',
    color: '#0f172a',
    fontSize: '1.75rem',
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem',
    lineHeight: '1.5',
    marginBottom: '25px',
  },
  btn: {
    background: '#2563eb',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};

export default Unauthorized;
