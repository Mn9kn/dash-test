import React, { useEffect, useState } from "react";
import "../health-dashboard.css";
import { kacstColors } from "../../../constants/theme";

const LifeExpectancy = () => {
  const [lifeData, setLifeData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLifeExpectancy = async () => {
      const url =
        "https://api.worldbank.org/v2/country/SAU/indicator/SP.DYN.LE00.IN?format=json&per_page=50";

      try {
        const res = await fetch(url);
        const json = await res.json();

        const records = json[1] || [];

        // Filter to only valid entries with value
        const validRecords = records.filter((r) => r.value !== null);

        if (validRecords.length < 2) {
          setError("Not enough valid life expectancy data available.");
          return;
        }

        const latest = validRecords[0];      // Most recent valid year
        const previous = validRecords[1];    // One year before with valid data

        const latestValue = parseFloat(latest.value);
        const previousValue = parseFloat(previous.value);

        const changePercent = (((latestValue - previousValue) / previousValue) * 100).toFixed(2);
        const changeDirection = latestValue >= previousValue ? "up" : "down";

        setLifeData({
          year: latest.date,
          value: latestValue.toFixed(2),
          change: changePercent,
          direction: changeDirection,
          source: "World Bank",
        });
      } catch (e) {
        setError("Failed to fetch life expectancy data.");
        console.error(e);
      }
    };

    fetchLifeExpectancy();
  }, []);

  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!lifeData) return <p>Loading life expectancy...</p>;

  return (
  <div 
        className="health-kpi-title"
        style={{
          fontWeight: 700,
          fontSize: "15px",
          color: "#004990",
          letterSpacing: "0.5px",
          marginBottom: "2px",
          textTransform: "capitalize",
        }}
      >
        Life Expectancy ({lifeData.year})
      <div className="health-kpi-value" style={{ color: kacstColors.blue }}>
        {lifeData.value}{" "}
        <span style={{ fontSize: "9px", color: "#666" }}>(years)</span>
      </div>
      <div
  className={`health-kpi-change ${parseFloat(lifeData.change) > 0 ? "positive" : "negative"}`}
  style={{
    display: "block",
    width: "100%",
    textAlign: "center",
    fontWeight: "normal",
    fontSize: "13px",
    marginTop: "4px"
  }}
>
  <span
    className="health-change-arrow"
    style={{
      color: parseFloat(lifeData.change) > 0 ? kacstColors.green : kacstColors.red,
      marginRight: "4px"
    }}
  >
    {parseFloat(lifeData.change) < 0 ? "↓" : "↑"}
  </span>
  {lifeData.change}%
</div>
<div style={{ fontWeight: "normal", position: 'absolute', bottom: '6px', left: '12px', fontSize: '11px', color: '#999' }}>
Source: {lifeData.source}
        </div>

    </div>
  );
};

export default LifeExpectancy;