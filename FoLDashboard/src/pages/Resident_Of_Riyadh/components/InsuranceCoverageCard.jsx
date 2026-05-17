//TrafficIncidentsCard.js
//Component for displaying traffic safety statistics and trends
//Updated with integrated year range selector and standardized indicators
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

const TrafficIncidentsCard = ({
  insuranceCoverageData,
  kacstColors,
  selectedYear,
  setSelectedYear,
  style,
}) => {

  const [selectedRange, setSelectedRange] = React.useState([0, insuranceCoverageData.length - 1]);
  const filteredData = insuranceCoverageData.slice(selectedRange[0], selectedRange[1] + 1);

    React.useEffect(() => {
      const yearsInRange = filteredData.map(d => d.year);
      if (!yearsInRange.includes(selectedYear)) {
        setSelectedYear(filteredData[filteredData.length - 1]?.year);
      }
    }, [filteredData, selectedYear, setSelectedYear]);

  const selectedYearInt = parseInt(selectedYear);
  const selectedYearObj = insuranceCoverageData.find(d => parseInt(d.year) === selectedYearInt) || insuranceCoverageData[insuranceCoverageData.length - 1];
  const prevYearObj = insuranceCoverageData.find(d => parseInt(d.year) === (selectedYearInt - 1));
  const selectedScore = selectedYearObj ? selectedYearObj.covered : 0;
  const prevScore = prevYearObj ? prevYearObj.covered : null;
  const selectedScore2 = selectedYearObj ? selectedYearObj.notCovered : 0;
  const prevScore2 = prevYearObj ? prevYearObj.notCovered : null;


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
    } else if (prevScore2 === 0 && selectedScore2 === 0) {
      change2 = 0;
    }
  
    // YoY change logic: increase (up, green), decrease (down, red), zero (gray)
    let changeColor = '#888';
    let changeArrow = '';
    // let changeSign = '';
    if (change > 0) {
      changeColor = '#48A842';
      changeArrow = '↑';
      // changeSign = '+';
    } else if (change < 0) {
      changeColor = '#E14B4B';
      changeArrow = '↓';
      // changeSign = '-';
    } else {
      changeColor = '#888';
      changeArrow = '';
      // changeSign = '';
    }

    let changeColor2 = '#888';
    let changeArrow2 = '';
    // let changeSign2 = '';
    if (change2 > 0) {
      changeColor2 = '#E14B4B';
      changeArrow2 = '↑';
      // changeSign2 = '+';
    } else if (change2 < 0) {
      changeColor2 = '#48A842';
      changeArrow2 = '↓';
      // changeSign2 = '-';
    } else {
      changeColor2 = '#888';
      changeArrow2 = '';
      // changeSign2 = '';
    }

// Year range slider handlers
  const handleStartHandleDrag = (e) => {
    const track = e.currentTarget.closest('.health-year-range-slider');
    if (!track) return;
    const trackRect = track.getBoundingClientRect();
    const maxValue = insuranceCoverageData.length - 1;
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
    const maxValue = insuranceCoverageData.length - 1;
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
  const startPercent = (selectedRange[0] / (insuranceCoverageData.length - 1)) * 100;
  const endPercent = (selectedRange[1] / (insuranceCoverageData.length - 1)) * 100;

  // Chart container ref for robust click handling
  // const chartRef = useRef(null);

  const handleBarChartClick = (state) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const year = state.activePayload[0].payload.year;
      setSelectedYear(year);
    }
  };



/*   const formatNumber = (num) =>
    num !== undefined && num !== null
      ? `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}%`
      : ''; */

  const getChangeDisplay = (key, label, color, type) => {
    const first = insuranceCoverageData[0]?.[key] || 0;
    const last = insuranceCoverageData[insuranceCoverageData.length - 1]?.[key] || 0;
    if (first === 0) return null;
    //const change = ((last - first) / first) * 100;
    const formatted = `${Math.abs(change.toFixed(0))}%`;
    const isIncrease = change > 0;

    const arrow = isIncrease ? '↑' : '↓';
    const arrowColor = (type === 'birth' && isIncrease) || (type === 'mortality' && !isIncrease) ? '#48A842' : '#D4351C';

    return (
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ color: '#7a8599', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{label} ({selectedYearInt})</div>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color }}>{selectedScore.toLocaleString()}</div>
        {Number(selectedYearInt) === Number(insuranceCoverageData[0].year) ? (
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
    const first = insuranceCoverageData[0]?.[key] || 0;
    const last = insuranceCoverageData[insuranceCoverageData.length - 1]?.[key] || 0;
    if (first === 0) return null;
    //const change = ((last - first) / first) * 100;
    const formatted = `${Math.abs(change.toFixed(0))}%`;
    const isIncrease = change > 0;

    const arrow = isIncrease ? '↑' : '↓';
    const arrowColor = (type === 'birth' && isIncrease) || (type === 'mortality' && !isIncrease) ? '#48A842' : '#D4351C';

    return (
      <div style={{ textAlign: 'center', flex: 1 }}>
        <div style={{ color: '#7a8599', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{label} ({selectedYearInt})</div>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color }}>{selectedScore2.toLocaleString()}</div>
        {Number(selectedYearInt) === Number(insuranceCoverageData[0].year) ? (
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

  const hasData = filteredData.length > 0;

  return (
    <div
      className="kpi-card"
      style={{
        flex: '1',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        height: '400px',
        overflow: 'visible',
        transition: 'all 0.4s ease',
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
    >


      <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <h3 id="health_card_insuranceCoverage_title" style={{ color: "#004990", margin: 0 }}>Health Insurance Coverage</h3>
               
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
                  title="Percentage of citizens covered by health insurance."
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

      {hasData && (
          <div id="health_card_insuranceCoverage_value" style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8f9fc', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          {getChangeDisplay('covered', 'Covered', kacstColors.purple, 'covered')}
          <div style={{ width: '1px', backgroundColor: '#e0e0e0' }}></div>
          {getChangeDisplay2('notCovered', 'Not Covered', kacstColors.blue, 'notCovered')}
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div id="health_card_insuranceCoverage_chart" style={{ flex: 1, height: '220px', position: 'relative', marginBottom: 5, background: '#fff', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={filteredData}
            margin={{ top: 15, right: 10, left: 10, bottom: 15 }}
            //barCategoryGap="20%"
            onClick={handleBarChartClick}
          >
             <CartesianGrid stroke="#f0f0f0" vertical={false} />
             <XAxis axisLine={true} dataKey="year" tick={{ fontSize: 11 }} 
/>
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `${value}%`}

              label={{
                value: 'Percentage (%)',
                angle: -90,
                offset: 10,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontSize: 12, fill: '#666' },
              }}
              axisLine={false}
            />

            <Tooltip
                                formatter={(value, name) => [`${value}%`, name]}
                                labelFormatter={(value) => `Year: ${value}`}
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
            <Bar
              dataKey="covered"
              fill={kacstColors.purple}
              name="Covered"
              radius={[4, 4, 0, 0]}
              barSize={8}
            />
            <Bar
              dataKey="notCovered"
              fill={kacstColors.blue}
              name="Not Covered"
              radius={[4, 4, 0, 0]}
              barSize={8}
            />
            <Legend
              verticalAlign="bottom"
              iconType="rect"
              height={10}
              wrapperStyle={{ fontSize: '11px', marginTop: '5px' }}
              />
          </BarChart>
        </ResponsiveContainer>
        </div>

        
        <div className="health-year-range-text" style={{ marginBottom: 2, fontWeight: 500 }}>
        Year Range: {insuranceCoverageData[selectedRange[0]].year}–{insuranceCoverageData[selectedRange[1]].year}
      </div>
      <div id="health_card_insuranceCoverage_scale" className="health-year-range-slider">
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
            {insuranceCoverageData[selectedRange[0]].year}
          </div>
        </div>
        {/* End handle with year label */}
        <div 
          className="health-year-range-handle"
          style={{ left: `${endPercent}%` }}
          onMouseDown={handleEndHandleDrag}
        >
          <div className="health-year-range-label">
            {insuranceCoverageData[selectedRange[1]].year}
          </div>
        </div>
        {/* Removed year labels along the slider line for consistency with Crime/Traffic cards */}
      </div>

      </div>
    </div>
  );
};

export default TrafficIncidentsCard;