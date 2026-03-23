import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import './index.css';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import VitalInputPage from './pages/VitalInputPage';
import PredictionsPage from './pages/PredictionsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import PatientHistoryPage from './pages/PatientHistoryPage';
import ClinicalChatPage from './pages/ClinicalChatPage';
import ClinicalReportsPage from './pages/ClinicalReportsPage';

// Global UI
import CursorGlow from './components/CursorGlow';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vitals" element={<VitalInputPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/insights" element={<AIInsightsPage />} />
        <Route path="/history" element={<PatientHistoryPage />} />
        <Route path="/chat" element={<ClinicalChatPage />} />
        <Route path="/reports" element={<ClinicalReportsPage />} />
      </Routes>
    </AnimatePresence>
  );
}

function AppInner() {
  return (
    <div className="bg-ivory text-ink-main w-full min-h-screen overflow-x-hidden">
      <CursorGlow />
      <ScrollToTop />
      <AnimatedRoutes />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
