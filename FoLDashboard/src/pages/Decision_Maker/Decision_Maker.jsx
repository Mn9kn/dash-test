/**
 * TestPage.jsx (Decision Maker)
 * Food Health Dashboard — Charts Above Map + Smart Zoom Comparison
 * Updates: Neighborhood terminology, Map Labels removed, Dynamic Borders (Blue/Green), Enhanced Export Zoom & Fonts.
 * NEW: Massive scaling for export readability, with Arabic neighborhood name placed strictly under the English name.
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMap,
  Polygon,
  LayerGroup,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend, LabelList, Label
} from 'recharts';
import L from "leaflet";
import Select from "react-select";
import html2canvas from "html2canvas";
import Layout from "../../components/Layout";
import { kacstColors } from "../../constants/theme";
import { parseWKTPolygon, calculateDistrictCenter } from "./utils/mapUtils";

// Data Imports
import geoDistricts from "../../data/georiyadh.json";
import riyadhMap from "../../data/Riyadh_Map.json";
import estData from "../../data/establishments.json";
import itemsData from "../../data/healthy food items per neighborhood.json";
import overallPriceData from "../../data/Average_Price_HealthyAndUnhealthy_items.json";
import categoryDataJson from "../../data/data_median_price_per_category.json";
import district2Data from "../../data/Districts2.json";

import "leaflet/dist/leaflet.css";
import "../Resident_Of_Riyadh/health-dashboard.css";

// ── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = ["Main", "Meal", "Side", "Dessert", "Drink"];
const CAT_ICONS  = { Main: "🍽️", Meal: "🥡", Side: "🥗", Dessert: "🍮", Drink: "🥤" };
const DEFAULT_ALLOWANCES = { Main: 600, Meal: 700, Side: 300, Dessert: 300, Drink: 100 };
const DEFAULT_THRESHOLD = 60;

// ── Median helper ─────────────────────────────────────────────────────────────
function median(arr) {
  if (!arr || arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

// ── RdYlGn color scale ────────────────────────────────────────────────────────
const RDYLGN = [
  { t: 0.0,  r: 215, g: 25,  b: 28  },
  { t: 0.25, r: 253, g: 174, b: 97  },
  { t: 0.5,  r: 255, g: 255, b: 191 },
  { t: 0.75, r: 166, g: 217, b: 106 },
  { t: 1.0,  r: 26,  g: 150, b: 65  },
];

function rdYlGn(pct) {
  if (pct === null || pct === undefined || isNaN(pct)) return null;
  const t = Math.max(0, Math.min(1, pct / 100));
  let lo = RDYLGN[0], hi = RDYLGN[RDYLGN.length - 1];
  for (let i = 0; i < RDYLGN.length - 1; i++) {
    if (t >= RDYLGN[i].t && t <= RDYLGN[i + 1].t) { lo = RDYLGN[i]; hi = RDYLGN[i + 1]; break; }
  }
  const f = (t - lo.t) / (hi.t - lo.t || 1);
  return `rgb(${Math.round(lo.r+f*(hi.r-lo.r))},${Math.round(lo.g+f*(hi.g-lo.g))},${Math.round(lo.b+f*(hi.b-lo.b))})`;
}

// ── Helper: clean neighborhood name (remove "dist." / "district" suffix) ──────
function cleanNeighborhoodName(name) {
  if (!name) return name;
  return name.replace(/\s*dist\.?\s*$/i, '').replace(/\s*neighborhood\s*$/i, '').trim() + " Neighborhood";
}

// ── Map Viewport Controller (Smart Zoom & Resizer) ────────────────────────────
function MapController({ bounds, isDownloading, isComparison }) {
  const map = useMap();

  useEffect(() => {
    let timeout;
    if (isDownloading) {
      timeout = setTimeout(() => {
        map.invalidateSize();
        if (bounds) {
          map.fitBounds(bounds, { padding: [120, 120], maxZoom: 14, animate: false });
        } else {
          map.setView([24.7136, 46.6753], 11, { animate: false });
        }
      }, 500);
    } else {
      timeout = setTimeout(() => {
        map.invalidateSize();
        if (bounds) {
          map.flyToBounds(bounds, { paddingTopLeft: [50, 50], paddingBottomRight: [isComparison ? 680 : 360, 50], maxZoom: 13, duration: 1.5 });
        } else {
          map.flyTo([24.7136, 46.6753], 11, { duration: 1.5 });
        }
      }, 100);
    }
    return () => clearTimeout(timeout);
  }, [bounds, isDownloading, map, isComparison]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: () => onMapClick() });
  return null;
}

// ── Default Summary Card ──────────────────────────────────────────────────────
function DefaultSummaryCard({ kacstColors }) {
  return (
    <div style={{
      position: "absolute", top: 20, right: 20, zIndex: 1000,
      background: "rgba(255,255,255,0.95)", borderRadius: "8px", padding: "12px 16px", width: "220px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "flex-start", gap: "10px"
    }}>
      <div style={{ background: `${kacstColors.blue}15`, padding: "6px", borderRadius: "6px", flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={kacstColors.blue} strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </div>
      <div>
        <h4 style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "700", color: "#111827" }}>Explore Map</h4>
        <p style={{ margin: 0, fontSize: "11px", color: "#6b7280", lineHeight: "1.4" }}>Select up to two neighborhoods to compare health & price indicators.</p>
      </div>
    </div>
  );
}

// ── Single Neighborhood Details ───────────────────────────────────────────────────
function SingleNeighborhoodDetails({ district, districtStats, isFetching, mapThreshold, isDownloading, borderColor, isComparison }) {
  const pct     = districtStats ? districtStats.healthyPct : district.healthyPct;
  const foodPct = districtStats ? districtStats.healthyItemsPct : district.healthyItemsPct;

  const isH     = pct !== null && pct >= 50;
  const sc      = pct === null ? "#6c757d" : isH ? "#28a745" : "#dc3545";

  const totalEst = districtStats ? districtStats.totalRest : district.totalCount;
  const healthyEst = districtStats ? districtStats.healthyRest : district.healthyCount;
  const unhealthyEst = (totalEst !== null && healthyEst !== null) ? (totalEst - healthyEst) : district.unhealthyCount;

  const totalItems = districtStats ? districtStats.totalItems : district.allItems;
  const healthyItems = districtStats ? districtStats.healthyItems : district.healthyItems;
  const unhealthyItems = (totalItems !== null && healthyItems !== null) ? (totalItems - healthyItems) : district.unhealthyItems;

  // ── Font Scaling for Download (Massive scaling applied here) ──
  const dl = isDownloading;
  const comp = isComparison;

  const fontTitle      = dl ? (comp ? "38px" : "50px")  : "16px";
  const fontSubtitle   = dl ? (comp ? "28px" : "34px")  : "11px";
  const fontLabel      = dl ? (comp ? "24px" : "28px")  : "11px";
  const fontValue      = dl ? (comp ? "26px" : "32px")  : "12px";
  const fontNum        = dl ? (comp ? "48px" : "64px")  : "14px";
  const fontNumLabel   = dl ? (comp ? "22px" : "26px")  : "11px";
  const fontBadge      = dl ? (comp ? "22px" : "28px")  : "11px";
  const fontTh         = dl ? (comp ? "26px" : "30px")  : "0.75rem";
  const fontTable      = dl ? (comp ? "24px" : "28px")  : "0.73rem";
  const fontPriceBig   = dl ? (comp ? "52px" : "68px")  : "1.1rem";
  const fontPriceLabel = dl ? (comp ? "24px" : "28px")  : "11px";
  const barHeight      = dl ? (comp ? 24 : 32) : 8;
  const gridCols       = dl ? "1fr 1fr 1fr" : "1fr 1fr";
  const cardPadding    = dl ? (comp ? "28px 24px" : "40px 32px") : "8px 5px";
  const badgePad       = dl ? (comp ? "12px 28px" : "16px 36px") : "3px 10px";
  const badgeRadius    = dl ? 20 : 12;

  const displayName = cleanNeighborhoodName(district.name_en);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: dl ? "32px" : "10px" }}>
      <div>
        {borderColor && (
          <div style={{
            height: dl ? "12px" : "4px",
            borderRadius: "6px",
            background: borderColor,
            marginBottom: dl ? "24px" : "8px"
          }} />
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: dl ? "24px" : "12px" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: fontTitle, color: "#111827", lineHeight: 1.2, wordBreak: "break-word" }}>
              {displayName}
            </div>
            {district.name && (
              <div style={{ fontSize: fontSubtitle, color: "#64748b", marginTop: dl ? "8px" : "4px", fontWeight: "700" }}>
                {district.name}
              </div>
            )}
          </div>

          {district.population ? (
            <div style={{
              fontSize: dl ? "38px" : "16px",
              color: "#0f172a",
              fontWeight: 900,
              background: "#f8fafc",
              padding: dl ? "8px 16px" : "4px 10px",
              borderRadius: dl ? "16px" : "8px",
              display: "inline-flex",
              alignItems: "center",
              border: `${dl ? 3 : 1}px solid #cbd5e1`,
              boxShadow: dl ? "0 4px 6px rgba(0,0,0,0.05)" : "none",
              flexShrink: 0,
              whiteSpace: "nowrap"
            }}>
              👥 {district.population.toLocaleString()}
            </div>
          ) : null}
        </div>
      </div>

      <div style={{
        display: "inline-block", alignSelf: "flex-start",
        fontSize: fontBadge, fontWeight: 800,
        padding: badgePad, borderRadius: badgeRadius,
        background: sc + "22", color: sc, border: `${dl ? 4 : 1.5}px solid ${sc}`
      }}>
        {pct === null ? "No Data" : isH ? "Healthy Neighborhood" : "Unhealthy Neighborhood"}
      </div>

      {pct !== null ? (
        <>
          <div style={{ marginBottom: dl ? 12 : 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontLabel, color: "#6b7280", marginBottom: dl ? 16 : 4 }}>
              <span style={{ fontWeight: dl ? 800 : 400 }}>Healthy Establishments (%)</span>
              <span style={{ fontWeight: 900, color: "#374151", fontSize: fontValue }}>{pct.toFixed(1)}%</span>
            </div>
            <div style={{ height: barHeight, borderRadius: dl ? 16 : 6, background: "#e5e7eb", overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: dl ? 16 : 6, background: rdYlGn(pct) || "#ccc", transition: "width .4s" }}/>
            </div>
          </div>

          {foodPct != null && !isNaN(foodPct) && (
            <div style={{ marginBottom: dl ? 24 : 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontLabel, color: "#6b7280", marginBottom: dl ? 16 : 4 }}>
                <span style={{ fontWeight: dl ? 800 : 400 }}>Healthy Food Items (%)</span>
                <span style={{ fontWeight: 900, color: "#374151", fontSize: fontValue }}>{foodPct.toFixed(1)}%</span>
              </div>
              <div style={{ height: barHeight, borderRadius: dl ? 16 : 6, background: "#e5e7eb", overflow: "hidden" }}>
                <div style={{ width: `${foodPct}%`, height: "100%", borderRadius: dl ? 16 : 6, background: rdYlGn(foodPct) || "#ccc", transition: "width .4s" }}/>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: dl ? gridCols : "1fr 1fr", gap: dl ? 20 : 6, marginBottom: dl ? 12 : 4, marginTop: dl ? 16 : 10 }}>
            {[
              { label: "Total Est.",      val: totalEst?.toLocaleString()      ?? "—", color: "#111827" },
              { label: "Total Items",     val: totalItems?.toLocaleString()    ?? "—", color: "#111827" },
              { label: "Healthy Est.",    val: healthyEst?.toLocaleString()    ?? "—", color: "#28a745" },
              { label: "Healthy Items",   val: healthyItems?.toLocaleString()  ?? "—", color: "#28a745" },
              { label: "Unhealthy Est.",  val: unhealthyEst?.toLocaleString()  ?? "—", color: "#dc3545" },
              { label: "Unhealthy Items", val: unhealthyItems?.toLocaleString()?? "—", color: "#dc3545" }
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                background: "#f9fafb", borderRadius: dl ? 20 : 8,
                padding: cardPadding, textAlign: "center",
                border: `${dl ? 3 : 1}px solid #f3f4f6`, transition: "all 0.3s"
              }}>
                <div style={{ fontWeight: 900, fontSize: fontNum, color }}>{val}</div>
                <div style={{ fontSize: fontNumLabel, color: "#6b7280", marginTop: dl ? 8 : 0, fontWeight: dl ? 700 : 400 }}>{label}</div>
              </div>
            ))}
          </div>

          {isFetching && (
            <div style={{ padding: dl ? "24px" : "10px", textAlign: "center", color: "#64748b", fontSize: fontLabel }}>
              Loading items… ⏳
            </div>
          )}

          {!isFetching && districtStats && (
            <>
              <div style={{ fontSize: fontTh, fontWeight: 900, color: "#64748b", marginBottom: dl ? 20 : 4, marginTop: dl ? 16 : 4 }}>
                Median Item Price (SR)
              </div>
              <div style={{ display: "flex", gap: dl ? 24 : 8, marginBottom: dl ? 32 : 8 }}>
                <div style={{
                  flex: 1, background: "#f0fdf4",
                  padding: dl ? "32px 16px" : "8px",
                  borderRadius: dl ? 24 : 8,
                  textAlign: "center", border: `${dl ? 3 : 1}px solid #bbf7d0`
                }}>
                  <div style={{ fontSize: fontPriceBig, fontWeight: 900, color: "#16a34a" }}>
                    {districtStats.medianHealthyPrice ?? "—"}
                  </div>
                  <div style={{ fontSize: fontPriceLabel, color: "#15803d", fontWeight: 800, marginTop: dl ? 12 : 0 }}>
                    Healthy Median
                  </div>
                </div>
                <div style={{
                  flex: 1, background: "#fef2f2",
                  padding: dl ? "32px 16px" : "8px",
                  borderRadius: dl ? 24 : 8,
                  textAlign: "center", border: `${dl ? 3 : 1}px solid #fecaca`
                }}>
                  <div style={{ fontSize: fontPriceBig, fontWeight: 900, color: "#dc2626" }}>
                    {districtStats.medianUnhealthyPrice ?? "—"}
                  </div>
                  <div style={{ fontSize: fontPriceLabel, color: "#b91c1c", fontWeight: 800, marginTop: dl ? 12 : 0 }}>
                    Unhealthy Median
                  </div>
                </div>
              </div>

              <div style={{ fontSize: fontTh, fontWeight: 900, color: "#64748b", marginBottom: dl ? 20 : 4 }}>
                Items by Category
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: fontTable }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    <th style={{ padding: dl ? "24px 20px" : "6px 6px", textAlign: "left", color: "#475569", fontWeight: 900 }}>Cat.</th>
                    <th style={{ padding: dl ? "24px 16px" : "6px 4px", textAlign: "center", color: "#16a34a", fontWeight: 900 }}>✅ H</th>
                    <th style={{ padding: dl ? "24px 16px" : "6px 4px", textAlign: "center", color: "#dc2626", fontWeight: 900 }}>❌ U</th>
                    <th style={{ padding: dl ? "24px 16px" : "6px 4px", textAlign: "center", color: "#16a34a", fontWeight: 900 }}>💰 Med H</th>
                    <th style={{ padding: dl ? "24px 20px" : "6px 6px", textAlign: "center", color: "#dc2626", fontWeight: 900 }}>💸 Med U</th>
                  </tr>
                </thead>
                <tbody>
                  {districtStats.categoryRows.map((row, i) => (
                    <tr key={row.cat} style={{ background: i % 2 === 0 ? "#ffffff" : "#f8fafc", borderTop: `${dl ? 3 : 1}px solid #e2e8f0` }}>
                      <td style={{ padding: dl ? "24px 20px" : "6px 6px", fontWeight: 800, color: "#1e293b" }}>
                        <span style={{ marginRight: dl ? 16 : 4 }}>{row.icon}</span>{row.cat}
                      </td>
                      <td style={{ padding: dl ? "24px 16px" : "6px 4px", textAlign: "center", fontWeight: 900, color: "#16a34a" }}>{row.healthy}</td>
                      <td style={{ padding: dl ? "24px 16px" : "6px 4px", textAlign: "center", fontWeight: 900, color: "#dc2626" }}>{row.unhealthy}</td>
                      <td style={{ padding: dl ? "24px 16px" : "6px 4px", textAlign: "center", color: "#15803d", fontWeight: 800 }}>{row.medianHealthyPrice}</td>
                      <td style={{ padding: dl ? "24px 20px" : "6px 6px", textAlign: "center", color: "#b91c1c", fontWeight: 800 }}>{row.medianUnhealthyPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      ) : (
        <p style={{ fontSize: fontLabel, color: "#9ca3af" }}>No health data for this neighborhood.</p>
      )}
    </div>
  );
}

// ── Multi-Neighborhood Summary Card With Download Feature ─────────────────────────
function MultiDistrictSummaryCard({ selectedDistricts, onClose, multiDistrictStats, isFetching, mapThreshold, isDownloading, onDownload }) {
  const isComparison = selectedDistricts.length > 1;

  const neighborhoodColors = [kacstColors.blue, "#10b981"];

  const cardTitle = isComparison
    ? `Neighborhood Comparison`
    : `Neighborhood Overview`;

  const CardContent = () => (
    <div style={{
      background: "#ffffff",
      padding: isDownloading ? (isComparison ? "48px" : "64px") : "20px",
      borderRadius: isDownloading ? "32px" : "12px",
      border: isDownloading ? "4px solid #e5e7eb" : "none",
      boxShadow: isDownloading ? "0 12px 40px rgba(0,0,0,0.12)" : "none"
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: isDownloading ? "48px" : "16px",
        borderBottom: `${isDownloading ? 6 : 2}px solid #f1f5f9`,
        paddingBottom: isDownloading ? "32px" : "10px"
      }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: isDownloading ? (isComparison ? "48px" : "60px") : "16px", color: "#111827" }}>
            {cardTitle}
          </div>
        </div>
        {!isDownloading && (
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", color: "#9ca3af", cursor: "pointer", padding: 0, lineHeight: 1 }}>×</button>
        )}
      </div>

      <div style={{ display: "flex", gap: isDownloading ? "48px" : "16px" }}>
        {selectedDistricts.map((district, idx) => (
          <div key={district.id} style={{
            flex: 1, minWidth: 0,
            borderRight: isComparison && idx === 0 ? `${isDownloading ? 6 : 2}px solid #e2e8f0` : "none",
            paddingRight: isComparison && idx === 0 ? (isDownloading ? "48px" : "16px") : "0"
          }}>
            <SingleNeighborhoodDetails
              district={district}
              districtStats={multiDistrictStats[district.id]}
              isFetching={isFetching}
              mapThreshold={mapThreshold}
              isDownloading={isDownloading}
              isComparison={isComparison}
              borderColor={neighborhoodColors[idx]}
            />
          </div>
        ))}
      </div>

      <div style={{
        fontSize: isDownloading ? (isComparison ? "22px" : "26px") : "10px",
        color: "#6b7280", background: "#f0f9ff", borderRadius: isDownloading ? 16 : 8,
        padding: isDownloading ? "24px 32px" : "7px 10px",
        lineHeight: 1.6, marginTop: isDownloading ? 60 : 20,
        textAlign: "center", border: `${isDownloading ? 3 : 1}px dashed #bae6fd`,
        fontWeight: isDownloading ? "600" : "normal"
      }}>
        <strong>Classification Note:</strong> A neighborhood is labelled "Healthy" if ≥ 50% of its establishments meet the <strong>{mapThreshold}%</strong> menu criteria.
      </div>
    </div>
  );

  if (isDownloading) {
    return (
      <div style={{ width: "100%", background: "#fff", marginTop: "20px" }}>
        <CardContent />
      </div>
    );
  }

  return (
    <div style={{
      position: "absolute", top: 20, right: 20, zIndex: 1000,
      width: isComparison ? "660px" : "340px",
      maxHeight: "85%", overflowY: "auto",
      boxShadow: "0 4px 20px rgba(0,0,0,0.15)", borderRadius: "12px", border: "1px solid #e5e7eb",
      background: "#f8fafc"
    }}>
      <CardContent />

      {!isFetching && (
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 20px", background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
          <button
            onClick={onDownload}
            title="Download Full Map and Neighborhood Profile"
            style={{
              width: "60px", height: "60px",
              borderRadius: "50%",
              backgroundColor: kacstColors.blue,
              color: "white",
              border: "none",
              cursor: "pointer",
              display: "flex", justifyContent: "center", alignItems: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              transition: "all 0.2s"
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// ── COMPACT & CENTERED LEGEND ─────────────────────────────────────────────────
function Legend({ title }) {
  return (
    <div style={{
      position: "absolute",
      bottom: 20,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 800,
      background: "rgba(255,255,255,0.95)",
      borderRadius: "16px",
      padding: "6px 16px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      border: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      pointerEvents: "none"
    }}>
      <div style={{ fontWeight: 700, fontSize: "10px", color: "#4b5563" }}>{title}:</div>
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        {[0, 25, 50, 75, 100].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: 14, height: 14, borderRadius: "4px", background: rdYlGn(s), border: "1px solid rgba(0,0,0,0.1)" }} />
            <span style={{ color: "#6b7280", fontSize: "9px", fontWeight: "600" }}>{s}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Compact Map Threshold Slider ───────────────────────────────────────────────
function ThresholdSlider({ value, onChange, onReset }) {
  const unifiedColor = kacstColors.blue;
  const isModified = value !== DEFAULT_THRESHOLD;

  return (
    <div style={{
      position: "absolute",
      bottom: 28,
      left: 20,
      zIndex: 900,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "8px",
      width: "260px",
    }}>
      {isModified && (
        <div style={{
          background: "rgba(255,255,255,0.98)",
          border: `1.5px solid ${unifiedColor}`,
          borderRadius: "8px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: 700,
          color: "#374151",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          boxShadow: `0 4px 12px ${unifiedColor}44`,
          width: "100%",
          boxSizing: "border-box",
        }}>
          <span style={{width:8,height:8,borderRadius:"50%",background:unifiedColor,flexShrink:0}}/>
          <span>Map Filter: <strong style={{color:unifiedColor, fontSize: "14px"}}>≥ {value}%</strong> (Def: {DEFAULT_THRESHOLD}%)</span>
        </div>
      )}

      <div style={{
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(8px)",
        borderRadius: "10px",
        padding: "10px 14px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        border: `1px solid ${unifiedColor}40`,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        width: "100%",
        boxSizing: "border-box",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#111827", lineHeight: 1.2 }}>Healthy Restaurant Threshold</div>
            <div style={{ fontSize: "9px", color: "#6b7280", marginTop: "2px" }}>Colors update live</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isModified && (
              <button
                onClick={onReset}
                title="Reset to default 60%"
                style={{
                  background: "#f1f5f9", border: "none", borderRadius: "4px",
                  fontSize: "10px", fontWeight: "bold", color: "#475569",
                  cursor: "pointer", padding: "3px 6px", display: "flex", alignItems: "center"
                }}
              >
                Reset
              </button>
            )}
            <span style={{ fontSize: "16px", fontWeight: 900, color: unifiedColor }}>{value}%</span>
          </div>
        </div>

        <div style={{ width: "100%" }}>
          <input
            type="range" min={0} max={100} step={5}
            value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{ width: "100%", accentColor: unifiedColor, cursor: "pointer", height: "6px" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", fontWeight: "700", color: "#9ca3af", marginTop: "2px" }}>
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Decision_Maker() {
  const [selectedDistricts,           setSelectedDistricts]           = useState([]);
  const [mapBounds,                   setMapBounds]                   = useState(null);
  const [showSearchMenu,              setShowSearchMenu]              = useState(false);
  const [showSummaryCard,             setShowSummaryCard]             = useState(false);
  const [districtOptions,             setDistrictOptions]             = useState([]);
  const [districtsData,               setDistrictsData]               = useState([]);
  const [loading,                     setLoading]                     = useState(true);

  const selectedHeatmap = "healthyEst";

  const [mapThreshold,                setMapThreshold]                = useState(DEFAULT_THRESHOLD);

  const [currentNeighborhoodJsons,    setCurrentNeighborhoodJsons]    = useState({});
  const [isFetching,                  setIsFetching]                  = useState(false);

  const [districtRatiosCache,         setDistrictRatiosCache]         = useState({});
  const [isGlobalDataLoaded,          setIsGlobalDataLoaded]          = useState(false);

  const exportRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);

  const legendTitle = "% Healthy Establishments";

  useEffect(() => {
    try {
      setLoading(true);
      const combinedData = geoDistricts.map(geo => {
        const geoNameEn = geo.neighborhood_name_en || geo.name_en || "";
        const geoNameAr = geo.neighborhood_name_ar || geo.name || "";

        const mapping = riyadhMap.find(
          m => (m["Unfined_District"] || "").trim().toLowerCase() === geoNameEn.trim().toLowerCase() ||
               (m["Hungerstation_ District"] || "").trim().toLowerCase() === geoNameEn.trim().toLowerCase()
        );
        const searchName = mapping ? (mapping["Hungerstation_ District"] || geoNameEn) : geoNameEn;

        const est = estData.find(e => {
          const distName = e.District || e["0"] || e.name || e.Name || "";
          return distName.trim().toLowerCase() === searchName.trim().toLowerCase();
        });

        const items = itemsData.find(i => {
          const distName = i.District || i.neighborhood || i.Name || i["0"] || "";
          return distName.trim().toLowerCase() === searchName.trim().toLowerCase();
        });

        const d2 = district2Data.find(d => {
          const nEn = String(d.District_name_EN || d.name_en || d.Name_EN || d.Neighborhood_Name_EN || d.District || d.Name || "").trim().toLowerCase();
          const nAr = String(d.District_name_AR || d.name_ar || d.Name_AR || d.Neighborhood_Name_AR || d.Name || "").trim();
          return (nEn && nEn === geoNameEn.trim().toLowerCase()) ||
                 (nEn && nEn === searchName.trim().toLowerCase()) ||
                 (nAr && nAr === geoNameAr.trim());
        });
        const population = d2 && d2.Population ? parseInt(String(d2.Population).replace(/,/g, '')) : null;

        const totalCount = est ? parseInt(est.Total_Count || est["2"]) || 0 : null;
        const healthyCount = est ? parseInt(est.Healthy_Count || est["1"]) || 0 : null;
        const unhealthyCount = (totalCount !== null && healthyCount !== null) ? (totalCount - healthyCount) : null;

        const healthyPct = est ? parseFloat(est.Percentage || est.Pct || est["3"]) : null;
        const unhealthyPct = healthyPct !== null ? 100 - healthyPct : null;

        const allItems = items ? parseInt(items.All_items || items.all_items || items["2"]) || 0 : null;
        const healthyItems = items ? parseInt(items.Healthy_items || items.healthy_items || items["1"]) || 0 : null;
        const unhealthyItems = (allItems !== null && healthyItems !== null) ? (allItems - healthyItems) : null;
        const healthyItemsPct = items ? parseFloat(items.Precentage_of_Healthy_Items || items.Percentage || items["3"]) : null;
        const unhealthyItemsPct = healthyItemsPct !== null ? 100 - healthyItemsPct : null;

        return {
          id: geo.id || Math.random(),
          name: geoNameAr,
          name_en: geoNameEn,
          searchName,
          geometry: geo.geometry,
          population,
          totalCount, healthyCount, unhealthyCount, healthyPct, unhealthyPct,
          allItems, healthyItems, unhealthyItems, healthyItemsPct, unhealthyItemsPct
        };
      }).filter(d => d.geometry && d.name_en);

      setDistrictsData(combinedData);

      const options = combinedData.map(d => ({
        value: d.id?.toString(), label: cleanNeighborhoodName(d.name_en), ...d
      })).sort((a, b) => a.label.localeCompare(b.label));

      setDistrictOptions(options);

    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (districtOptions.length === 0) return;
    let isMounted = true;
    const fetchAllData = async () => {
      const ratiosCache = {};
      const fetchPromises = districtOptions.map(async (opt) => {
        try {
          let cleanName = (opt.searchName || opt.name_en || opt.label).replace(/ Dist\.$| Dist$| District$/gi, '').replace(/ Neighborhood$/gi, '').trim().replace(/['`]/g, '');
          const fileName = cleanName.replace(/\s+/g, '_');
          const res = await fetch(`/data/${fileName}_Data.json`);
          if (res.ok) {
            const json = await res.json();
            const ratios = [];
            if (json.Restaurants) {
                json.Restaurants.forEach(res => {
                    let resH = 0;
                    let resTotal = res.MenuItems ? res.MenuItems.length : 0;
                    if (resTotal > 0) {
                        res.MenuItems.forEach(item => {
                            const cat = CATEGORIES.includes(item.Category) ? item.Category : "Main";
                            if ((item.Calories || 0) <= (DEFAULT_ALLOWANCES[cat] || 200)) resH++;
                        });
                        ratios.push(resH / resTotal);
                    }
                });
            }
            ratiosCache[opt.id] = ratios;
          }
        } catch(e) {}
      });
      await Promise.all(fetchPromises);
      if (isMounted) {
        setDistrictRatiosCache(ratiosCache);
        setIsGlobalDataLoaded(true);
      }
    };
    fetchAllData();
    return () => { isMounted = false; };
  }, [districtOptions]);

  const staticGlobalStats = useMemo(() => {
    if (!isGlobalDataLoaded) return null;
    const result = {};
    const thresholdDecimal = DEFAULT_THRESHOLD / 100;

    Object.keys(districtRatiosCache).forEach(distId => {
      const ratios = districtRatiosCache[distId];
      let healthyRest = 0;
      const totalRest = ratios.length;
      for(let i=0; i<totalRest; i++) {
          if (ratios[i] >= thresholdDecimal) healthyRest++;
      }
      result[distId] = {
        totalRest, healthyRest, unhealthyRest: totalRest - healthyRest,
        healthyPct: totalRest > 0 ? (healthyRest / totalRest) * 100 : 0,
      };
    });
    return result;
  }, [districtRatiosCache, isGlobalDataLoaded]);

  const dynamicGlobalStats = useMemo(() => {
    if (!isGlobalDataLoaded) return null;
    const result = {};
    const thresholdDecimal = mapThreshold / 100;

    Object.keys(districtRatiosCache).forEach(distId => {
      const ratios = districtRatiosCache[distId];
      let healthyRest = 0;
      const totalRest = ratios.length;
      for(let i=0; i<totalRest; i++) {
          if (ratios[i] >= thresholdDecimal) healthyRest++;
      }
      result[distId] = {
        totalRest, healthyRest, unhealthyRest: totalRest - healthyRest,
        healthyPct: totalRest > 0 ? (healthyRest / totalRest) * 100 : 0,
      };
    });
    return result;
  }, [districtRatiosCache, mapThreshold, isGlobalDataLoaded]);

  const multiDistrictStats = useMemo(() => {
    const result = {};
    selectedDistricts.forEach(dist => {
      const json = currentNeighborhoodJsons[dist.id];
      if (!json || !json.Restaurants) { result[dist.id] = null; return; }

      const catPrices = {};
      CATEGORIES.forEach(c => { catPrices[c] = { healthyPrices: [], unhealthyPrices: [], healthy: 0, unhealthy: 0 }; });
      const allHealthyPrices = [], allUnhealthyPrices = [];
      let totalItems = 0, healthyItems = 0;

      json.Restaurants.forEach(res => {
        if (!res.MenuItems) return;
        res.MenuItems.forEach(item => {
          totalItems++;
          const cat        = CATEGORIES.includes(item.Category) ? item.Category : "Main";
          const maxAllowed = DEFAULT_ALLOWANCES[cat] || 200;
          const price      = typeof item.Price === "number" ? item.Price : parseFloat(item.Price) || 0;
          const isHealthy  = item.Calories <= maxAllowed;

          if (isHealthy) {
            healthyItems++;
            catPrices[cat].healthy++;
            if (price > 0) { catPrices[cat].healthyPrices.push(price); allHealthyPrices.push(price); }
          } else {
            catPrices[cat].unhealthy++;
            if (price > 0) { catPrices[cat].unhealthyPrices.push(price); allUnhealthyPrices.push(price); }
          }
        });
      });

      const mHP = median(allHealthyPrices);
      const mUP = median(allUnhealthyPrices);
      const basicStats = dynamicGlobalStats ? dynamicGlobalStats[dist.id] : {};

      result[dist.id] = {
        ...basicStats,
        totalItems, healthyItems, unhealthyItems: totalItems - healthyItems,
        healthyItemsPct: totalItems > 0 ? (healthyItems / totalItems) * 100 : 0,
        medianHealthyPrice:   mHP !== null ? mHP.toFixed(1) : null,
        medianUnhealthyPrice: mUP !== null ? mUP.toFixed(1) : null,
        categoryRows: CATEGORIES.map(c => {
          const mH = median(catPrices[c].healthyPrices);
          const mU = median(catPrices[c].unhealthyPrices);
          return {
            cat: c, icon: CAT_ICONS[c],
            healthy: catPrices[c].healthy, unhealthy: catPrices[c].unhealthy,
            medianHealthyPrice:   mH !== null ? mH.toFixed(1) : "—",
            medianUnhealthyPrice: mU !== null ? mU.toFixed(1) : "—",
          };
        })
      };
    });
    return result;
  }, [currentNeighborhoodJsons, selectedDistricts, dynamicGlobalStats]);

  const processSelections = async (newSelections) => {
    setSelectedDistricts(newSelections);
    if (newSelections.length === 0) { clearSelection(); return; }

    if (newSelections.length === 1) {
      if (newSelections[0].geometry) {
        const coords = parseWKTPolygon(newSelections[0].geometry);
        if (coords?.length) {
            const lats = coords.map(c => c[0]);
            const lngs = coords.map(c => c[1]);
            setMapBounds([[Math.min(...lats), Math.min(...lngs)], [Math.max(...lats), Math.max(...lngs)]]);
        }
      }
    } else if (newSelections.length === 2) {
      let allCoords = [];
      newSelections.forEach(d => {
        const parsed = parseWKTPolygon(d.geometry);
        if (parsed) allCoords = allCoords.concat(parsed);
      });
      if (allCoords.length > 0) {
        const lats = allCoords.map(c => c[0]), lngs = allCoords.map(c => c[1]);
        setMapBounds([[Math.min(...lats), Math.min(...lngs)],[Math.max(...lats), Math.max(...lngs)]]);
      }
    }

    setShowSummaryCard(true);
    setIsFetching(true);
    const newJsons = { ...currentNeighborhoodJsons };
    for (const opt of newSelections) {
      if (!newJsons[opt.id]) {
        try {
          let cleanName = (opt.searchName || opt.name_en || opt.label).replace(/ Dist\.$| Dist$| District$/gi, '').replace(/ Neighborhood$/gi, '').trim().replace(/['`]/g, '');
          const fileName = cleanName.replace(/\s+/g, '_');
          const response = await fetch(`/data/${fileName}_Data.json`);
          newJsons[opt.id] = response.ok ? await response.json() : { error: true };
        } catch { newJsons[opt.id] = { error: true }; }
      }
    }
    setCurrentNeighborhoodJsons(newJsons);
    setIsFetching(false);
  };

  const handleDropdownSelect  = (opts) => { let l = opts ? [...opts] : []; if (l.length > 2) l = l.slice(0, 2); processSelections(l); };
  const handleMapPolygonClick = (distOption) => {
    let newSel = [...selectedDistricts];
    const existIdx = newSel.findIndex(d => d.id?.toString() === distOption.id?.toString());
    if (existIdx >= 0) newSel.splice(existIdx, 1);
    else if (newSel.length < 2) newSel.push(distOption);
    else newSel[1] = distOption;
    processSelections(newSel);
  };
  const handleMapClick = () => { if (selectedDistricts.length > 0) clearSelection(); };
  const clearSelection = () => { setSelectedDistricts([]); setMapBounds(null); setShowSummaryCard(false); };

  const handleDownloadImage = () => {
    setIsDownloading(true);
    setTimeout(async () => {
      if (!exportRef.current) return;
      try {
        const canvas = await html2canvas(exportRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: "#ffffff",
          scrollY: -window.scrollY
        });
        const data = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = data;
        link.download = `Neighborhood_Health_Profile_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Error capturing image:", error);
      } finally {
        setIsDownloading(false);
      }
    }, 2500);
  };

  const avgScore = useMemo(() => {
    if (staticGlobalStats && isGlobalDataLoaded) {
      const values = Object.values(staticGlobalStats).map(d => d.healthyPct);
      return values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
    }
    const withData = districtsData.filter(d => d.healthyPct !== null);
    return withData.length ? withData.reduce((s,d)=>s+d.healthyPct,0)/withData.length : 0;
  }, [districtsData, staticGlobalStats, isGlobalDataLoaded]);

  const avgItemsScore = districtsData.length ? districtsData.reduce((s, d) => s + (d.healthyItemsPct || 0), 0) / districtsData.length : 0;

  const chartData = useMemo(() => {
    const mappedDistricts = districtsData.map(d => {
      if (staticGlobalStats && staticGlobalStats[d.id]) {
        return {
          ...d,
          healthyPct: staticGlobalStats[d.id].healthyPct,
          healthyCount: staticGlobalStats[d.id].healthyRest,
          unhealthyCount: staticGlobalStats[d.id].unhealthyRest
        };
      }
      return d;
    });

    const validEst   = mappedDistricts.filter(d => d.healthyPct !== null);
    const validItems = mappedDistricts.filter(d => d.healthyItemsPct !== null);

    const sortedEstDesc   = [...validEst].sort((a,b) => b.healthyPct - a.healthyPct);
    const sortedItemsDesc = [...validItems].sort((a,b) => b.healthyItemsPct - a.healthyItemsPct);

    const estComb    = [...sortedEstDesc.slice(0, 5), ...sortedEstDesc.slice(-5)];
    const itemsComb  = [...sortedItemsDesc.slice(0, 5), ...sortedItemsDesc.slice(-5)];

    const priceComp = [{
      name: 'Healthy/Unhealthy',
      Healthy:   overallPriceData.find(d => d.is_Healthy === 'Healthy')?.Average_Price   || 0,
      Unhealthy: overallPriceData.find(d => d.is_Healthy === 'Unhealthy')?.Average_Price || 0
    }];

    const categoryMap = {};
    categoryDataJson.forEach(d => {
      if (!categoryMap[d.Category]) categoryMap[d.Category] = { name: d.Category };
      categoryMap[d.Category][d.Type] = d.Price;
    });
    const categoryHealth = Object.values(categoryMap);

    return { estComb, itemsComb, priceComp, categoryHealth };
  }, [districtsData, staticGlobalStats]);

  return (
    <Layout currentTab="Decision Maker">
      <div className="health-dashboard-wrapper">

        {/* Header */}
        <div className="health-dashboard-header">
          <div className="health-dashboard-title">
            <h1>Food Health & Landscape</h1>
            <div className="health-dashboard-subtitle">
              Comprehensive analysis of healthy food availability across Riyadh
            </div>
          </div>
        </div>

        {/* KPIs Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          {[
            { id: "obesity", label: "Obesity Rate (2022)", val: "41%", sub1: "🌍 #22 Globally | 👨 #13 Males", source: "Source: World Health Organization", color: "#dc2626" },
            { id: "overweight", label: "Overweight Rate (2022)", val: "68%", sub1: "👨 Males: 68% | 👩 Females: 69%", source: "Source: World Health Organization", color: "#f97316" },
            { id: "unhealthy_items", label: "Unhealthy Food Items", val: (100 - avgItemsScore).toFixed(1) + "%", sub1: "🍔 City Average", source: "", color: "#ef4444" },
            { id: "healthy_items", label: "Healthy Food Items", val: avgItemsScore.toFixed(1) + "%", sub1: "🥗 City Average", source: "", color: "#10b981" },
            { id: "healthy_est", label: "Healthy Establishments", val: avgScore.toFixed(1) + "%", sub1: "🏪 City Average", source: "", color: "#3b82f6" }
          ].map(({id, label, val, sub1, source, color}) => (
            <div key={id} style={{ backgroundColor: "#fff", borderTop: `4px solid ${color}`, borderRadius: "8px", padding: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div><div style={{ fontWeight: 700, fontSize: "12px", color: "#4b5563", marginBottom: "8px", textTransform: "uppercase" }}>{label}</div><div style={{ fontSize: "28px", fontWeight: 800, color: color, marginBottom: "12px" }}>{val}</div></div>
              <div>
                <div style={{ fontSize: "11px", color: "#374151", fontWeight: 600, marginBottom: "4px" }}>{sub1}</div>
                {source && <div style={{ fontSize: "10px", color: "#9ca3af" }}>{source}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* ── CHARTS DASHBOARD ── */}
        <div style={{ marginBottom: "24px", backgroundColor: "#fff", borderRadius: "12px", padding: "24px", border: "1px solid #eaeaea" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>

            <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "16px", textAlign: "center" }}>Establishments: Top & Bottom 5</h3>
              <ResponsiveContainer height={350}>
                <BarChart data={chartData.estComb} margin={{ top: 20, right: 20, left: 40, bottom: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name_en" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 10, dy: 10}}>
                     <Label value="Neighborhood Name" offset={-80} position="insideBottom" style={{ fill: "#334155", fontWeight: 700, fontSize: 13 }} />
                  </XAxis>
                  <YAxis>
                     <Label value="Establishment Count" angle={-90} position="insideLeft" offset={-35} style={{ fill: "#334155", fontWeight: 700, fontSize: 13 }} />
                  </YAxis>
                  <RechartsTooltip />
                  <RechartsLegend verticalAlign="top" height={36}/>
                  <Bar dataKey="healthyCount" stackId="a" fill="#10b981" name="Healthy"><LabelList dataKey="healthyCount" position="inside" style={{fill:'#fff', fontSize:'10px'}} /></Bar>
                  <Bar dataKey="unhealthyCount" stackId="a" fill="#ef4444" name="Unhealthy"><LabelList dataKey="unhealthyCount" position="inside" style={{fill:'#fff', fontSize:'10px'}} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "16px", textAlign: "center" }}>Menu Items: Top & Bottom 5</h3>
              <ResponsiveContainer height={350}>
                <BarChart data={chartData.itemsComb} margin={{ top: 20, right: 20, left: 40, bottom: 90 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name_en" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 10, dy: 10}}>
                     <Label value="Neighborhood Name" offset={-80} position="insideBottom" style={{ fill: "#334155", fontWeight: 700, fontSize: 13 }} />
                  </XAxis>
                  <YAxis unit="%">
                     <Label value="Item Percentage (%)" angle={-90} position="insideLeft" offset={-35} style={{ fill: "#334155", fontWeight: 700, fontSize: 13 }} />
                  </YAxis>
                  <RechartsTooltip />
                  <RechartsLegend verticalAlign="top" height={36}/>
                  <Bar dataKey="healthyItemsPct" stackId="a" fill="#10b981" name="Healthy Items %" />
                  <Bar dataKey="unhealthyItemsPct" stackId="a" fill="#ef4444" name="Unhealthy Items %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "16px", textAlign: "center" }}>Overall Average Price (Healthy vs Unhealthy)</h3>
              <ResponsiveContainer height={300}>
                <BarChart data={chartData.priceComp} margin={{ top: 20, right: 20, left: 40, bottom: 40 }}>
                  <XAxis dataKey="name" tick={{dy: 10}}>
                     <Label value="Price Comparison" offset={-30} position="insideBottom" style={{ fill: "#334155", fontWeight: 700, fontSize: 13 }} />
                  </XAxis>
                  <YAxis unit=" SR">
                     <Label value="Average Price (SR)" angle={-90} position="insideLeft" offset={-35} style={{ fill: "#334155", fontWeight: 700, fontSize: 13 }} />
                  </YAxis>
                  <RechartsTooltip />
                  <Bar dataKey="Healthy" fill="#10b981" barSize={60} radius={[6,6,0,0]}><LabelList dataKey="Healthy" position="top" style={{fontSize: 11, fontWeight: 700}} /></Bar>
                  <Bar dataKey="Unhealthy" fill="#ef4444" barSize={60} radius={[6,6,0,0]}><LabelList dataKey="Unhealthy" position="top" style={{fontSize: 11, fontWeight: 700}} /></Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ padding: "16px", border: "1px solid #e2e8f0", borderRadius: "8px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#334155", marginBottom: "16px", textAlign: "center" }}>Median Price Breakdown Per Category</h3>
              <ResponsiveContainer height={300}>
                <BarChart data={chartData.categoryHealth} margin={{ top: 20, right: 20, left: 40, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} tick={{fontSize: 11, dy: 10}}>
                     <Label value="Food Category" offset={-70} position="insideBottom" style={{ fill: "#334155", fontWeight: 700, fontSize: 13 }} />
                  </XAxis>
                  <YAxis unit=" SR">
                     <Label value="Median Price (SR)" angle={-90} position="insideLeft" offset={-35} style={{ fill: "#334155", fontWeight: 700, fontSize: 13 }} />
                  </YAxis>
                  <RechartsTooltip />
                  <RechartsLegend verticalAlign="top" height={36} />
                  <Bar dataKey="Healthy" fill="#10b981" name="Healthy Price" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Unhealthy" fill="#ef4444" name="Unhealthy Price" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>

        {/* ── MAP SECTION ── */}
        <div className="health-dashboard-content">
          <div style={{ display: "flex", flexDirection: "column", position: "relative", marginBottom: 20 }}>

            <div ref={exportRef} style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: isDownloading ? "#f8fafc" : "transparent",
              padding: isDownloading ? "48px" : "0",
              borderRadius: isDownloading ? "32px" : "0",
              width: isDownloading ? (selectedDistricts.length > 1 ? "1600px" : "1200px") : "100%",
              margin: isDownloading ? "0 auto" : "0",
              transform: isDownloading ? "scale(1)" : "none",
              transformOrigin: "top left"
            }}>

              {isDownloading && (
                <div style={{ textAlign: "center", marginBottom: "40px", paddingBottom: "24px", borderBottom: `4px solid ${kacstColors.blue}20` }}>
                  <h2 style={{ margin: 0, color: kacstColors.blue, fontSize: "48px", fontWeight: 800 }}>Neighborhood Health Profile</h2>
                  <p style={{ margin: "16px 0 0 0", color: "#6b7280", fontSize: "28px", fontWeight: "600" }}>Nutritional Coverage Analysis — Riyadh</p>
                </div>
              )}

              <div className="map-frame" style={{
                height: isDownloading ? 850 : 550,
                width: "100%", borderRadius: isDownloading ? 24 : 16, overflow: "hidden",
                border: `${isDownloading ? 3 : 1}px solid #ddd`, boxShadow: isDownloading ? "0 6px 30px rgba(0,0,0,0.1)" : "0 2px 6px rgba(0,0,0,0.1)",
                position: "relative", zIndex: 1
              }}>
                <MapContainer preferCanvas={true} center={[24.7136,46.6753]} zoom={11} style={{height:"100%",width:"100%"}} scrollWheelZoom zoomControl={false}>
                  <ZoomControl position="bottomright"/>
                  <MapController bounds={mapBounds} isDownloading={isDownloading} isComparison={selectedDistricts.length > 1} />
                  <MapClickHandler onMapClick={handleMapClick}/>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"/>

                  <LayerGroup>
                    {districtsData.map((district,index)=>{
                      const coords = parseWKTPolygon(district.geometry);
                      if (!coords) return null;

                      const selIndex = selectedDistricts.findIndex(sd => sd.id?.toString() === district.id?.toString() || sd.name_en === district.name_en);
                      const isSel = selIndex !== -1;

                      let currentEstPct = district.healthyPct;
                      if (dynamicGlobalStats && dynamicGlobalStats[district.id]) {
                        currentEstPct = dynamicGlobalStats[district.id].healthyPct;
                      }

                      const pctToColor = currentEstPct;

                      let dynamicColor = "transparent";
                      if (pctToColor !== null && !isNaN(pctToColor)) {
                          const normalized = mapThreshold > 0 ? (pctToColor / mapThreshold) * 50 : pctToColor;
                          dynamicColor = rdYlGn(Math.min(normalized, 100));
                      }
                      const hasData = dynamicColor !== "transparent" && dynamicColor !== null;

                      let borderColor = hasData ? "#555" : "transparent";
                      if (isSel) {
                        if (selectedDistricts.length === 1) {
                          borderColor = kacstColors.blue;
                        } else if (selectedDistricts.length === 2) {
                          borderColor = selIndex === 0 ? kacstColors.blue : "#10b981";
                        }
                      }

                      return (
                        <Polygon
                          key={`poly-${district.id||index}-${pctToColor}`}
                          positions={coords}
                          pathOptions={{
                            color:       borderColor,
                            weight:      isSel ? (isDownloading ? 8 : 4) : (hasData ? 0.8 : 0),
                            fillColor:   hasData ? dynamicColor : "transparent",
                            fillOpacity: hasData ? (isSel ? 0.85 : 0.55) : 0,
                          }}
                          eventHandlers={{click:()=> { if(hasData && !isDownloading) handleMapPolygonClick({value:district.id?.toString(),label:district.name_en,...district}); } }}>
                          {hasData && !isDownloading && (
                            <Tooltip sticky>
                              <strong>{cleanNeighborhoodName(district.name_en)}</strong><br/>
                              <span style={{color: "#64748b", fontSize: "0.95em", fontWeight: "600"}}>{district.name}</span><br/>
                              {district.population ? (
                                <>
                                  <span style={{color: "#0f172a", fontSize: "1.15em", fontWeight: "900"}}>👥 Pop: {district.population.toLocaleString()}</span><br/>
                                </>
                              ) : null}
                              <span style={{fontWeight:"bold", color:"#0369a1", marginTop:"4px", display:"inline-block"}}>
                                {currentEstPct!=null && !isNaN(currentEstPct) ? currentEstPct.toFixed(1)+"% Healthy Est." : "No data"}
                              </span><br/>
                              {district.healthyItemsPct!=null && !isNaN(district.healthyItemsPct) ? district.healthyItemsPct.toFixed(1)+"% healthy items" : ""}
                            </Tooltip>
                          )}
                        </Polygon>
                      );
                    })}
                  </LayerGroup>
                </MapContainer>
                <Legend title={legendTitle} isDownloading={isDownloading}/>

                {!isDownloading && (
                  <>
                    <ThresholdSlider
                      value={mapThreshold}
                      onChange={setMapThreshold}
                      onReset={() => setMapThreshold(DEFAULT_THRESHOLD)}
                    />
                    {!showSummaryCard && (
                      <DefaultSummaryCard kacstColors={kacstColors}/>
                    )}
                    <div style={{position:"absolute",top:20,left:20,zIndex:1000}}>
                      {!showSearchMenu ? (
                        <button onClick={()=>setShowSearchMenu(true)} title="Search Neighborhoods"
                          style={{width:40,height:40,borderRadius:"8px",backgroundColor:"#fff",border:`2px solid ${kacstColors.blue}`,boxShadow:"0 2px 6px rgba(0,0,0,0.2)",cursor:"pointer",display:"flex",justifyContent:"center",alignItems:"center"}}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={kacstColors.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                          </svg>
                        </button>
                      ) : (
                        <div style={{backgroundColor:"#fff",borderRadius:8,padding:10,boxShadow:"0 2px 10px rgba(0,0,0,0.2)",width:320,border:`2px solid ${kacstColors.blue}`}}>
                          <div style={{marginBottom:10}}>
                            <Select
                              isMulti
                              options={districtOptions}
                              value={selectedDistricts.map(d => ({ ...d, label: cleanNeighborhoodName(d.name_en) }))}
                              onChange={handleDropdownSelect}
                              placeholder={loading?"Loading…":"Compare up to 2 neighborhoods..."}
                              isSearchable
                              isLoading={loading}
                              styles={{
                                control:(base)=>({...base,borderColor:kacstColors.blue,boxShadow:"none","&:hover":{borderColor:kacstColors.blue}}),
                                multiValue:(base)=>({...base,backgroundColor:"#e6f2ff"}),
                                multiValueLabel:(base)=>({...base,color:kacstColors.blue,fontWeight:600}),
                                option:(base,state)=>({...base,backgroundColor:state.isSelected?kacstColors.blue:state.isFocused?"#e6f2ff":null,color:state.isSelected?"white":"#333"})
                              }}/>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <button onClick={()=>setShowSearchMenu(false)}
                              style={{padding:"6px 12px",backgroundColor:"#f5f5f5",border:"1px solid #ddd",borderRadius:4,cursor:"pointer",color:"#333",fontSize:14}}>
                              Cancel
                            </button>
                            <button onClick={()=>{clearSelection();setShowSearchMenu(false);}}
                              style={{padding:"6px 12px",backgroundColor:kacstColors.blue,border:"none",borderRadius:4,cursor:"pointer",color:"white",fontSize:14}}>
                              Close & Reset
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {!isDownloading && showSummaryCard && selectedDistricts.length > 0 && (
                  <MultiDistrictSummaryCard
                    selectedDistricts={selectedDistricts}
                    onClose={clearSelection}
                    multiDistrictStats={multiDistrictStats}
                    isFetching={isFetching}
                    mapThreshold={mapThreshold}
                    isDownloading={false}
                    onDownload={handleDownloadImage}
                  />
                )}
              </div>
              {isDownloading && showSummaryCard && selectedDistricts.length > 0 && (
                <MultiDistrictSummaryCard
                  selectedDistricts={selectedDistricts}
                  onClose={clearSelection}
                  multiDistrictStats={multiDistrictStats}
                  isFetching={isFetching}
                  mapThreshold={mapThreshold}
                  isDownloading={true}
                  onDownload={handleDownloadImage}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}