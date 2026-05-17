import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const categories = {
    "People and Society": {
      description: "Explore indicators related to health, education, economic stability, and community well-being.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      tabs: [
        "Health",
        "Test",
/*         "Economic & Employment Stability",
        "Social & Community Well-being",
        "Leisure, Culture & Entertainment" */
      ]
    },
/*     "Urban Services": {
      description: "Discover metrics about environment, infrastructure, digital transformation, and transportation.",
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
      ),
      tabs: [
        "Environment & Sustainability",
        "Housing & Infrastructure",
        "Digital Transformation & Innovation",
        "Mobility & Transportation"
      ]
    } */
  };

  return (
    <div style={{
      width: '100%',
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      gap: '2rem'
    }}>
      {/* Welcome Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '1200px'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          color: '#004990',
          marginBottom: '1rem',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }}>
          Welcome to Riyadh Quality of Life Dashboard
        </h1>
        <p style={{
          fontSize: '1.2rem',
          color: '#666',
          maxWidth: '800px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Explore comprehensive quality of life indicators for Riyadh city across various domains
        </p>
      </div>

      {/* Categories Grid */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        width: '100%',
        maxWidth: '1200px',
        padding: '1rem',
        justifyContent: 'center'
      }}>
        {Object.entries(categories).map(([category, data]) => (
          <div
            key={category}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              border: '1px solid rgba(0, 73, 144, 0.1)',
              flex: 1,
              maxWidth: '500px',
              minHeight: '500px'
            }}
            onClick={() => {
              const firstTab = data.tabs[0];
              navigate(`/${firstTab.toLowerCase().replace(/ & | /g, "-")}`);
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 73, 144, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: '#004990',
              borderBottom: '2px solid rgba(0, 73, 144, 0.1)',
              paddingBottom: '1rem'
            }}>
              {data.icon}
              <h2 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0
              }}>
                {category}
              </h2>
            </div>

            <p style={{
              fontSize: '1.1rem',
              color: '#666',
              lineHeight: '1.6',
              margin: 0
            }}>
              {data.description}
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              {data.tabs.map((tab) => (
                <span
                  key={tab}
                  style={{
                    backgroundColor: 'rgba(0, 73, 144, 0.1)',
                    color: '#004990',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 73, 144, 0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 73, 144, 0.1)';
                  }}
                >
                  {tab}
                </span>
              ))}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#004990',
              fontWeight: '600',
              marginTop: 'auto',
              paddingTop: '1rem',
              borderTop: '2px solid rgba(0, 73, 144, 0.1)'
            }}>
              Explore Category
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 