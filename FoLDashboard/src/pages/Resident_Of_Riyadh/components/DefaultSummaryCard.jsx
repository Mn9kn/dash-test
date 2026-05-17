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
 * @param {number} props.totalPharmacies Total number of police stations
 * @param {number} props.totalHospitals Total number of hospitals
 * @param {number} props.totalPharmacies24 Total number of mosques
 * @param {number} props.totalBloodCenters Total number of mosques
 * @param {Object} props.kacstColors Theme color constants
 */
const DefaultSummaryCard = ({ 
  totalPharmacies, 
  totalHospitals, 
  totalPharmacies24,
  totalBloodCenters,
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
                {/* Hospitals */}
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
            <img src="/icons/Hos.png" alt="Hospital" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
            <span style={{ fontSize: "14px" }}>Hospitals</span>
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "18px", 
            color: kacstColors.purple 
          }}>
            {totalHospitals}
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
            <img src="/icons/Ph.png" alt="Police" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
            <span style={{ fontSize: "14px" }}>Pharmacies</span>
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "18px", 
            color: kacstColors.orange 
          }}>
            {totalPharmacies}
          </div>
        </div>
        
        
        {/* Mosques */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "8px 12px",
          backgroundColor: "#f8f8f8",
          borderRadius: "6px",
          borderLeft: `4px solid ${kacstColors.green}`,
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/icons/24HPh.png" alt="Mosque" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
            <span style={{ fontSize: "14px" }}>24h Pharmacies</span>
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "18px", 
            color: kacstColors.green 
          }}>
            {totalPharmacies24}
          </div>
        </div>

          {/* Blood donation centers */}
          <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "8px 12px",
          backgroundColor: "#f8f8f8",
          borderRadius: "6px",
          borderLeft: `4px solid ${kacstColors.red}`,
        }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src="/icons/BDC.png" alt="Blood" style={{ width: "20px", height: "20px", marginRight: "10px" }} />
            <span style={{ fontSize: "14px" }}>Blood Donation Centers</span>
          </div>
          <div style={{ 
            fontWeight: "bold", 
            fontSize: "18px", 
            color: kacstColors.red 
          }}>
            {totalBloodCenters}
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