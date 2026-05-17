/**
 * DataIndicator.jsx
 * A reusable component for displaying data metrics with standardized trend indicators
 * Enhanced to use consistent arrow indicators for increases/decreases
 */
import React from 'react';

/**
 * DataIndicator Component
 * 
 * Mobile-friendly data indicator component for displaying metrics
 * 
 * @param {Object} props - Component props
 * @param {string} props.label - Label for the data
 * @param {string|number} props.value - Value to display
 * @param {string} props.color - Color for the value text
 * @param {number} [props.changeValue] - Optional numeric change value (positive for increase, negative for decrease)
 * @param {string} [props.unit=''] - Optional unit to display after value
 * @param {string} [props.size='normal'] - Size variant ('small', 'normal', or 'large')
 * @param {boolean} [props.reverseColors=false] - If true, reverse red/green colors (for metrics where decrease is good)
 * @param {boolean} [props.valueIsPercentage=false] - If true, adds % after the value; otherwise no % is added
 */
const DataIndicator = ({ 
  label, 
  value, 
  color, 
  changeValue, 
  unit = "", 
  size = "normal",
  reverseColors = false,
  valueIsPercentage = false
}) => {
  const fontSize = size === "large" ? "20px" : size === "small" ? "14px" : "16px";
  const labelSize = size === "large" ? "14px" : "12px";
  const arrowSize = size === "large" ? "16px" : "14px";
  
  // Determine if we should show a trend arrow
  const showTrend = changeValue !== undefined && changeValue !== null;
  const isPositive = changeValue > 0;
  
  // Define colors for increase/decrease (can be reversed for metrics where decrease is good)
  const increaseColor = reverseColors ? "#ED174C" : "#48A842"; // Default: Green for increase
  const decreaseColor = reverseColors ? "#48A842" : "#ED174C"; // Default: Red for decrease
  
  // Choose appropriate color based on direction
  const trendColor = isPositive ? increaseColor : decreaseColor;
  
  return (
    <div style={{ 
      textAlign: "center",
      padding: "5px",
      minWidth: "70px"
    }}>
      <div style={{ 
        fontSize: labelSize, 
        color: "#666", 
        marginBottom: "4px",
        whiteSpace: "nowrap"
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: fontSize, 
        fontWeight: "bold", 
        color: color || "#333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        {value}
        {/* Only add unit to the main value if it's NOT a change value */}
        {!showTrend && unit && <span style={{ fontSize: "12px", marginLeft: "2px" }}>{unit}</span>}
        
        {/* Display trend arrow if changeValue is provided */}
        {showTrend && (
          <span style={{ 
            marginLeft: "5px",
            color: trendColor,
            fontSize: arrowSize,
            fontWeight: "bold",
            display: "flex",
            alignItems: "center"
          }}>
            {isPositive ? (
              <>
                <span style={{ fontSize: size === "small" ? "10px" : "12px" }}>+</span>
                {Math.abs(changeValue)}{unit && unit}
                <span style={{ marginLeft: "2px" }}>↑</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: size === "small" ? "10px" : "12px" }}>-</span>
                {Math.abs(changeValue)}{unit && unit}
                <span style={{ marginLeft: "2px" }}>↓</span>
              </>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default DataIndicator;