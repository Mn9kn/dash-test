/**
 * DefaultSummaryCard.jsx
 * Displays an overview of city facilities when no district is selected
 * Preserves the exact appearance and functionality of the original implementation
 */
import React from 'react';

/**
 * DefaultSummaryCard Component
 * 
 * @param {Object} props Component props
 * @param {number} props.totalSchools Total number of police stations
 * @param {number} props.totalchildhoodCenters Total number of fire stations 
 * @param {number} props.totalUniversities Total number of mosques
 * @param {number} props.totalLibraries Total number of mosques
 * @param {Object} props.kacstColors Theme color constants
 */
const DefaultSummaryCard = ({ 
  totalSchools, 
  totalchildhoodCenters, 
  totalUniversities,
  totalLibraries,
  kacstColors 
}) => {
  return (
    <div 
      className="default-summary-card" 
      style={{
        position: "absolute",
        top: "70px", // Match the DistrictSummaryCard position
        right: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        width: "250px",
        zIndex: 1000,
        //border: `2px solid ${kacstColors.blue}`
        border: `2px`
      }}
    >
      <div style={{ marginBottom: "10px" }}>
        <h3 style={{ margin: 0, color: kacstColors.grey, marginBottom: "8px" }}>
          Riyadh City Overview
        </h3>
        <div style={{ height: "4px", background: `linear-gradient(to right, ${kacstColors.blue}, ${kacstColors.purple}, ${kacstColors.red})`, borderRadius: "2px", marginBottom: "12px" }}></div>
      </div>
      
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "12px"
      }}>
                {/* indicator1 */}
                <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "8px 12px",
          backgroundColor: "#f8f8f8",
          borderRadius: "6px",
          borderLeft: `4px solid ${kacstColors.purple}`,
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/icons/daycare.png" alt="childhoodCenter" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
            <span style={{ fontSize: "14px" }}>Indicator 1</span>
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "18px", 
            color: kacstColors.purple 
          }}>
            {totalchildhoodCenters}
          </div>
        </div>

        {/* Police Stations */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "8px 12px",
          backgroundColor: "#f8f8f8",
          borderRadius: "6px",
          borderLeft: `4px solid ${kacstColors.orange}`,
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/icons/school.png" alt="school" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
            <span style={{ fontSize: "14px" }}>Indicator 2</span>
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "18px", 
            color: kacstColors.orange 
          }}>
            {totalSchools}
          </div>
        </div>



      </div>
      
      <div style={{ 
        fontSize: "12px", 
        color: "#666", 
        marginTop: "12px", 
        textAlign: "center",
        fontStyle: "italic"
      }}>
        Select a district for detailed information
      </div>
    </div>
  );
};

export default DefaultSummaryCard;