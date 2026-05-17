import React from 'react';
import { useNavigate } from 'react-router-dom';
import HomeLayout from './HomeLayout';
import '../../global.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <HomeLayout>
      {/* Main Content - Single Option Card */}
      <div
        style={{
          padding: '2rem',
          width: '100%',
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <h2 style={{
          color: '#004990',
          marginBottom: '2rem',
          fontSize: '2rem',
          textAlign: 'center',
          textShadow: '0 1px 2px rgba(255,255,255,0.8)'
        }}>
           Exploring Urban Nutrition for Healthier Cities: A Data-Driven Study of Riyadh
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>

          {/* Single Unified Card */}
          <div
            // تم التعديل هنا ليدخلك على Decision Maker أولاً 👇
            onClick={() => navigate('/decision-maker')}
            style={{
              width: '100%',
              maxWidth: '550px',
              height: '350px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              borderRadius: '15px',
              boxShadow: '0 8px 32px rgba(0, 73, 144, 0.2)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid rgba(255, 255, 255, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
              textAlign: 'center'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
              e.currentTarget.style.transform = 'translateY(-10px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img
              src="/icons/people-icon.png"
              alt="Resident and Decision Maker"
              style={{
                width: '100px',
                height: '100px',
                marginBottom: '1.5rem',
                filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
              }}
              onError={(e) => {
                // أيقونة بديلة في حال عدم وجود الصورة
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%23004990" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';
              }}
            />
            <h3 style={{
              fontSize: '1.8rem',
              color: '#004990',
              marginBottom: '0.75rem',
              lineHeight: '1.2'
            }}>
              Residents of Riyadh & Decision Maker
            </h3>
            <p style={{
              fontSize: '1.1rem',
              color: '#333',
              marginBottom: '1rem',
              lineHeight: '1.5'
            }}>
              Explore comprehensive food health insights, urban metrics, and analytical dashboards.
            </p>
          </div>

        </div>
      </div>
    </HomeLayout>
  );
};

export default HomePage;