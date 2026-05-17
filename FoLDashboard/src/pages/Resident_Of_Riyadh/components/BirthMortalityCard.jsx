// Refactored BirthMortalityCard.jsx
// Finalized layout with adjusted legend, full axis titles, and data source positioning.

import React, { useState, useEffect, useRef} from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import BirthMortalityFile from '../../../data/birth_mortality_data.json';


const BirthMortalityCard = ({ 
  birthMortalityDataa,
  kacstColors,
  selectedYear,
  setSelectedYear,
  style
}) => {

  const birthMortalityData = BirthMortalityFile.map((item) => ({
    year: item.year,
    BirthRate: item.birthRate,
    MortalityRate: item.deathRate
  }));
  //const [filteredData, setFilteredData] = useState(birthMortalityData);
  const [selectedRange, setSelectedRange] = React.useState([0, birthMortalityData.length - 1]);
  const filteredData = birthMortalityData.slice(selectedRange[0], selectedRange[1] + 1);
  // useEffect(() => {
  //   setFilteredData(birthMortalityData);
  // }, [birthMortalityData]);
  React.useEffect(() => {
    const yearsInRange = filteredData.map(d => d.year);
    if (!yearsInRange.includes(selectedYear)) {
      setSelectedYear(filteredData[filteredData.length - 1]?.year);
    }
  }, [filteredData, selectedYear, setSelectedYear]);

  // Get selected year data and previous year for metrics (from full data, not just filtered)
  const selectedYearInt = parseInt(selectedYear);
  const selectedYearObj = birthMortalityData.find(d => parseInt(d.year) === selectedYearInt) || birthMortalityData[birthMortalityData.length - 1];
  const prevYearObj = birthMortalityData.find(d => parseInt(d.year) === (selectedYearInt - 1));
  const selectedScore = selectedYearObj ? selectedYearObj.BirthRate : 0;
  const prevScore = prevYearObj ? prevYearObj.BirthRate : null;
  const selectedScore2 = selectedYearObj ? selectedYearObj.MortalityRate : 0;
  const prevScore2 = prevYearObj ? prevYearObj.MortalityRate : null;


    // Improved YoY change calculation
    let change = 0;
    let change2 = 0;

/*     if (prevScore !== null && prevScore !== 0) {
      change = ((selectedScore - prevScore) / prevScore) * 100;
    } else if (prevScore === 0 && selectedScore > 0) {
      change = 100; // If previous was 0 and current is positive, show 100% increase
    } else if (prevScore === 0 && selectedScore === 0) {
      change = 0; // If both are 0, show 0% change
    } */

      if (typeof prevScore === 'number' && prevScore !== 0) {
        change = ((selectedScore - prevScore) / prevScore) * 100;
      } else if (prevScore === 0 && selectedScore > 0) {
        change = 100;
      } else if (prevScore === 0 && selectedScore === 0) {
        change = 0;
      } else if (prevScore === 0 && selectedScore < 0) {
        change = -100;
      } else {
        change = null; // or handle as needed
      }
      

   /*  if (prevScore2 !== null && prevScore2 !== 0) {
      change2 = ((selectedScore2 - prevScore2) / prevScore2) * 100;
    } else if (prevScore2 === 0 && selectedScore2 > 0) {
      change2 = 100; // Same logic for mortality rate
    } else if (prevScore2 == 0 && selectedScore2 === 0) {
      change2 = 0;
    } */
  
      if (typeof prevScore2 === 'number' && prevScore2 !== 0) {
        change2 = ((selectedScore2 - prevScore2) / prevScore2) * 100;
      } else if (prevScore2 === 0 && selectedScore2 > 0) {
        change2 = 100;
      } else if (prevScore2 === 0 && selectedScore2 === 0) {
        change2 = 0;
      } else if (prevScore2 === 0 && selectedScore2 < 0) {
        change2 = -100;
      } else {
        change2 = null; // or handle as needed
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
    const maxValue = birthMortalityData.length - 1;
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
    const maxValue = birthMortalityData.length - 1;
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
  const startPercent = (selectedRange[0] / (birthMortalityData.length - 1)) * 100;
  const endPercent = (selectedRange[1] / (birthMortalityData.length - 1)) * 100;

  // Chart container ref for robust click handling
  const chartRef = useRef(null);

  // Chart click handler: select year from data point
  const handleChartClick = (e) => {
    if (e && e.activeLabel) {
      setSelectedYear(e.activeLabel);
    }
  };


  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const getChangeDisplay = (key, label, color, type) => {
    const first = birthMortalityData[0]?.[key] || 0;
    const last = birthMortalityData[birthMortalityData.length - 1]?.[key] || 0;
    if (first === 0) return null;
    //const change = ((last - first) / first) * 100;
    const formatted = `${Math.abs(change.toFixed(0))}%`;
    const isIncrease = change > 0;

    const arrow = isIncrease ? '↑' : '↓';
    const arrowColor = (type === 'birth' && isIncrease) || (type === 'mortality' && !isIncrease) ? '#48A842' : '#D4351C';

    return (
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#666' }}>{label} ({selectedYearInt})</div>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color }}>{selectedScore.toLocaleString()}</div>
        {Number(selectedYearInt) === Number(birthMortalityData[0].year) ? (
            <span style={{ color: '#888', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
              N/A
            </span>
          ) : (
            <span style={{ color: changeColor, fontSize: 13, letterSpacing: 1 }}>
              {Math.abs(change).toFixed(2)}% <span style={{ fontSize: 18 }}>{changeArrow}</span>
            </span>
          )}
      </div>
    );
  };

  const getChangeDisplay2 = (key, label, color, type) => {
    const first = birthMortalityData[0]?.[key] || 0;
    const last = birthMortalityData[birthMortalityData.length - 1]?.[key] || 0;
    if (first === 0) return null;
    //const change = ((last - first) / first) * 100;
    const formatted = `${Math.abs(change.toFixed(0))}%`;
    const isIncrease = change > 0;

    const arrow = isIncrease ? '↑' : '↓';
    const arrowColor = (type === 'birth' && isIncrease) || (type === 'mortality' && !isIncrease) ? '#48A842' : '#D4351C';

    return (
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ fontSize: '12px', color: '#666' }}>{label} ({selectedYearInt})</div>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color }}>{selectedScore2.toLocaleString()}</div>
        {Number(selectedYearInt) === Number(birthMortalityData[0].year) ? (
            <span style={{ color: '#888', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
              N/A
            </span>
          ) : (
            <span style={{ color: changeColor2, fontSize: 13, letterSpacing: 1 }}>
              {Math.abs(change2).toFixed(2)}% <span style={{ fontSize: 18 }}>{changeArrow2}</span>
            </span>
          )}
      </div>
    );
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
                <h3 id="health_card_birthMortality_title" style={{ color: "#004990", margin: 0 }}>Birth and Mortality Rate</h3>
                
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
                  title="Number of live births and deaths per 1,000 people per year."
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
                Data Source : Macrotrends.net
              </div>
            </div>
          </div>
{/* 
      <div id="health_card_birthMortality_value" style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8f9fc', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
       {getChangeDisplay('BirthRate', 'Birth Rate', kacstColors.blue, 'birth')}
        <div style={{ width: '1px', backgroundColor: '#e0e0e0' }}></div>
        {getChangeDisplay2('MortalityRate', 'Mortality Rate', kacstColors.orange, 'mortality')}
      </div> */}

<div id="health_card_birthMortality_value" style={{
        backgroundColor: "#f8f9fc",
        borderRadius: "8px",
        padding: "12px 15px",
        marginBottom: "15px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: '#7a8599', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>
          Birth Rate ({selectedYear})
          </div>
          <div style={{ color: kacstColors.blue, fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
            {selectedScore.toLocaleString()}
          </div>
          {Number(selectedYear) === Number(birthMortalityData[0].year) ? (
            <span style={{ color: '#888', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
              N/A
            </span>
          ) : (
            <span style={{ color: changeColor, fontSize: 13, letterSpacing: 1 }}>
              {Math.abs(change).toFixed(2)}% <span style={{ fontSize: 18 }}>{changeArrow}</span>
            </span>
          )}
        </div>
        <div style={{ width: 1, background: '#e0e0e0', height: 32, margin: '0 18px' }} />
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: '#7a8599', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>
          Mortality Rate ({selectedYear})
          </div>
          <div style={{ color: '#FF9800', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
            {selectedScore2.toLocaleString()}
          </div>

          {Number(selectedYear) === Number(birthMortalityData[0].year) ? (
            <span style={{ color: '#888', fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
              N/A
            </span>
          ) : (
            <span style={{ color: changeColor2, fontSize: 13, letterSpacing: 1 }}>
            {Math.abs(change2).toFixed(2)}% <span style={{ fontSize: 18 }}>{changeArrow2}</span>
          </span>
          )}
        </div>
      </div>


      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div id="health_card_birthMortality_chart" style={{ height: "220px", flex: 1, position: 'relative' }}>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={filteredData} 
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }} 
            onClick={handleChartClick}
            onMouseMove={e => {
              if (e && e.activeLabel !== undefined) {
                document.body.style.cursor = 'pointer';
              } else {
                document.body.style.cursor = 'default';
              }
            }}
            onMouseLeave={() => { document.body.style.cursor = 'default'; }}
          >
            <CartesianGrid stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11 }} />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 11 }}
              axisLine={false} // Hide Y-axis line for a cleaner look
              label={{
                value: 'Rate (per 1000 people)',
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
              dataKey="BirthRate"
              name="Birth Rate"
              stroke={kacstColors.blue}
              strokeWidth={3}
              dot={{ r: 4, fill: kacstColors.blue, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: kacstColors.blue, stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
              // Smoother line, matches IncomePerCapitaCard
              strokeDasharray={undefined}
            />
                        <Line
              type="monotone"
              dataKey="MortalityRate"
              name="Mortality Rate"
              stroke={kacstColors.orange}
              strokeWidth={3}
              dot={{ r: 4, fill: kacstColors.orange, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: kacstColors.orange, stroke: '#fff', strokeWidth: 2 }}
              isAnimationActive={true}
              animationDuration={500}
              // Smoother line, matches IncomePerCapitaCard
              strokeDasharray={undefined}
            />


            {/* Built-in legend for pixel-perfect consistency with Crime/Traffic cards */}
            <Legend
              verticalAlign="bottom"
              iconType="rect"
              height={10}
              wrapperStyle={{ fontSize: '12px', marginTop: '5px' }}
            />
          </LineChart>
        </ResponsiveContainer>

      </div>

      <div className="health-year-range-text" style={{ marginBottom: 2, fontWeight: 500 }}>
        Year Range: {birthMortalityData[selectedRange[0]].year}–{birthMortalityData[selectedRange[1]].year}
      </div>
      <div id="health_card_birthMortality_scale" className="health-year-range-slider">
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
            {birthMortalityData[selectedRange[0]].year}
          </div>
        </div>
        {/* End handle with year label */}
        <div 
          className="health-year-range-handle"
          style={{ left: `${endPercent}%` }}
          onMouseDown={handleEndHandleDrag}
        >
          <div className="health-year-range-label">
            {birthMortalityData[selectedRange[1]].year}
          </div>
        </div>
        {/* Removed year labels along the slider line for consistency with Crime/Traffic cards */}
      </div>



      </div>



    </div>
  );
};

export default BirthMortalityCard;
