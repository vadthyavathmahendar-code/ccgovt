import React from 'react';

const LoadingScreen = ({ message = "Loading Civic Connect..." }) => {
  return (
    <div style={styles.container}>
      
      {/* 3D LOGO STAGE */}
      <div className="logo-stage">
        
        {/* 1. BLUE LINK (Background Layer) */}
        <div className="link blue-link"></div>

        {/* 2. GREEN LINK (Middle Layer - Sits on top of Blue) */}
        <div className="link green-link"></div>

        {/* 3. BLUE PATCH (Top Layer - Creates the weave effect) 
            This is a clone of the blue link, clipped to only show the bottom section 
            so it can overlap the green link there. */}
        <div className="link blue-patch"></div>

      </div>

      {/* TEXT & PROGRESS */}
      <h2 style={styles.title}>Civic Connect</h2>
      <p style={styles.message}>{message}</p>
      
      <div style={styles.progressContainer}>
        <div style={styles.progressBar}></div>
      </div>

      <style>{`
        /* --- STAGE --- */
        .logo-stage {
          position: relative;
          width: 160px;
          height: 100px;
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* --- SHARED LINK STYLES --- */
        .link {
          position: absolute;
          width: 90px;
          height: 55px;
          border-radius: 30px; /* Perfect Stadium Shape */
          border: 14px solid transparent; /* Thickness of the ring */
          box-sizing: border-box;
          
          /* This creates the "3D Tube" look with internal shadows */
          box-shadow: 
            inset 2px 2px 4px rgba(255, 255, 255, 0.4), /* Highlight Top-Left */
            inset -2px -2px 4px rgba(0, 0, 0, 0.2),    /* Shadow Bottom-Right */
            2px 4px 8px rgba(0,0,0,0.2);              /* Drop Shadow */
        }

        /* --- BLUE LINK (Left C) --- */
        .blue-link {
          left: 10px;
          border-color: #0ea5e9; /* Base Blue */
          border-right-color: transparent; /* Opening for C */
          background: linear-gradient(to bottom right, #38bdf8, #0369a1) border-box; 
          /* Use mask to hide center background but keep border gradient */
          -webkit-mask: 
             linear-gradient(#fff 0 0) padding-box, 
             linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          
          /* Animation */
          animation: slideBlue 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          z-index: 1; /* Bottom Layer */
        }

        /* --- GREEN LINK (Right C) --- */
        .green-link {
          right: 10px;
          border-color: #84cc16; /* Base Green */
          border-left-color: transparent; /* Opening for C */
          background: linear-gradient(to bottom right, #a3e635, #15803d) border-box;
          
          -webkit-mask: 
             linear-gradient(#fff 0 0) padding-box, 
             linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;

          /* Animation */
          animation: slideGreen 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          z-index: 2; /* Middle Layer (Overlaps Blue by default) */
        }

        /* --- BLUE PATCH (The Magic Weave) --- */
        .blue-patch {
          left: 10px;
          border-color: #0ea5e9;
          border-right-color: transparent;
          background: linear-gradient(to bottom right, #38bdf8, #0369a1) border-box;
          
          -webkit-mask: 
             linear-gradient(#fff 0 0) padding-box, 
             linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;

          /* CRITICAL: Clip path only shows the BOTTOM-RIGHT curve of the blue link */
          clip-path: polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%);
          
          /* Animation must match Blue Link exactly */
          animation: slideBlue 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
          z-index: 3; /* Top Layer (Covers Green at the bottom) */
        }

        /* --- KEYFRAMES --- */
        @keyframes slideBlue {
          0% { transform: translateX(-60px); opacity: 0; }
          40% { transform: translateX(0px); opacity: 1; } /* Snap to center */
          80% { transform: translateX(0px); opacity: 1; } /* Hold */
          100% { transform: translateX(0px); opacity: 0; } /* Fade out */
        }

        @keyframes slideGreen {
          0% { transform: translateX(60px); opacity: 0; }
          40% { transform: translateX(0px); opacity: 1; } /* Snap to center */
          80% { transform: translateX(0px); opacity: 1; } /* Hold */
          100% { transform: translateX(0px); opacity: 0; } /* Fade out */
        }

        @keyframes slideBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        @keyframes fadeText {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// --- STYLES ---
const styles = {
  container: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: '#ffffff',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
  },
  title: {
    margin: '0',
    color: '#0f172a',
    fontSize: '2rem',
    fontWeight: '800',
    marginBottom: '5px',
    letterSpacing: '-0.5px',
    fontFamily: '"Segoe UI", sans-serif',
  },
  message: {
    margin: '0 0 30px 0',
    color: '#64748b',
    fontSize: '0.9rem',
    fontWeight: '500',
    animation: 'fadeText 1.5s infinite',
  },
  progressContainer: {
    width: '200px',
    height: '6px',
    background: '#f1f5f9',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #0ea5e9, #84cc16)',
    borderRadius: '10px',
    animation: 'slideBar 3s linear infinite',
  }
};

export default LoadingScreen;