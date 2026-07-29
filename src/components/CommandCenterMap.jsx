import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom pulsing SVG markers based on status and priority
const createCustomIcon = (status, priority) => {
  let color = '#22c55e'; // Green - Resolved
  if (status === 'Pending') {
    color = priority === 'Critical' ? '#ef4444' : '#eab308'; // Red or Yellow
  } else if (status === 'In Progress') {
    color = '#3b82f6'; // Blue
  } else if (status === 'Closed') {
    color = '#10b981'; // Emerald
  } else if (priority === 'Critical') {
    color = '#ef4444'; // Critical is always Red
  }

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 18px;
        height: 18px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          position: absolute;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: ${color};
          opacity: 0.35;
          animation: pulse 1.6s infinite ease-in-out;
        "></span>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
      </style>
    `,
    className: 'custom-map-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

const CommandCenterMap = ({ complaints = [], onSelectComplaint }) => {
  const hyderabadCenter = [17.3850, 78.4867];

  // Helper to generate deterministic coordinates if latitude/longitude are missing
  const getCoordinates = (complaint) => {
    if (complaint.latitude && complaint.longitude) {
      return [complaint.latitude, complaint.longitude];
    }
    // Fallback coordinates based on ID so they scatter realistically around Hyderabad
    const idNum = parseInt(String(complaint.id).slice(0, 5), 10) || 12345;
    const latOffset = ((idNum % 100) - 50) * 0.0015;
    const lngOffset = (((idNum * 17) % 100) - 50) * 0.0015;
    return [hyderabadCenter[0] + latOffset, hyderabadCenter[1] + lngOffset];
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer 
        center={hyderabadCenter} 
        zoom={12} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {complaints.map((c) => {
          const coords = getCoordinates(c);
          return (
            <Marker 
              key={c.id} 
              position={coords} 
              icon={createCustomIcon(c.status, c.priority)}
            >
              <Popup>
                <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '0.8rem', minWidth: '180px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold' }}>#{String(c.id).slice(0, 6).toUpperCase()}</span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      background: c.priority === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                      color: c.priority === 'Critical' ? '#ef4444' : '#3b82f6',
                      fontWeight: 'bold'
                    }}>{c.priority || 'Normal'}</span>
                  </div>
                  
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '0.9rem', color: '#0f172a', fontWeight: 'bold' }}>{c.title}</h4>
                  <p style={{ margin: '0 0 8px 0', color: '#475569', fontSize: '0.75rem', lineHeight: '1.3' }}>{c.description?.slice(0, 80)}...</p>

                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '6px', fontSize: '0.7rem', color: '#64748b' }}>
                    <strong>Category:</strong> {c.category}<br />
                    <strong>Status:</strong> {c.status}<br />
                    <strong>Assignee:</strong> {c.assigned_to || 'Unassigned'}
                  </div>

                  {onSelectComplaint && (
                    <button 
                      onClick={() => onSelectComplaint(c)}
                      style={{
                        marginTop: '10px',
                        width: '100%',
                        padding: '6px',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      View Complaint Details
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Legend */}
      <div style={{
        position: 'absolute',
        top: '15px',
        right: '15px',
        zIndex: 10,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '0.75rem',
        color: '#1f2937'
      }}>
        <h5 style={{ margin: '0 0 8px 0', fontWeight: 'bold', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Priority Map Status</h5>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }}></span>
            <span>Critical / High</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
            <span>In Progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#eab308', display: 'inline-block' }}></span>
            <span>Pending Allocation</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
            <span>Resolved</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCenterMap;
