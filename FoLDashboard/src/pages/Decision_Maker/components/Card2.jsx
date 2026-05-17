// Refactored BirthMortalityCard.jsx
// Finalized layout with adjusted legend, full axis titles, and data source positioning.

import React from 'react';

const Card2 = ({
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

export default Card2;
