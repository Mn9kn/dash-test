/**
 * DistrictSummaryCard.jsx
 * A component to display summary information for a selected district
 * Preserves the exact appearance and functionality of the original implementation
 */
import React from 'react';

/**
 * District Summary Card Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.selectedDistrict - The currently selected district data
 * @param {Object} props.facilityCounts - Counts of facilities in the district
 * @param {Function} props.setShowSummaryCard - Function to toggle card visibility
 * @param {Object} props.kacstColors - Object with color definitions
 * @param {Array} props.birthData - Array of safety perception data
 * @param {Function} props.getBirthColor - Function to get safety color based on score
 * @param {Array} props.mortalityData - Array of safety perception data
 * @param {Function} props.getMortalityColor - Function to get safety color based on score
s */
const DistrictSummaryCard = ({ 
  selectedDistrict, 
  facilityCounts, 
  setShowSummaryCard,
  kacstColors,
  birthData,
  getBirthColor,
  mortalityData,
  getMortalityColor
}) => {

  const getBirthData = () => {
    if (!selectedDistrict) return null;
    
    const districtName = selectedDistrict.name_en || selectedDistrict.label;
    const districtData = birthData.find(
      d => d.name_en === districtName
    );
    
    return districtData ? districtData["Birth_Rate"] : null;
  };
  
  const birthScore = getBirthData();
  
  const getMortalityData = () => {
    if (!selectedDistrict) return null;
    
    const districtName = selectedDistrict.name_en || selectedDistrict.label;
    const districtData = mortalityData.find(
      d => d.name_en === districtName
    );
    
    return districtData ? districtData["Mortality_Rate"] : null;
  };
  
  const mortalityScore = getMortalityData();
  
  return (
    <div 
      className="district-summary-card" 
      style={{
        position: "absolute",
        top: "70px",
        right: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        width: "250px",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h3 style={{ margin: 0, color: '#222' }}>
          {selectedDistrict.name_en || selectedDistrict.label}
        </h3>
        <button 
          onClick={() => setShowSummaryCard(false)}
          style={{ 
            background: "none", 
            border: "none", 
            cursor: "pointer", 
            fontSize: "18px",
            color: "#666"
          }}
        >
          ×
        </button>
      </div>
      <div style={{ borderTop: "1px solid #eee", paddingTop: "8px" }}>
        <div style={{ fontSize: "14px", color: "#666", marginBottom: "8px" }}>
          {selectedDistrict.name} {/* Display Arabic name */}
        </div>

        {birthScore !== null && (
          <div style={{ 
            marginBottom: "15px", 
            backgroundColor: "#f8f8f8", 
            padding: "8px", 
            borderRadius: "5px",
            border: `1px solid ${getBirthColor(birthScore)}`
          }}>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: "bold", 
              color: "#444",
              marginBottom: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>Birth Rate (2024):</span>
              <span style={{ 
                color: getBirthColor(birthScore),
                fontSize: "16px" 
              }}>
                {(birthScore).toFixed(1)}
              </span>
            </div>
            <div style={{ 
              height: "8px", 
              width: "100%", 
              backgroundColor: "#e0e0e0",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{ 
                height: "100%", 
                width: `${birthScore}%`, 
                backgroundColor: getBirthColor(birthScore)
              }} />
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#666", 
              textAlign: "right",
              marginTop: "3px"
            }}>
              {birthScore.toFixed(1)} per 1000 people
            </div>
          </div>
        )}


{mortalityScore !== null && (
          <div style={{ 
            marginBottom: "15px", 
            backgroundColor: "#f8f8f8", 
            padding: "8px", 
            borderRadius: "5px",
            border: `1px solid ${getMortalityColor(mortalityScore)}`
          }}>
            <div style={{ 
              fontSize: "14px", 
              fontWeight: "bold", 
              color: "#444",
              marginBottom: "5px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span>Mortality Rate (2024):</span>
              <span style={{ 
                color: getMortalityColor(mortalityScore),
                fontSize: "16px" 
              }}>
                {(mortalityScore).toFixed(1)}
              </span>
            </div>
            <div style={{ 
              height: "8px", 
              width: "100%", 
              backgroundColor: "#e0e0e0",
              borderRadius: "4px",
              overflow: "hidden"
            }}>
              <div style={{ 
                height: "100%", 
                width: `${mortalityScore}%`, 
                backgroundColor: getMortalityColor(mortalityScore)
              }} />
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#666", 
              textAlign: "right",
              marginTop: "3px"
            }}>
              {mortalityScore.toFixed(1)} per 1000 people
            </div>
          </div>
        )}


        {/* Facilities Section */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "5px",
          fontSize: "14px" 
        }}>
          <img src="/icons/Hos.png" alt="Hospital" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
          <span>Hospitals: <b>{facilityCounts.hospital}</b></span>
        </div>

        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "5px",
          fontSize: "14px"
        }}>
          <img src="/icons/Ph.png" alt="Pharmacy" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
          <span>Pharmacies: <b>{facilityCounts.pharmacy}</b></span>
        </div>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          marginBottom: "5px",
          fontSize: "14px"
        }}>
          <img src="/icons/24HPh.png" alt="Pharmacy24" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
          <span>24h Pharmacies: <b>{facilityCounts.pharmacy24}</b></span>
        </div>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          fontSize: "14px"
        }}>
          <img src="/icons/BDC.png" alt="Blood" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
          <span>Blood Donation Centers: <b>{facilityCounts.blood}</b></span>
        </div>

      </div>
    </div>
  );
};

export default DistrictSummaryCard;