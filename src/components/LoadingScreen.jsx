import React from 'react';

const LoadingScreen = ({ message = "Loading Civic Connect..." }) => {
  return (
    <div className="loading-container">
      
      {/* --- 3D ANIMATED LOGO STAGE --- */}
      <div className="logo-stage">
        
        {/* 1. BLUE LINK (Background Layer) */}
        <div className="link blue-link"></div>

        {/* 2. GREEN LINK (Middle Layer - Sits on top generally) */}
        <div className="link green-link"></div>

        {/* 3. BLUE PATCH (Top Layer - Creates the weave effect) 
            This is a clone of the blue link, clipped to only show the bottom section 
            so it overlaps the green link there, creating the "interlock". */}
        <div className="link blue-patch"></div>

      </div>

      {/* --- TEXT & PROGRESS BAR --- */}
      <h2 className="loading-title">Civic Connect</h2>
      <p className="loading-message">{message}</p>
      
      <div className="progress-container">
        <div className="progress-bar"></div>
      </div>

      {/* --- CSS STYLES --- */}
      <style>{`
        /* CONTAINER */
        .loading-container {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: 'Segoe UI', sans-serif;
        }

        /* TEXT STYLES */
        .loading-title {
          margin: 0;
          color: #0f172a;
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 5px;
          letter-spacing: -0.5px;
        }

        .loading-message {
          margin: 0 0 30px 0;
          color: #64748b;
          font-size: 0.9rem;
          font-weight: 500;
          animation: fadeText 1.5s ease-in-out infinite alternate;
        }

        /* PROGRESS BAR */
        .progress-container {
          width: 200px;
          height: 6px;
          background: #f1f5f9;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #0ea5e9, #84cc16);
          border-radius: 10px;
          transform-origin: left;
          animation: slideBar 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }

        /* --- LOGO ANIMATION STAGE --- */
        .logo-stage {
          position: relative;
          width: 120px;
          height: 80px;
          margin-bottom: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* SHARED LINK STYLES */
        .link {
          position: absolute;
          width: 70px;
          height: 45px;
          border-radius: 25px; /* Perfect Stadium Shape */
          border: 12px solid transparent; /* Thickness */
          box-sizing: border-box;
          box-shadow: 
            inset 2px 2px 4px rgba(255, 255, 255, 0.4), /* Highlight */
            inset -2px -2px 4px rgba(0, 0, 0, 0.1),    /* Inner Shadow */
            2px 4px 8px rgba(0,0,0,0.15);             /* Drop Shadow */
        }

        /* BLUE LINK (Left) */
        .blue-link {
          left: 15px;
          border-color: #0ea5e9;
          border-right-color: transparent; /* Opening for C */
          background: linear-gradient(to bottom right, #38bdf8, #0369a1) border-box; 
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          
          z-index: 1;
          animation: slideBlue 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }

        /* GREEN LINK (Right) */
        .green-link {
          right: 15px;
          border-color: #84cc16;
          border-left-color: transparent; /* Opening for C */
          background: linear-gradient(to bottom right, #a3e635, #15803d) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;

          z-index: 2; /* Sits above Blue by default */
          animation: slideGreen 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }

        /* BLUE PATCH (The Magic Weave) */
        .blue-patch {
          left: 15px;
          border-color: #0ea5e9;
          border-right-color: transparent;
          background: linear-gradient(to bottom right, #38bdf8, #0369a1) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;

          /* CLIP: Show only the bottom half so it overlaps Green there */
          clip-path: polygon(0% 50%, 100% 50%, 100% 100%, 0% 100%);
          
          z-index: 3; /* Top Layer */
          animation: slideBlue 3s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
        }

        /* --- ANIMATIONS --- */
        @keyframes slideBlue {
          0% { transform: translateX(-40px); opacity: 0; }
          30% { transform: translateX(0px); opacity: 1; }
          80% { transform: translateX(0px); opacity: 1; }
          100% { transform: translateX(0px); opacity: 0; }
        }

        @keyframes slideGreen {
          0% { transform: translateX(40px); opacity: 0; }
          30% { transform: translateX(0px); opacity: 1; }
          80% { transform: translateX(0px); opacity: 1; }
          100% { transform: translateX(0px); opacity: 0; }
        }

        @keyframes slideBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fadeText {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;