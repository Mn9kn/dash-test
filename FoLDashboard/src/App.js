import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/HomePage';

// تحديث مسارات الاستدعاء بأسماء المجلدات والملفات الجديدة
import Resident_Of_Riyadh from './pages/Resident_Of_Riyadh/Resident_Of_Riyadh';
import Decision_Maker from './pages/Decision_Maker/Decision_Maker';

function App() {
  return (
    <Router>
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* People and Society Category */}
        {/* تم التعديل هنا 👇 */}
        <Route path="/resident-of-riyadh" element={<Resident_Of_Riyadh />} />
        <Route path="/decision-maker" element={<Decision_Maker />} />

        {/* <Route path="/economic" element={<EconomicPage />} /> */}
        {/* <Route path="/social" element={<SocialPage />} /> */}
        {/* <Route path="/leisure" element={<LeisurePage />} /> */}

        {/* Category landing pages */}
        <Route path="/people-and-society" element={<Resident_Of_Riyadh />} /> {/* Default to Health page */}
        <Route path="/urban-services" element={<Resident_Of_Riyadh />} /> {/* Default to Environment page */}
      </Routes>
    </Router>
  );
}

export default App;