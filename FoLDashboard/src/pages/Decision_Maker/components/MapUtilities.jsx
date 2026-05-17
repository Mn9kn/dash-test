/**
 * MapUtilities.jsx
 * Helper components for map functionality
 */
import React, { useEffect } from 'react';
import { useMap, useMapEvents, Tooltip } from 'react-leaflet';

/**
 * Component to fly to a district coordinates when they change
 * 
 * @param {Object} props - Component props
 * @param {Array} props.coords - Coordinates to fly to [lat, lng]
 */
export const FlyToDistrict = ({ coords }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coords) map.flyTo(coords, 14);
  }, [coords, map]);
  
  return null;
};

/**
 * Component to handle map clicks
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onMapClick - Function to call when map is clicked
 */
export const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: () => {
      onMapClick();
    },
  });
  
  return null;
};

/**
 * Custom tooltip component for charts
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.active - Whether tooltip is active
 * @param {Array} props.payload - Data for the tooltip
 * @param {string} props.label - Label for the tooltip
 */
export const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        backgroundColor: 'white', 
        border: '1px solid #ccc',
        padding: '8px',
        borderRadius: '5px',
        fontSize: '12px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        maxWidth: '120px'
      }}>
        <div style={{ fontWeight: 'bold' }}>{`Year: ${label}`}</div>
        <div>{`Total: ${payload[0].value}`}</div>
      </div>
    );
  }
  return null;
};

// Export as a default object for convenience
const MapUtilities = {
  FlyToDistrict,
  MapClickHandler,
  CustomTooltip
};

export default MapUtilities;