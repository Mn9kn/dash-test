/**
 * KpiCards.jsx 
 * Container component that manages all three KPI cards and their expansion state
 * With in-place expansion that maintains consistent layout
 */
import React, { useState, useRef } from 'react';
import BirthMortalityCard from './BirthMortalityCard';
import HealthFacilitiesCard from './HealthFacilities';
import InsuranceCoverageCard from './InsuranceCoverageCard';

/**
 * KPI Cards Container Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.kacstColors - Theme colors
 * @param {Array} props.birthMortalityData - Crime rate data
 * @param {Array} props.healthFacilitiesData
 * @param {Array} props.insuranceCoverageData - Traffic incidents data

 */
const KpiCards = ({ 
  kacstColors, 
  birthMortalityData, 
  insuranceCoverageData,
  healthFacilitiesData,
}) => {
  // Refs for card elements
  const cardRefs = {
    birthMortality: useRef(null),
    insurance: useRef(null),
    facilities: useRef(null)
  };
  
  // State for managing crime rate data visualization
  const [selectedYear, setSelectedYear] = useState(2024);
  const [selectedYear2, setSelectedYear2] = useState(2024);

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
      {/* Crime Rate Card */}
      <BirthMortalityCard 
        birthMortalityData={birthMortalityData}
        kacstColors={kacstColors}
        cardRef={cardRefs.birthMortality}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedYearData={selectedYearData}
        style={getCardStyle('crime')}
      />
      {/* Traffic Incidents Card */}
      <InsuranceCoverageCard 
        insuranceCoverageData={insuranceCoverageData}
        kacstColors={kacstColors}
        cardRef={cardRefs.insurance}
        selectedYear={selectedYear2}
        setSelectedYear={setSelectedYear2}
        style={getCardStyle('insurance')}
      />

      {/* Crime Rate Card */}
      <HealthFacilitiesCard 
        healthFacilitiesData={healthFacilitiesData}
        kacstColors={kacstColors}
        cardRef={cardRefs.facilities}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedYearData={selectedYearData}
        style={getCardStyle('crime')}
      />
      

    </div>
  );
};

export default KpiCards;