/**
 * Layout.jsx
 * Global layout component with tabs navigation and background styling
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../global.css";

// اسم التصنيف الجديد
const CAT_NAME = "Decision Maker and Resident of Riyadh";

// Categories and their tabs
const categories = {
  [CAT_NAME]: [
    "Resident of Riyadh",
    "Decision Maker"
  ],
};

export default function Layout({ children, currentTab }) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(CAT_NAME);

  return (
    <div
      className="dashboard-bg"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundImage: "url('/icons/skyline-bg.png')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Header */}
      <header
        className="header"
        style={{
          padding: "1rem 2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          position: "sticky",
          top: 0,
          zIndex: 1000
        }}
      >
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
          position: "relative"
        }}>
          <div style={{
            position: "relative",
            padding: "0.5rem",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
          }}>
            <img
              src="/kacst-logo-no-bg.png"
              alt="KACST Logo"
              className="logo"
              style={{
                height: "55px",
                width: "auto",
                objectFit: "contain",
                mixBlendMode: "multiply",
                backgroundColor: "transparent",
                filter: "drop-shadow(0 0 4px rgba(0, 0, 0, 0.15))",
                transition: "transform 0.3s ease"
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <h1 className="dashboard-title" style={{ fontSize: "1.75rem", fontWeight: "bold", margin: 0, color: "#004990" }}>
              Riyadh Dashboard
            </h1>
            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666", fontWeight: "500" }}>
              Decision Maker and Resident of Riyadh Dashboards
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            borderRadius: "30px",
            border: "2px solid #004990",
            fontWeight: "600",
            backgroundColor: "#ffffff",
            color: "#004990",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#004990"; e.currentTarget.style.color = "#ffffff"; }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "#ffffff"; e.currentTarget.style.color = "#004990"; }}
        >
          Home
        </button>
      </header>

      {/* Category Tabs */}
      <nav
        className="category-nav"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "1.5rem",
          padding: "1.25rem 2rem",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)"
        }}
      >
        <button
            style={{
              padding: "1rem 2rem",
              fontSize: "1.1rem",
              borderRadius: "12px",
              border: "none",
              fontWeight: "600",
              backgroundColor: "#004990",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}
          >
            {CAT_NAME}
          </button>
      </nav>

      {/* Navigation Tabs */}
      <nav
        className="tabs-nav"
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "0.75rem",
          padding: "1.5rem",
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(8px)",
          position: "relative"
        }}
      >
        {categories[CAT_NAME].map((tab) => {
          // تم التعديل هنا لربط الأزرار بالروابط الجديدة
          const path = tab === 'Resident of Riyadh' ? '/resident-of-riyadh' : '/decision-maker';
          const isActive = tab === currentTab;

          return (
            <button
              key={tab}
              className={`tab-button ${isActive ? "active" : ""}`}
              onClick={() => navigate(path)}
              style={{
                padding: "0.75rem 1.5rem",
                fontSize: "1rem",
                borderRadius: "30px",
                border: "2px solid",
                borderColor: isActive ? "#004990" : "rgba(0, 73, 144, 0.2)",
                fontWeight: "600",
                backgroundColor: isActive ? "#004990" : "rgba(255, 255, 255, 0.8)",
                color: isActive ? "#ffffff" : "#004990",
                cursor: "pointer"
              }}
            >
              {tab}
            </button>
          );
        })}
      </nav>

      {/* Page Content */}
      <div
        className="page-wrapper"
        style={{
          flex: 1,
          padding: "1rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflow: "auto"
        }}
      >
        {children}
      </div>
    </div>
  );
}