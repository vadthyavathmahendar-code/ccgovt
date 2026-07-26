import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon resolution issue in React/Vite builds
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Component to handle map clicks and drag events
const LocationSelector = ({ position, setPosition, onAddressResolved }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      reverseGeocode(lat, lng);
    },
  });

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
        headers: {
          'Accept-Language': 'en'
        }
      });
      const data = await response.json();
      if (data && data.display_name) {
        onAddressResolved(data.display_name);
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
    }
  };

  useEffect(() => {
    if (position && map) {
      try {
        const zoom = map.getZoom();
        if (typeof zoom === 'number') {
          map.setView(position, zoom);
        }
      } catch (err) {
        console.warn('Leaflet setView safe bypass:', err);
      }
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker 
      position={position} 
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
          reverseGeocode(pos.lat, pos.lng);
        }
      }}
    />
  );
};

const MapView = ({ onLocationSelected, initialLocation }) => {
  const defaultCenter = [17.3850, 78.4867]; // Hyderabad, TS
  const [position, setPosition] = useState(initialLocation || defaultCenter);
  const [address, setAddress] = useState('');

  const handleAddressResolved = (addr) => {
    setAddress(addr);
    if (onLocationSelected) {
      onLocationSelected({
        latitude: position[0],
        longitude: position[1],
        address: addr
      });
    }
  };

  const locateUser = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          handleAddressResolved(`Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        },
        () => {
          console.warn("User denied geolocation access.");
        }
      );
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '280px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
      <MapContainer 
        key={initialLocation ? initialLocation.join(',') : 'default'}
        center={position} 
        zoom={13} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationSelector 
          position={position} 
          setPosition={setPosition} 
          onAddressResolved={handleAddressResolved} 
        />
      </MapContainer>
      
      {/* Geolocation Button overlay */}
      <button 
        type="button" 
        onClick={locateUser}
        style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          zIndex: 10,
          background: '#2563eb',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        🎯 Locate Me
      </button>
      
      {address && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          color: '#1e293b',
          zIndex: 10,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          maxHeight: '40px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          border: '1px solid #e2e8f0'
        }}>
          <strong>📍 Addr:</strong> {address}
        </div>
      )}
    </div>
  );
};

export default MapView;
