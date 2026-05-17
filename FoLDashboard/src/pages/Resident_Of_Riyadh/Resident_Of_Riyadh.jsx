/**
 * HealthPage.jsx (Resident of Riyadh)
 * التحديث الأخير: ضبط مستوى الزوم وقت تصدير الصورة ليكون متناسقاً جداً (مريح للعين وموسط للحي بوضوح).
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapContainer, TileLayer, Marker, Tooltip, useMap, Polygon, LayerGroup, useMapEvents, ZoomControl
} from "react-leaflet";
import Select from "react-select";
import L from "leaflet";
import html2canvas from "html2canvas";
import Layout from "../../components/Layout";
import { kacstColors } from "../../constants/theme";
import { parseWKTPolygon, calculateDistrictCenter } from "../Decision_Maker/utils/mapUtils";

import geoDistricts from "../../data/georiyadh.json";
import riyadhMap from "../../data/Riyadh_Map.json";
import estData from "../../data/establishments.json";
import itemsData from "../../data/healthy food items per neighborhood.json";

import "leaflet/dist/leaflet.css";
import "./health-dashboard.css";

const CATEGORIES = ["Main", "Meal", "Side", "Dessert", "Drink"];
const CAT_ICONS  = { Main: "🍽️", Meal: "🥡", Side: "🥗", Dessert: "🍮", Drink: "🥤" };
const DEFAULT_THRESHOLD = 60;

const RDYLGN = [
  { t: 0.0,  r: 215, g: 25,  b: 28  },
  { t: 0.25, r: 253, g: 174, b: 97  },
  { t: 0.5,  r: 255, g: 255, b: 191 },
  { t: 0.75, r: 166, g: 217, b: 106 },
  { t: 1.0,  r: 26,  g: 150, b: 65  },
];

function rdYlGn(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return "transparent";
  const t = Math.max(0, Math.min(1, pct / 100));
  let lo = RDYLGN[0], hi = RDYLGN[RDYLGN.length - 1];
  for (let i = 0; i < RDYLGN.length - 1; i++) {
    if (t >= RDYLGN[i].t && t <= RDYLGN[i + 1].t) { lo = RDYLGN[i]; hi = RDYLGN[i + 1]; break; }
  }
  const f = (t - lo.t) / (hi.t - lo.t || 1);
  return `rgb(${Math.round(lo.r+f*(hi.r-lo.r))},${Math.round(lo.g+f*(hi.g-lo.g))},${Math.round(lo.b+f*(hi.b-lo.b))})`;
}

function cleanNeighborhoodName(name) {
  if (!name) return name;
  return name.replace(/\s*dist\.?\s*$/i, '').replace(/\s*neighborhood\s*$/i, '').trim() + " Neighborhood";
}

// ── المتحكم بالكاميرا ──
function MapController({ bounds, isDownloading }) {
  const map = useMap();
  useEffect(() => {
    let timeout;
    if (isDownloading) {
      timeout = setTimeout(() => {
        map.invalidateSize();
        if (bounds) {
          // تم ضبط الزوم هنا: maxZoom 14 و padding 180 ليكون الحي في المنتصف بشكل متناسق وواضح
          map.fitBounds(bounds, { padding: [180, 180], maxZoom: 14, animate: false });
        } else {
          map.setView([24.7136, 46.6753], 11, { animate: false });
        }
      }, 300);
    } else {
      timeout = setTimeout(() => {
        map.invalidateSize();
        if (bounds) {
          map.flyToBounds(bounds, { paddingTopLeft: [50, 50], paddingBottomRight: [450, 50], maxZoom: 13, duration: 1.5 });
        } else {
          map.flyTo([24.7136, 46.6753], 11, { duration: 1.5 });
        }
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [bounds, isDownloading, map]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: () => onMapClick() });
  return null;
}

function Legend({ title, isDownloading }) {
  const scale = isDownloading ? 1.6 : 1;
  return (
    <div style={{ position:"absolute", bottom:28, left:14, zIndex:800, background:"rgba(255,255,255,0.95)", borderRadius:8*scale, padding:`${8*scale}px ${12*scale}px`, boxShadow:"0 4px 12px rgba(0,0,0,0.15)", fontSize:isDownloading ? "16px" : "11px", pointerEvents:"none" }}>
      <div style={{fontWeight:800,color:"#374151",marginBottom:6*scale}}>{title}</div>
      <div style={{display:"flex",gap:6*scale,alignItems:"center"}}>
        {[0,25,50,75,100].map(s=>(
          <div key={s} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3*scale}}>
            <div style={{width:24*scale,height:12*scale,borderRadius:3*scale,background:rdYlGn(s),border:"1px solid rgba(0,0,0,0.1)"}}/>
            <span style={{color:"#4b5563", fontWeight: 700}}>{s}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThresholdSlider({ value, onChange, onReset }) {
  const unifiedColor = kacstColors.blue;
  const isModified = value !== DEFAULT_THRESHOLD;
  return (
    <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", zIndex: 900, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "240px" }}>
      {isModified && (
        <div style={{ background: "rgba(255,255,255,0.98)", border: `1.5px solid ${unifiedColor}`, borderRadius: "8px", padding: "4px 10px", fontSize: "11px", fontWeight: 700, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", boxShadow: `0 4px 12px ${unifiedColor}44`, width: "100%", boxSizing: "border-box" }}>
          <span style={{width:6,height:6,borderRadius:"50%",background:unifiedColor,flexShrink:0}}/>
          <span>Map Filter: <strong style={{color:unifiedColor, fontSize: "12px"}}>≥ {value}%</strong></span>
        </div>
      )}
      <div style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)", borderRadius: "10px", padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", border: `1px solid ${unifiedColor}40`, display: "flex", flexDirection: "column", gap: "8px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "12px", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Healthy Threshold</div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isModified && ( <button onClick={onReset} style={{ background: "#f1f5f9", border: "none", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", color: "#475569", cursor: "pointer", padding: "3px 6px" }}>Reset</button> )}
            <span style={{ fontSize: "16px", fontWeight: 900, color: unifiedColor }}>{value}%</span>
          </div>
        </div>
        <div style={{ width: "100%" }}>
          <input type="range" min={0} max={100} step={5} value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: unifiedColor, cursor: "pointer", height: "5px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: "700", color: "#9ca3af", marginTop: "2px" }}> <span>0%</span><span>50%</span><span>100%</span> </div>
        </div>
      </div>
    </div>
  );
}

export default function HealthPage() {
  const [userData, setUserData] = useState({
    weight: "", height: "", age: "", gender: 'male', activity: 'sedentary'
  });

  const [neighborhoodsData,       setNeighborhoodsData]       = useState([]);
  const [neighborhoodOptions,     setNeighborhoodOptions]     = useState([]);
  const [selectedNeighborhood,    setSelectedNeighborhood]    = useState(null);
  const [mapBounds,               setMapBounds]               = useState(null);
  const [showSearchMenu,          setShowSearchMenu]          = useState(false);
  const [isFetching,              setIsFetching]              = useState(false);
  const [currentNeighborhoodJson, setCurrentNeighborhoodJson] = useState(null);
  const [mapThreshold,            setMapThreshold]            = useState(DEFAULT_THRESHOLD);

  const printRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const dl = isDownloading;

  const handleDownloadImage = () => {
    if (!printRef.current) return;
    setIsDownloading(true);
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(printRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          scrollY: -window.scrollY
        });
        const data = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = data;
        link.download = `Health_Profile_${selectedNeighborhood?.label || 'Neighborhood'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) { console.error("Error capturing image:", error); }
      finally { setIsDownloading(false); }
    }, 1200);
  };

  useEffect(() => {
    try {
      const combinedData = geoDistricts.map(geo => {
        const geoNameEn = geo.neighborhood_name_en || geo.name_en || "";
        const geoNameAr = geo.neighborhood_name_ar || geo.name || "";
        const mapping = riyadhMap.find( m => (m["Unfined_District"] || "").trim().toLowerCase() === geoNameEn.trim().toLowerCase() || (m["Hungerstation_ District"] || "").trim().toLowerCase() === geoNameEn.trim().toLowerCase() );
        const searchName = mapping ? (mapping["Hungerstation_ District"] || geoNameEn) : geoNameEn;
        const est   = estData.find(e => { const d = e.District||e["0"]||e.name||e.Name||""; return d.trim().toLowerCase()===searchName.trim().toLowerCase(); });
        const items = itemsData.find(i => { const d = i.District||i.neighborhood||i.Name||i["0"]||""; return d.trim().toLowerCase()===searchName.trim().toLowerCase(); });
        return {
          id: geo.id || Math.random(),
          name: geoNameAr, // الاسم العربي
          name_en: geoNameEn,
          searchName, geometry: geo.geometry,
          healthyPct: est ? parseFloat(est.Percentage || est.Pct || est["3"]) : null,
          healthyItemsPct: items ? parseFloat(items.Precentage_of_Healthy_Items || items.Percentage || items["3"]) : null,
        };
      }).filter(d => d.geometry && d.name_en);
      setNeighborhoodsData(combinedData);
      setNeighborhoodOptions(combinedData.map(d => ({ value: d.id?.toString(), label: cleanNeighborhoodName(d.name_en), ...d })).sort((a,b) => a.label.localeCompare(b.label)));
    } catch (e) { console.error(e); }
  }, []);

  const personalCalculations = useMemo(() => {
    const { weight, height, age, gender, activity } = userData;
    if (!weight || !height || !age) return { bmi: "0.0", bmiStatus: "-", bmiColor: "#94a3b8", tdee: 0, allowances: {} };
    const w = parseFloat(weight), h = parseFloat(height), a = parseFloat(age);
    if (isNaN(w)||isNaN(h)||isNaN(a)||w<=0||h<=0||a<=0) return { bmi: "0.0", bmiStatus: "-", bmiColor: "#94a3b8", tdee: 0, allowances: {} };

    const bmi = w / ((h/100) * (h/100));
    let bmiStatus = "Normal", bmiColor = "#22c55e";
    if (bmi < 18.5) { bmiStatus = "Underweight"; bmiColor = "#3b82f6"; }
    else if (bmi >= 25 && bmi < 30) { bmiStatus = "Overweight"; bmiColor = "#f59e0b"; }
    else if (bmi >= 30) { bmiStatus = "Obese"; bmiColor = "#ef4444"; }

    let bmr = (10*w)+(6.25*h)-(5*a)+(gender==='male'?5:-161);
    const multipliers = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryActive:1.9 };
    const tdee = Math.round(bmr * (multipliers[activity] || 1.2));

    return {
      bmi: bmi.toFixed(1), bmiStatus, bmiColor, tdee,
      allowances: { Main: Math.round(tdee*0.30), Meal: Math.round(tdee*0.35), Side: Math.round(tdee*0.15), Dessert: Math.round(tdee*0.10), Drink: Math.round(tdee*0.10) }
    };
  }, [userData]);

  const neighborhoodStats = useMemo(() => {
    if (!currentNeighborhoodJson || !currentNeighborhoodJson.Restaurants) return null;
    const currentTdee = personalCalculations.tdee || 2000;
    const currentAllowances = personalCalculations.tdee ? personalCalculations.allowances : { Main:600, Meal:700, Side:300, Dessert:300, Drink:100 };
    const catStats = {}; CATEGORIES.forEach(c => { catStats[c] = { healthy:0, unhealthy:0, hPSum:0, uPSum:0, hPCount:0, uPCount:0 }; });
    let totalH=0, totalU=0, hSum=0, uSum=0, hC=0, uC=0, healthyRest=0, unhealthyRest=0;
    const threshold = mapThreshold / 100;

    currentNeighborhoodJson.Restaurants.forEach(res => {
      let resH = 0; const resT = res.MenuItems ? res.MenuItems.length : 0;
      if (res.MenuItems) {
        res.MenuItems.forEach(item => {
          const cat = CATEGORIES.includes(item.Category) ? item.Category : "Main";
          const price = typeof item.Price === "number" ? item.Price : parseFloat(item.Price) || 0;
          if (item.Calories <= (currentAllowances[cat] || 200)) { resH++; totalH++; catStats[cat].healthy++; if(price>0){catStats[cat].hPSum+=price;catStats[cat].hPCount++;hSum+=price;hC++;} }
          else { totalU++; catStats[cat].unhealthy++; if(price>0){catStats[cat].uPSum+=price;catStats[cat].uPCount++;uSum+=price;uC++;} }
        });
      }
      if (resT>0){ if((resH/resT) >= threshold) healthyRest++; else unhealthyRest++; }
    });

    return {
      totalHealthyItems: totalH, totalUnhealthyItems: totalU, healthyRest, unhealthyRest,
      totalRestaurantsParsed: currentNeighborhoodJson.Restaurants.length,
      avgHealthyPrice: hC>0?(hSum/hC).toFixed(1):null, avgUnhealthyPrice: uC>0?(uSum/uC).toFixed(1):null,
      categoryRows: CATEGORIES.map(c=>({ cat:c, icon:CAT_ICONS[c], healthy:catStats[c].healthy, unhealthy:catStats[c].unhealthy, avgHealthyPrice: catStats[c].hPCount>0 ? (catStats[c].hPSum/catStats[c].hPCount).toFixed(1) : "—", avgUnhealthyPrice: catStats[c].uPCount>0 ? (catStats[c].uPSum/catStats[c].uPCount).toFixed(1) : "—" }))
    };
  }, [currentNeighborhoodJson, personalCalculations, mapThreshold]);

  const handleNeighborhoodSelect = async (option) => {
    if (!option) return; setSelectedNeighborhood(option); setIsFetching(true);
    if (option.geometry) {
      const coords = parseWKTPolygon(option.geometry);
      if (coords?.length) { setMapBounds([[Math.min(...coords.map(c=>c[0])), Math.min(...coords.map(c=>c[1]))], [Math.max(...coords.map(c=>c[0])), Math.max(...coords.map(c=>c[1]))]]); }
    }
    try {
      const fileName = option.searchName.replace(/ Dist\.$| Dist$| District$/gi, '').trim().replace(/['`]/g, '').replace(/\s+/g, '_');
      const res = await fetch(`/data/${fileName}_Data.json`);
      setCurrentNeighborhoodJson(res.ok ? await res.json() : { error: true });
    } catch { setCurrentNeighborhoodJson({ error: true }); } finally { setIsFetching(false); }
  };

  const personalNeighborhoodPct = useMemo(() => {
    if (!neighborhoodStats || !selectedNeighborhood || personalCalculations.tdee <= 0) return null;
    const totalR = neighborhoodStats.healthyRest + neighborhoodStats.unhealthyRest;
    return totalR > 0 ? (neighborhoodStats.healthyRest / totalR) * 100 : null;
  }, [neighborhoodStats, selectedNeighborhood, personalCalculations.tdee]);

  const clearSelection = () => {
    setSelectedNeighborhood(null); setCurrentNeighborhoodJson(null); setMapBounds(null);
  };

  return (
    <Layout currentTab="Resident of Riyadh">
      {/* ── إخفاء عداد حقول الإدخال عبر CSS ── */}
      <style>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
      `}</style>

      <div ref={printRef} style={{ display: "flex", flexDirection: dl ? "column" : "row", gap: dl ? "48px" : "24px", width: dl ? "1600px" : "100%", maxWidth: dl ? "1600px" : "1550px", margin: "0 auto", padding: dl ? "48px" : "20px", backgroundColor: dl ? "#f8fafc" : "transparent" }}>

        <div style={{ width: dl ? "100%" : "auto", flex: dl ? "none" : "1.4", minWidth: "55%", height: dl ? "850px" : "720px", borderRadius: dl ? "24px" : "16px", overflow: "hidden", border: "1px solid #e2e8f0", position: "relative", backgroundColor: "#fff", boxShadow: dl ? "none" : "0 10px 25px rgba(0,0,0,0.08)" }}>
          <MapContainer preferCanvas center={[24.7136,46.6753]} zoom={11} style={{height:"100%",width:"100%"}} zoomControl={false}>
            <ZoomControl position="bottomright"/>
            <MapController bounds={mapBounds} isDownloading={dl} />
            <MapClickHandler onMapClick={clearSelection}/>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"/>

            <LayerGroup>
              {neighborhoodsData.map((neighborhood, index) => {
                const coords = parseWKTPolygon(neighborhood.geometry); if (!coords) return null;
                const isSel = selectedNeighborhood && (neighborhood.id?.toString() === selectedNeighborhood.value || neighborhood.name_en === selectedNeighborhood.name_en);
                const pct = isSel && personalNeighborhoodPct !== null ? personalNeighborhoodPct : neighborhood.healthyPct;
                const fillColor = rdYlGn(mapThreshold > 0 ? (pct / mapThreshold) * 50 : pct);

                return (
                  <Polygon key={index} positions={coords} pathOptions={{ color:isSel?kacstColors.blue:"#555", weight:isSel?(dl?6:3):0.8, fillColor: (pct === null ? "transparent" : fillColor), fillOpacity:isSel?0.85:0.55 }} eventHandlers={{click:()=> { if (!dl) handleNeighborhoodSelect({value:neighborhood.id?.toString(),label:cleanNeighborhoodName(neighborhood.name_en),...neighborhood}); }}}>
                    {!dl && (
                      <Tooltip sticky>
                        <strong>{cleanNeighborhoodName(neighborhood.name_en)}</strong><br/>
                        <span style={{color: "#64748b", fontSize: "0.95em", fontWeight: "600"}}>{neighborhood.name}</span><br/>
                        <span style={{fontWeight:"bold", color:"#0369a1", marginTop:"4px", display:"inline-block"}}>
                          {pct?.toFixed(1)}% healthy
                        </span>
                      </Tooltip>
                    )}
                  </Polygon>
                );
              })}
            </LayerGroup>
          </MapContainer>

          {!dl && (
            <div style={{position: "absolute", top: 16, left: 16, zIndex: 1100}}>
              {!showSearchMenu ? (
                <button onClick={()=>setShowSearchMenu(true)} style={{width:48,height:48,borderRadius:8,backgroundColor:"#fff",border:`2px solid ${kacstColors.blue}`,cursor:"pointer",display:"flex",justifyContent:"center",alignItems:"center", boxShadow:"0 2px 6px rgba(0,0,0,0.2)"}}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={kacstColors.blue} strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
              ) : (
                <div style={{backgroundColor:"#fff",borderRadius:12,padding:16,width:300,border:`1px solid ${kacstColors.blue}`,boxShadow:"0 10px 25px rgba(0,0,0,0.15)"}}><Select options={neighborhoodOptions} value={selectedNeighborhood} onChange={handleNeighborhoodSelect} placeholder="Search neighborhood..."/><div style={{display:"flex",gap:10,marginTop:12}}><button onClick={()=>setShowSearchMenu(false)} style={{flex:1,padding:8,cursor:"pointer",borderRadius:6,border:"1px solid #ddd"}}>Cancel</button><button onClick={clearSelection} style={{flex:1,backgroundColor:kacstColors.blue,color:"#fff",padding:8,cursor:"pointer",borderRadius:6,border:"none"}}>Clear</button></div></div>
              )}
            </div>
          )}
          <Legend title="% Healthy Establishments" isDownloading={dl}/>
          {!dl && <ThresholdSlider value={mapThreshold} onChange={setMapThreshold} onReset={() => setMapThreshold(DEFAULT_THRESHOLD)} />}
        </div>

        <div style={{ flex: dl ? "none" : "1", overflowY: dl ? "visible" : "auto", display: "flex", flexDirection: "column" }}>
          {!selectedNeighborhood ? (
            <div style={{ height:"100%", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", background:"#f8fafc", borderRadius:16, border:"2px dashed #cbd5e1", padding:40 }}>
              <span style={{fontSize:"3rem",marginBottom:"15px"}}>📍</span>
              <h3 style={{color:"#475569", fontSize: "1.5rem"}}>Select Neighborhood</h3>
              <p style={{fontSize: "1rem", color:"#94a3b8"}}>Choose your neighborhood on the map to start the analysis.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: dl ? "36px" : "16px" }}>

              <div style={{background:"#fff",padding:dl?"40px":"20px",borderRadius:dl?24:16,border:dl?"2px solid #e2e8f0":"1px solid #e2e8f0", boxShadow:dl?"none":"0 4px 15px rgba(0,0,0,0.05)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:dl?40:16}}>
                  <div style={{display: "flex", flexDirection: "column", gap: dl?"12px":"4px"}}>
                    <h3 style={{color:"#004990",margin:0,fontSize:dl?"3.5rem":"1.3rem", fontWeight:900, lineHeight: 1.1}}>{selectedNeighborhood.label}</h3>
                    {selectedNeighborhood.name && (
                      <div style={{fontSize: dl?"2.2rem":"1rem", color: "#64748b", fontWeight: "700", opacity: 0.9}}>
                        {selectedNeighborhood.name}
                      </div>
                    )}
                  </div>
                  {!dl && <button onClick={clearSelection} style={{color:"#ef4444",border:"none",background:"none",cursor:"pointer",fontWeight:"bold",fontSize:"1.1rem",marginTop:"4px"}}>Close ×</button>}
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:dl?32:12}}>
                  {['weight', 'height', 'age'].map(field => (
                    <div key={field}>
                      <label style={{fontSize:dl?"1.8rem":"0.75rem",fontWeight:800,color:"#475569",display:"block",marginBottom:dl?12:4}}>
                        {field.charAt(0).toUpperCase()+field.slice(1)}
                      </label>
                      {dl ? (
                        <div style={{width:"100%",padding:"24px",borderRadius:12,border:"2px solid #cbd5e1",fontSize:"2.5rem",fontWeight:800, color:"#1e293b", background:"#f8fafc", boxSizing:"border-box", minHeight:"80px", display:"flex", alignItems:"center"}}>
                          {userData[field] || "—"}
                        </div>
                      ) : (
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter..."
                          value={userData[field]}
                          onChange={e=>setUserData({...userData,[field]:e.target.value.replace(/[^0-9.]/g, '')})}
                          style={{width:"100%",padding:"9px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:"1rem",fontWeight:700, color:"#1e293b", boxSizing:"border-box"}}
                        />
                      )}
                    </div>
                  ))}
                  <div>
                    <label style={{fontSize:dl?"1.8rem":"0.75rem",fontWeight:800,color:"#475569",display:"block",marginBottom:dl?12:4}}>Gender</label>
                    {dl ? (
                      <div style={{width:"100%",padding:"24px",borderRadius:12,border:"2px solid #cbd5e1",fontSize:"2.5rem",fontWeight:800, color:"#1e293b", background:"#f8fafc", boxSizing:"border-box", minHeight:"80px", display:"flex", alignItems:"center"}}>
                        {userData.gender === 'male' ? 'Male' : 'Female'}
                      </div>
                    ) : (
                      <select value={userData.gender} onChange={e=>setUserData({...userData,gender:e.target.value})} style={{width:"100%",padding:"9px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:"1rem",fontWeight:700, color:"#1e293b", boxSizing:"border-box", background:"#fff"}}><option value="male">Male</option><option value="female">Female</option></select>
                    )}
                  </div>
                  <div style={{gridColumn:"span 2"}}>
                    <label style={{fontSize:dl?"1.8rem":"0.75rem",fontWeight:800,color:"#475569",display:"block",marginBottom:dl?12:4}}>Activity Level</label>
                    {dl ? (
                      <div style={{width:"100%",padding:"24px",borderRadius:12,border:"2px solid #cbd5e1",fontSize:"2.5rem",fontWeight:800, color:"#1e293b", background:"#f8fafc", boxSizing:"border-box", minHeight:"80px", display:"flex", alignItems:"center"}}>
                        {userData.activity === 'sedentary' ? 'Sedentary (Inactive)' : userData.activity === 'light' ? 'Lightly Active (1-3 days/week)' : userData.activity === 'moderate' ? 'Moderately Active (3-5 days/week)' : userData.activity === 'active' ? 'Very Active (6-7 days/week)' : 'Extremely Active (Daily exercise or physical job)'}
                      </div>
                    ) : (
                      <select value={userData.activity} onChange={e=>setUserData({...userData,activity:e.target.value})} style={{width:"100%",padding:"9px",borderRadius:8,border:"1px solid #cbd5e1",fontSize:"1rem",fontWeight:700, color:"#1e293b", boxSizing:"border-box", background:"#fff"}}>
                        <option value="sedentary">Sedentary (Inactive)</option>
                        <option value="light">Lightly Active (1-3 days/week)</option>
                        <option value="moderate">Moderately Active (3-5 days/week)</option>
                        <option value="active">Very Active (6-7 days/week)</option>
                        <option value="veryActive">Extremely Active (Daily exercise or physical job)</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>

              {isFetching ? (
                <div style={{padding:"20px",textAlign:"center",color:"#64748b",fontSize:dl?"2.5rem":"1rem",fontWeight:700}}>Fetching Data... ⏳</div>
              ) : currentNeighborhoodJson?.error ? (
                <div style={{padding:dl?"32px":"16px",background:"#fee2e2",color:"#b91c1c",borderRadius:12,border:"2px solid #fca5a5",fontSize:dl?"2rem":"0.875rem",fontWeight:700}}>
                  Data for <strong>{selectedNeighborhood.label} / {selectedNeighborhood.name}</strong> is not available yet.
                </div>
              ) : neighborhoodStats && (
                <>
                  <div style={{background:"#004990",color:"#fff",padding:dl?"40px 48px":"16px 20px",borderRadius:dl?24:16,boxShadow:dl?"none":"0 8px 20px rgba(0,73,144,0.2)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:dl?"1.8rem":"0.85rem",opacity:0.9,fontWeight:700,marginBottom:dl?8:0}}>Daily TDEE</div>
                        <div style={{fontSize:dl?"5.5rem":"1.8rem",fontWeight:900,color:"#fbbf24",lineHeight:1}}>{personalCalculations.tdee||0} <span style={{fontSize:dl?"2.5rem":"0.9rem",color:"#fff"}}>kcal</span></div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontSize:dl?"1.8rem":"0.85rem",opacity:0.9,fontWeight:700,marginBottom:dl?8:0}}>BMI Status</div>
                        <div style={{backgroundColor:personalCalculations.bmiColor,padding:dl?"16px 32px":"6px 14px",borderRadius:40,fontWeight:900,fontSize:dl?"2.2rem":"0.85rem",color:"#fff",display:"inline-block",marginTop:dl?8:0}}>{personalCalculations.bmi} · {personalCalculations.bmiStatus}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{background:"#fff",padding:dl?"40px 36px":"16px 20px",borderRadius:dl?24:16,border:"2px solid #e2e8f0"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:dl?32:12,paddingBottom:dl?20:10,borderBottom:"2px solid #f1f5f9"}}>
                      <h4 style={{fontSize:dl?"2.5rem":"1.1rem",fontWeight:900,color:"#1e293b",margin:0}}>Personalized Landscape</h4>
                      <span style={{fontSize:dl?"1.8rem":"0.85rem",fontWeight:700,color:"#64748b"}}>{neighborhoodStats.totalRestaurantsParsed} Restaurants</span>
                    </div>

                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:dl?32:12}}>
                      {[
                        {l:"Healthy Est.",v:neighborhoodStats.healthyRest,c:"#166534",bg:"#dcfce7",bc:"#bbf7d0"},
                        {l:"Unhealthy Est.",v:neighborhoodStats.unhealthyRest,c:"#991b1b",bg:"#fee2e2",bc:"#fecaca"},
                        {l:"Healthy Items",v:neighborhoodStats.totalHealthyItems,c:"#16a34a",bg:"#f0fdf4",bc:"#bbf7d0"},
                        {l:"Unhealthy Items",v:neighborhoodStats.totalUnhealthyItems,c:"#dc2626",bg:"#fef2f2",bc:"#fecaca"}
                      ].map((stat,i)=>(
                        <div key={i} style={{background:stat.bg,padding:dl?"36px 20px":"12px 10px",borderRadius:dl?16:10,textAlign:"center",border:`2px solid ${stat.bc}`}}>
                          <div style={{fontSize:dl?"4.5rem":"1.5rem",fontWeight:900,color:stat.c,lineHeight:1}}>{stat.v}</div>
                          <div style={{fontSize:dl?"1.8rem":"0.85rem",fontWeight:800,color:stat.c,marginTop:dl?12:4}}>{stat.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{background:"#fff",padding:dl?"40px 36px":"16px 20px",borderRadius:dl?24:16,border:"2px solid #e2e8f0"}}>
                    <h4 style={{fontSize:dl?"2.5rem":"1.1rem",fontWeight:900,color:"#1e293b",marginBottom:dl?32:12,borderBottom:"2px solid #f1f5f9",paddingBottom:dl?20:10}}>Items by Category</h4>
                    <table style={{width:"100%",fontSize:dl?"1.8rem":"0.85rem",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{background:"#f8fafc"}}>
                          <th style={{padding:dl?24:8,textAlign:"left",color:"#475569",fontWeight:900}}>Category</th>
                          <th style={{textAlign:"center",color:"#16a34a",fontWeight:900}}>✅ H</th>
                          <th style={{textAlign:"center",color:"#dc2626",fontWeight:900}}>❌ U</th>
                          <th style={{textAlign:"center",color:"#16a34a",fontWeight:900}}>💰 H.Avg</th>
                          <th style={{paddingRight:dl?16:0,textAlign:"center",color:"#dc2626",fontWeight:900}}>💸 U.Avg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {neighborhoodStats.categoryRows.map((row,i)=>(
                          <tr key={i} style={{borderTop:"2px solid #f1f5f9",background:i%2?"#f8fafc":"#fff"}}>
                            <td style={{padding:dl?28:10,fontWeight:800,color:"#1e293b"}}>
                              <span style={{marginRight:dl?16:6}}>{row.icon}</span>{row.cat}
                              <div style={{fontSize:dl?"1.3rem":"0.65rem",color:"#94a3b8",fontWeight:700,marginTop:dl?6:2}}>≤ {personalCalculations.allowances[row.cat] || 0} kcal</div>
                            </td>
                            <td style={{textAlign:"center",color:"#16a34a",fontWeight:900}}>{row.healthy}</td>
                            <td style={{textAlign:"center",color:"#dc2626",fontWeight:900}}>{row.unhealthy}</td>
                            <td style={{textAlign:"center",color:"#15803d",fontWeight:800}}>{row.avgHealthyPrice} SR</td>
                            <td style={{paddingRight:dl?16:0,textAlign:"center",color:"#b91c1c",fontWeight:800}}>{row.avgUnhealthyPrice} SR</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {!dl && (
                    <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
                      <button
                        onClick={handleDownloadImage}
                        disabled={isDownloading}
                        title="Download Profile as Image"
                        style={{
                          width: "70px", height: "70px",
                          borderRadius: "50%",
                          backgroundColor: kacstColors.blue,
                          color: "#fff",
                          border: "none",
                          cursor: "pointer",
                          display: "flex", justifyContent: "center", alignItems: "center",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                          transition: "transform 0.2s"
                        }}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    </div>
                  )}

                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}