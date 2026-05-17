// Refactored BirthMortalityCard.jsx
// Finalized layout with adjusted legend, full axis titles, and data source positioning.

import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';


const HealthFacilitiesCard = ({ 
  healthFacilitiesData,
  kacstColors,
  selectedYear,
  setSelectedYear,
  style
}) => {
    //const [filteredData, setFilteredData] = useState(healthFacilitiesData);
    const [selectedRange, setSelectedRange] = React.useState([0, healthFacilitiesData.length - 1]);
    const filteredData = healthFacilitiesData.slice(selectedRange[0], selectedRange[1] + 1);
    // useEffect(() => {
    //   setFilteredData(healthFacilitiesData);
    // }, [healthFacilitiesData]);
    React.useEffect(() => {
      const yearsInRange = filteredData.map(d => d.year);
      if (!yearsInRange.includes(selectedYear)) {
        setSelectedYear(filteredData[filteredData.length - 1]?.year);
      }
    }, [filteredData, selectedYear, setSelectedYear]);
  
    // Get selected year data and previous year for metrics (from full data, not just filtered)
    const selectedYearInt = parseInt(selectedYear);
    const selectedYearObj = healthFacilitiesData.find(d => parseInt(d.year) === selectedYearInt) || healthFacilitiesData[healthFacilitiesData.length - 1];
    const prevYearObj = healthFacilitiesData.find(d => parseInt(d.year) === (selectedYearInt - 1));
    const selectedScore = selectedYearObj ? selectedYearObj.BirthRate : 0;
    const prevScore = prevYearObj ? prevYearObj.BirthRate : null;
    const selectedScore2 = selectedYearObj ? selectedYearObj.MortalityRate : 0;
    const prevScore2 = prevYearObj ? prevYearObj.MortalityRate : null;
  
  
      // Improved YoY change calculation
      let change = 0;
      let change2 = 0;
  
      if (prevScore !== null && prevScore !== 0) {
        change = ((selectedScore - prevScore) / prevScore) * 100;
      } else if (prevScore === 0 && selectedScore > 0) {
        change = 100; // If previous was 0 and current is positive, show 100% increase
      } else if (prevScore === 0 && selectedScore === 0) {
        change = 0; // If both are 0, show 0% change
      }
  
      if (prevScore2 !== null && prevScore2 !== 0) {
        change2 = ((selectedScore2 - prevScore2) / prevScore2) * 100;
      } else if (prevScore2 === 0 && selectedScore2 > 0) {
        change2 = 100; // Same logic for mortality rate
      } else if (prevScore2 == 0 && selectedScore2 === 0) {
        change2 = 0;
      }
    
      // YoY change logic: increase (up, green), decrease (down, red), zero (gray)
      let changeColor = '#888';
      let changeArrow = '';
      let changeSign = '';
      if (change > 0) {
        changeColor = '#48A842';
        changeArrow = '↑';
        changeSign = '+';
      } else if (change < 0) {
        changeColor = '#E14B4B';
        changeArrow = '↓';
        changeSign = '-';
      } else {
        changeColor = '#888';
        changeArrow = '';
        changeSign = '';
      }
  
      let changeColor2 = '#888';
      let changeArrow2 = '';
      let changeSign2 = '';
      if (change2 > 0) {
        changeColor2 = '#E14B4B';
        changeArrow2 = '↑';
        changeSign2 = '+';
      } else if (change2 < 0) {
        changeColor2 = '#48A842';
        changeArrow2 = '↓';
        changeSign2 = '-';
      } else {
        changeColor2 = '#888';
        changeArrow2 = '';
        changeSign2 = '';
      }
  
  
  // Year range slider handlers
    const handleStartHandleDrag = (e) => {
      const track = e.currentTarget.closest('.health-year-range-slider');
      if (!track) return;
      const trackRect = track.getBoundingClientRect();
      const maxValue = healthFacilitiesData.length - 1;
      const handleDrag = (moveEvent) => {
        const position = (moveEvent.clientX - trackRect.left) / trackRect.width;
        const index = Math.min(Math.max(Math.round(position * maxValue), 0), selectedRange[1] - 1);
        setSelectedRange([index, selectedRange[1]]);
      };
      const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
    };
    const handleEndHandleDrag = (e) => {
      const track = e.currentTarget.closest('.health-year-range-slider');
      if (!track) return;
      const trackRect = track.getBoundingClientRect();
      const maxValue = healthFacilitiesData.length - 1;
      const handleDrag = (moveEvent) => {
        const position = (moveEvent.clientX - trackRect.left) / trackRect.width;
        const index = Math.min(Math.max(Math.round(position * maxValue), selectedRange[0] + 1), maxValue);
        setSelectedRange([selectedRange[0], index]);
      };
      const handleDragEnd = () => {
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', handleDragEnd);
      };
      document.addEventListener('mousemove', handleDrag);
      document.addEventListener('mouseup', handleDragEnd);
    };
    const startPercent = (selectedRange[0] / (healthFacilitiesData.length - 1)) * 100;
    const endPercent = (selectedRange[1] / (healthFacilitiesData.length - 1)) * 100;
  
    // Chart container ref for robust click handling
  const chartRef = useRef(null);
  
    // Chart click handler: select year from data point
    const handleChartClick = (e) => {
      if (e && e.activeLabel) {
        setSelectedYear(e.activeLabel);
      }
    };

  return (
    <div 
      className="kpi-card"
      style={{
        flex: '1',
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        height: '400px',
        overflow: 'visible',
        transition: "all 0.4s ease",
        display: "flex",
        flexDirection: "column",
        ...style
      }}
    >

      <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3 id="health_card_healthFacilities_title" style={{ color: "#004990", margin: 0 }}>Health Facilities Trends</h3>
                
                {/* Info icon with tooltip - positioned next to title */}
                <div 
                  style={{ 
                    cursor: "help",
                    color: "#8a8a8a",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    marginLeft: "8px"
                  }}
                  title="Health facilities trends over the years."
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
              </div>
              {/* Updated data source label as requested */}
              <div style={{ fontSize: "12px", color: "#7a8599", marginTop: "4px" }}>
                Data Source : KACST *
              </div>
            </div>
          </div>
{/* 
      <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8f9fc', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
        {getChangeDisplay('BirthRate', 'Birth Rate', kacstColors.purple, 'birth')}
        <div style={{ width: '1px', backgroundColor: '#e0e0e0' }}></div>
        {getChangeDisplay('MortalityRate', 'Mortality Rate', kacstColors.blue, 'mortality')}
      </div> */}

<div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
<div id="health_card_healthFacilities_chart" style={{ height: "280px", flex: 3, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{ top: 40, right: 20, left: 10, bottom: 40 }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis 
                          domain={[0, 100]} 
                          tick={{ fontSize: 11 }}
                          axisLine={false} // Hide Y-axis line for a cleaner look
                          label={{
                            value: '# of Facilities',
                            angle: -90,
                            offset: 10,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fontSize: 12, fill: '#666' },
                          }}
                        />
            <Tooltip 
                          formatter={(value, name) => [value.toLocaleString(), name]}
                          labelFormatter={v => `Year: ${v}`}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            borderRadius: '5px',
                            padding: '8px',
                            fontSize: '12px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          }}
                          cursor={{ fill: '#f5f5f5' }}
                        />
            <Line
                          type="monotone"
                          dataKey="Hospitals"
                          name="Hospitals"
                          stroke={kacstColors.purple}
                          strokeWidth={3}
                          dot={{ r: 4, fill: kacstColors.purple, stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: kacstColors.purple, stroke: '#fff', strokeWidth: 2 }}
                          isAnimationActive={true}
                          animationDuration={500}
                          // Smoother line, matches IncomePerCapitaCard
                          strokeDasharray={undefined}
                        />
            
            <Line
                          type="monotone"
                          dataKey="Pharmacies"
                          name="Pharmacies"
                          stroke={kacstColors.orange}
                          strokeWidth={3}
                          dot={{ r: 4, fill: kacstColors.orange, stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: kacstColors.orange, stroke: '#fff', strokeWidth: 2 }}
                          isAnimationActive={true}
                          animationDuration={500}
                          // Smoother line, matches IncomePerCapitaCard
                          strokeDasharray={undefined}
                        />
                        <Line
                          type="monotone"
                          dataKey="Pharmacies24H"
                          name="24h Pharmacies"
                          stroke={kacstColors.green}
                          strokeWidth={3}
                          dot={{ r: 4, fill: kacstColors.green, stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: kacstColors.green, stroke: '#fff', strokeWidth: 2 }}
                          isAnimationActive={true}
                          animationDuration={500}
                          // Smoother line, matches IncomePerCapitaCard
                          strokeDasharray={undefined}
                        />
                        <Line
                          type="monotone"
                          dataKey="BloodDonationCenters"
                          name="Blood Donation Centers"
                          stroke={kacstColors.red}
                          strokeWidth={3}
                          dot={{ r: 4, fill: kacstColors.red, stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: kacstColors.red, stroke: '#fff', strokeWidth: 2 }}
                          isAnimationActive={true}
                          animationDuration={500}
                          // Smoother line, matches IncomePerCapitaCard
                          strokeDasharray={undefined}
                        />

<Legend
              verticalAlign="bottom"
              iconType="rect"
              height={10}
              wrapperStyle={{ fontSize: '12px', marginTop: '5px' }}
            />          </LineChart>
        </ResponsiveContainer>
        </div>
        <div className="health-year-range-text" style={{ marginBottom: 2, fontWeight: 500 }}>
        Year Range: {healthFacilitiesData[selectedRange[0]].year}–{healthFacilitiesData[selectedRange[1]].year}
      </div>
      <div id="health_card_healthFacilities_scale" className="health-year-range-slider">
        <div className="health-year-range-track"></div>
        <div 
          className="health-year-range-track-active"
          style={{
            left: `${startPercent}%`,
            right: `${100 - endPercent}%`
          }}
        ></div>
        {/* Start handle with year label */}
        <div 
          className="health-year-range-handle"
          style={{ left: `${startPercent}%` }}
          onMouseDown={handleStartHandleDrag}
        >
          <div className="health-year-range-label">
            {healthFacilitiesData[selectedRange[0]].year}
          </div>
        </div>
        {/* End handle with year label */}
        <div 
          className="health-year-range-handle"
          style={{ left: `${endPercent}%` }}
          onMouseDown={handleEndHandleDrag}
        >
          <div className="health-year-range-label">
            {healthFacilitiesData[selectedRange[1]].year}
          </div>
        </div>
        {/* Removed year labels along the slider line for consistency with Crime/Traffic cards */}
      </div>

      </div>
    </div>
  );
};

export default HealthFacilitiesCard;