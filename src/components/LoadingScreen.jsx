import React from 'react';

const LoadingScreen = ({ message = "Loading Civic Connect..." }) => {
  return (
    <div style={styles.container}>
      {/* Animated Logo Container */}
      <div style={styles.logoWrapper}>
        <div style={styles.pulseRing}></div>
        <div style={{ fontSize: '3rem', position: 'relative', zIndex: 2 }}>🏛️</div>
      </div>

      {/* Loading Text */}
      <h2 style={styles.title}>Civic Connect</h2>
      <p style={styles.message}>{message}</p>
      
      {/* Progress Bar */}
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}></div>
      </div>

      {/* CSS Animation Styles */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(37, 99, 235, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        @keyframes slide {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes fadeText {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // On top of everything
  },
  logoWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '20px',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: '50%',
    border: '1px solid #3b82f6',
    animation: 'pulse 2s infinite',
  },
  title: {
    margin: '0',
    color: '#0f172a',
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '5px',
  },
  message: {
    margin: '0 0 20px 0',
    color: '#64748b',
    fontSize: '0.9rem',
    animation: 'fadeText 1.5s infinite ease-in-out',
  },
  progressContainer: {
    width: '200px',
    height: '4px',
    background: '#e2e8f0',
    borderRadius: '2px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    width: '50%',
    background: '#2563eb',
    animation: 'slide 1.5s infinite linear',
  }
};

export default LoadingScreen;