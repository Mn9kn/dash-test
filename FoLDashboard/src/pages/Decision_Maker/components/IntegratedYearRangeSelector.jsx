/**
 * IntegratedYearRangeSelector.jsx
 * 
 * This component combines year range selection and individual year focus
 * into a single, cohesive user interface element using a timeline slider with
 * draggable handles.
 * 
 * Features:
 * - Visual year range selection with draggable handles
 * - Individual year selection within the range 
 * - Quick selection buttons for common ranges (Last 5 Years, All Years)
 * - Visual highlighting of selected range and active year
 * - Light theme design matching the website's overall theme
 */

import React, { useState, useEffect } from "react";

// KACST Theme Colors - shared across dashboard
const kacstColors = {
  blue: "#4056F4", // Primary blue
  purple: "#8A3FBD", // Purple accent
  green: "#48A842", // Green accent
  red: "#ED174C", // Red accent
  orange: "#FF8C00" // Orange accent
};

/**
 * IntegratedYearRangeSelector Component
 * 
 * @param {Array} allYears - Array of all available years as strings
 * @param {Function} onRangeChange - Callback when range selection changes
 * @param {Function} onYearSelect - Callback when single year is selected
 * @param {Array} initialRange - Initial range as [startIndex, endIndex]
 * @param {String} initialSelectedYear - Initial selected year
 */
const IntegratedYearRangeSelector = ({
  allYears,
  onRangeChange,
  onYearSelect,
  initialRange = [0, 0],
  initialSelectedYear = null
}) => {
  // State for tracking selections
  const [selectedRange, setSelectedRange] = useState(initialRange);
  const [selectedYear, setSelectedYear] = useState(initialSelectedYear || allYears[allYears.length - 1]);
  const [hoveredYear, setHoveredYear] = useState(null);
  
  // State for handle positions
  const [leftHandlePos, setLeftHandlePos] = useState(selectedRange[0]);
  const [rightHandlePos, setRightHandlePos] = useState(selectedRange[1]);
  
  // State for tracking handle dragging
  const [isDragging, setIsDragging] = useState(null); // 'left', 'right', or null
  
  /**
   * Update range when handles move and notify parent component
   */
  useEffect(() => {
    const newRange = [leftHandlePos, rightHandlePos];
    setSelectedRange(newRange);
    
    // Only call the parent's handler if the range actually changed
    if (newRange[0] !== initialRange[0] || newRange[1] !== initialRange[1]) {
      onRangeChange && onRangeChange(newRange);
    }
  }, [leftHandlePos, rightHandlePos, initialRange, onRangeChange]);
  
  /**
   * Handle individual year selection
   * Triggers callback to parent component
   */
  const handleYearClick = (yearIndex) => {
    const year = allYears[yearIndex];
    setSelectedYear(year);
    onYearSelect && onYearSelect(year);
  };
  
  /**
   * Quick selection: Set range to last 5 years
   */
  const setLastFiveYears = () => {
    const lastIndex = allYears.length - 1;
    const startIndex = Math.max(0, lastIndex - 4); // For last 5 years
    
    setLeftHandlePos(startIndex);
    setRightHandlePos(lastIndex);
  };
  
  /**
   * Quick selection: Set range to all available years
   */
  const setAllYears = () => {
    setLeftHandlePos(0);
    setRightHandlePos(allYears.length - 1);
  };
  
  /**
   * Check if a year is within the currently selected range
   */
  const isInRange = (yearIndex) => {
    return yearIndex >= leftHandlePos && yearIndex <= rightHandlePos;
  };
  
  /**
   * Handle mouse down event on either handle
   * Initiates dragging operation
   */
  const handleMouseDown = (handle) => (e) => {
    setIsDragging(handle);
    e.preventDefault(); // Prevent text selection while dragging
  };
  
  /**
   * Handle dragging of range handles
   * Uses mouse position to determine new handle position
   */
  useEffect(() => {
    // Handle mouse movement during dragging
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      // Get slider element dimensions
      const sliderRect = document.getElementById('year-slider-track').getBoundingClientRect();
      const sliderWidth = sliderRect.width;
      const yearCount = allYears.length;
      const yearWidth = sliderWidth / (yearCount - 1);
      
      // Calculate the closest year index based on mouse position
      let newPos = Math.round((e.clientX - sliderRect.left) / yearWidth);
      
      // Constrain to valid range
      newPos = Math.max(0, Math.min(newPos, yearCount - 1));
      
      // Update the appropriate handle position
      if (isDragging === 'left') {
        // Left handle can't go past right handle
        newPos = Math.min(newPos, rightHandlePos);
        setLeftHandlePos(newPos);
      } else if (isDragging === 'right') {
        // Right handle can't go past left handle
        newPos = Math.max(newPos, leftHandlePos);
        setRightHandlePos(newPos);
      }
    };
    
    // Handle mouse up to end dragging
    const handleMouseUp = () => {
      setIsDragging(null);
    };
    
    // Attach event listeners when dragging
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    // Clean up event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, leftHandlePos, rightHandlePos, allYears.length]);
  
  return (
    <div style={{
      marginBottom: "15px",
      padding: "15px",
      backgroundColor: "#f8f9fc", // Light theme background
      border: "1px solid #eee",
      borderRadius: "8px",
      color: "#333"
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "10px",
        alignItems: "center"
      }}>
        <span style={{ fontWeight: "bold", fontSize: "14px", color: "#444" }}>
          Year Range Selection
        </span>
        <span style={{ color: kacstColors.blue, fontWeight: "bold" }}>
          {allYears[leftHandlePos]} - {allYears[rightHandlePos]}
        </span>
      </div>
      
      {/* Year slider track */}
      <div
        id="year-slider-track"
        style={{
          position: "relative",
          height: "60px", // Increased height for better visibility
          marginBottom: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          cursor: "pointer"
        }}
      >
        {/* Background track - light gray */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "12px",
          right: "12px",
          height: "4px",
          backgroundColor: "#e0e0e0", // Light gray track
          transform: "translateY(-50%)",
          borderRadius: "2px",
          zIndex: 1
        }} />
        
        {/* Selected range highlight */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: `calc(${leftHandlePos / (allYears.length - 1) * 100}%)`,
          right: `calc(${100 - (rightHandlePos / (allYears.length - 1) * 100)}%)`,
          height: "4px",
          backgroundColor: kacstColors.blue,
          transform: "translateY(-50%)",
          borderRadius: "2px",
          zIndex: 2
        }} />
        
        {/* Connection line between selected year and left handle */}
        {selectedYear && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: `calc(${leftHandlePos / (allYears.length - 1) * 100}%)`,
            width: `calc(${(allYears.indexOf(selectedYear) - leftHandlePos) / (allYears.length - 1) * 100}%)`,
            height: "2px",
            backgroundColor: kacstColors.orange,
            transform: "translateY(-50%)",
            display: allYears.indexOf(selectedYear) > leftHandlePos ? "block" : "none",
            zIndex: 3,
            opacity: 0.7
          }} />
        )}
        
        {/* Connection line between selected year and right handle */}
        {selectedYear && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: `calc(${allYears.indexOf(selectedYear) / (allYears.length - 1) * 100}%)`,
            width: `calc(${(rightHandlePos - allYears.indexOf(selectedYear)) / (allYears.length - 1) * 100}%)`,
            height: "2px",
            backgroundColor: kacstColors.orange,
            transform: "translateY(-50%)",
            display: allYears.indexOf(selectedYear) < rightHandlePos ? "block" : "none",
            zIndex: 3,
            opacity: 0.7
          }} />
        )}
        
        {/* Year markers */}
        {allYears.map((year, index) => {
          const isSelected = year === selectedYear;
          const inSelectedRange = isInRange(index);
          const isLeftEdge = index === leftHandlePos;
          const isRightEdge = index === rightHandlePos;
          const isHovered = year === hoveredYear;
          const isEndpoint = isLeftEdge || isRightEdge;
          
          return (
            <div
              key={`year-marker-${year}`}
              style={{
                position: "absolute",
                left: `calc(${index / (allYears.length - 1) * 100}%)`,
                transform: "translateX(-50%)",
                zIndex: isSelected ? 6 : isEndpoint ? 5 : 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={() => handleYearClick(index)}
              onMouseEnter={() => setHoveredYear(year)}
              onMouseLeave={() => setHoveredYear(null)}
            >
              {/* Year marker shape - dot for selected year, line for range edges */}
              {isSelected ? (
                // Dot for selected year
                <div style={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: "#fff",
                  border: `2px solid ${kacstColors.orange}`,
                  marginBottom: "10px",
                  boxShadow: "0 0 8px rgba(255, 140, 0, 0.5)",
                  transition: "all 0.2s ease"
                }} />
              ) : isEndpoint ? (
                // Vertical line for range endpoints
                <div style={{
                  width: 2,
                  height: 20,
                  backgroundColor: kacstColors.blue,
                  marginBottom: "10px",
                  boxShadow: isHovered ? "0 0 5px rgba(64, 86, 244, 0.5)" : "none",
                  transition: "all 0.2s ease"
                }} />
              ) : (
                // Simple dot for other years
                <div style={{
                  width: inSelectedRange ? 8 : 6,
                  height: inSelectedRange ? 8 : 6,
                  borderRadius: "50%",
                  backgroundColor: inSelectedRange ? "#aab" : "#ccc",
                  marginBottom: "10px",
                  transition: "all 0.2s ease",
                  opacity: inSelectedRange ? 1 : 0.6
                }} />
              )}
              
              {/* Year label */}
              <div style={{
                fontSize: isSelected ? "14px" : isEndpoint ? "13px" : "12px",
                fontWeight: isSelected || isEndpoint ? "bold" : "normal",
                color: isSelected 
                  ? kacstColors.orange
                  : isEndpoint
                    ? kacstColors.blue
                    : inSelectedRange
                      ? "#555"
                      : "#999",
                transition: "all 0.2s ease"
              }}>
                {year}
              </div>
            </div>
          );
        })}
        
        {/* Left draggable handle */}
        <div
          style={{
            position: "absolute",
            left: `calc(${leftHandlePos / (allYears.length - 1) * 100}%)`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            border: `2px solid ${kacstColors.blue}`,
            boxShadow: "0 0 10px rgba(64, 86, 244, 0.4)",
            cursor: isDragging === 'left' ? "grabbing" : "grab",
            zIndex: 10
          }}
          onMouseDown={handleMouseDown('left')}
        />
        
        {/* Right draggable handle */}
        <div
          style={{
            position: "absolute",
            left: `calc(${rightHandlePos / (allYears.length - 1) * 100}%)`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#fff",
            border: `2px solid ${kacstColors.blue}`,
            boxShadow: "0 0 10px rgba(64, 86, 244, 0.4)",
            cursor: isDragging === 'right' ? "grabbing" : "grab",
            zIndex: 10
          }}
          onMouseDown={handleMouseDown('right')}
        />
      </div>
      
      {/* Quick selection buttons */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "10px"
      }}>
        <button
          onClick={setLastFiveYears}
          style={{
            flex: 1,
            padding: "8px 10px",
            backgroundColor: leftHandlePos === Math.max(0, allYears.length - 5) ? kacstColors.blue : "#fff",
            color: leftHandlePos === Math.max(0, allYears.length - 5) ? "#fff" : kacstColors.blue,
            border: `1px solid ${kacstColors.blue}`,
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            transition: "all 0.2s ease"
          }}
        >
          Last 5 Years
        </button>
        <button
          onClick={setAllYears}
          style={{
            flex: 1,
            padding: "8px 10px",
            backgroundColor: leftHandlePos === 0 ? kacstColors.blue : "#fff",
            color: leftHandlePos === 0 ? "#fff" : kacstColors.blue,
            border: `1px solid ${kacstColors.blue}`,
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            transition: "all 0.2s ease"
          }}
        >
          All Years
        </button>
      </div>
      
      {/* Selected year info */}
      <div style={{
        marginTop: "15px",
        padding: "10px",
        backgroundColor: "#fff", // White background
        border: "1px solid #eee",
        borderRadius: "6px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ fontSize: "14px", color: "#444" }}>
          Selected Year:
        </div>
        <div style={{ 
          color: kacstColors.orange, 
          fontWeight: "bold",
          fontSize: "18px" 
        }}>
          {selectedYear}
        </div>
      </div>
      
      {/* Legend */}
      <div style={{
        marginTop: "10px",
        display: "flex",
        fontSize: "11px",
        color: "#777",
        justifyContent: "center",
        gap: "15px"
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ 
            width: "16px", 
            height: "16px", 
            borderRadius: "50%", 
            border: `2px solid ${kacstColors.orange}`,
            backgroundColor: "#fff",
            marginRight: "5px" 
          }}></div>
          Selected Year
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ 
            width: "2px", 
            height: "16px", 
            backgroundColor: kacstColors.blue,
            marginRight: "5px" 
          }}></div>
          Range Endpoints
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={{ 
            width: "30px", 
            height: "4px", 
            backgroundColor: kacstColors.blue,
            marginRight: "5px",
            borderRadius: "2px"
          }}></div>
          Selected Range
        </div>
      </div>
    </div>
  );
};

export default IntegratedYearRangeSelector;