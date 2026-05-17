//TrafficIncidentsCard.js
//Component for displaying traffic safety statistics and trends
//Updated with integrated year range selector and standardized indicators
import React from 'react';


const Card1 = ({
  style,
}) => {


  return (
    <div
      className="kpi-card"
      style={{
        flex: '1',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        height: '400px',
        overflow: 'visible',
        transition: 'all 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >

    </div>
  );
};

export default Card1;