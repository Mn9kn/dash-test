/**
 * KpiCards.jsx 
 * Container component that manages all three KPI cards and their expansion state
 * With in-place expansion that maintains consistent layout
 */
import React, { useState, useRef } from 'react';
import Card2 from './Card2';
import Card3 from './Card3';
import Card1 from './Card1';

/**
 * KPI Cards Container Componentf
 * 
 * @param {Object} props - Component props
 * @param {Object} props.kacstColors - Theme colors
 * @param {Array} props.literacyRateData - Crime rate data
 * @param {Array} props.educationFacilitiesData
 * @param {Array} props.enrollemntRateData - Traffic incidents data

 */
const KpiCards = ({ 
  kacstColors, 
  literacyRateData, 
  enrollemntRateData,
  educationFacilitiesData,
}) => {
  // Refs for card elements
  const cardRefs = {
    literacyRate: useRef(null),
    enrollemnt: useRef(null),
    facilities: useRef(null)
  };
  
  // State for managing crime rate data visualization
  const [selectedYear, setSelectedYear] = useState(2024);
  const selectedYearData = useState(null);
  
  

  // Determine the appropriate styles based on expansion state
  const getCardStyle = (cardId) => {
    // Base styles common to all states
    const baseStyle = {
      flex: 1,
      position: 'relative'
    };

    // Default state (nothing expanded)
    return baseStyle;
  };

  return (
    <div className="kpi-cards-container" style={{ 
      width: "100%", 
      display: "flex", 
      gap: "16px", 
      position: "relative",
      minHeight: "400px", // Ensure minimum height
      margin: "0 auto",
      marginTop: "20px",
      marginBottom: "20px",
    }}>

            {/* Traffic Incidents Card */}
            <Card1 
        enrollemntRateData={enrollemntRateData}
        kacstColors={kacstColors}
        cardRef={cardRefs.enrollemnt}
        style={getCardStyle('enrollemnt')}
      />
      
      {/* Crime Rate Card */}
      <Card2 
        literacyRateData={literacyRateData}
        kacstColors={kacstColors}
        cardRef={cardRefs.literacyRate}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedYearData={selectedYearData}
        style={getCardStyle('literacy')}
      />


      {/* Crime Rate Card */}
      <Card3
        educationFacilitiesData={educationFacilitiesData}
        kacstColors={kacstColors}
        cardRef={cardRefs.facilities}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedYearData={selectedYearData}
        style={getCardStyle('educationFacilities')}
      />
      

    </div>
  );
};

export default KpiCards;