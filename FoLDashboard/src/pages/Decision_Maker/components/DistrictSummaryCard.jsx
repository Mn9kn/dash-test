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
 * @param {Array} props.literacyData - Array of safety perception data
 * @param {Function} props.getLiteracyColor - Function to get safety color based on score
s */
const DistrictSummaryCard = ({ 
  selectedDistrict, 
  facilityCounts, 
  setShowSummaryCard,
  kacstColors,
  literacyData,
  getLiteracyColor,
}) => {
  
  const getLiteracyData = () => {
    if (!selectedDistrict) return null;
    
    const districtName = selectedDistrict.name_en || selectedDistrict.label;
    const districtData = literacyData.find(
      d => d.name_en === districtName
    );
    
    return districtData ? districtData["Literacy_Rate"] : null;
  };
  
  const literacyScore = getLiteracyData();
  
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

        {literacyScore !== null && (
          <div style={{ 
            marginBottom: "15px", 
            backgroundColor: "#f8f8f8", 
            padding: "8px", 
            borderRadius: "5px",
            border: `1px solid ${getLiteracyColor(literacyScore)}`
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
              <span>Indicator 0:</span>
              <span style={{ 
                color: getLiteracyColor(literacyScore),
                fontSize: "16px" 
              }}>
                {(literacyScore).toFixed(1)}%
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
                width: `${literacyScore}%`, 
                backgroundColor: getLiteracyColor(literacyScore)
              }} />
            </div>
            <div style={{ 
              fontSize: "12px", 
              color: "#666", 
              textAlign: "right",
              marginTop: "3px"
            }}>
              {/* {literacyScore.toFixed(1)}% */}
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
          <img src="/icons/daycare.png" alt="Hospital" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
          <span>Indicator 1: <b>{facilityCounts.childhoodCenters}</b></span>
        </div>

        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          marginBottom: "5px",
          fontSize: "14px"
        }}>
          <img src="/icons/school.png" alt="Police" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
          <span>Indicator 2: <b>{facilityCounts.schools}</b></span>
        </div>
{/*         
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          marginBottom: "5px",
          fontSize: "14px"
        }}>
          <img src="/icons/university.png" alt="Mosque" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
          <span>Universities: <b>{facilityCounts.universities}</b></span>
        </div>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          fontSize: "14px"
        }}>
          <img src="/icons/library.png" alt="Mosque" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
          <span>Libraries: <b>{facilityCounts.libraries}</b></span>
        </div> */}

      </div>
    </div>
  );
};

export default DistrictSummaryCard;