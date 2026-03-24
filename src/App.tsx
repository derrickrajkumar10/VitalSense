import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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

// Backend health + demo fallback
import { checkHealth } from './lib/api';
import { usePredictionStore } from './store/predictionStore';
import { DEMO_CRITICAL_RESULT, DEMO_CRITICAL_NARRATIVE, DEMO_CRITICAL_VITALS_TYPED } from './data/demoResult';

function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="bg-ivory min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="font-serif text-4xl text-ink-main tracking-tight">Page not found</h1>
      <p className="text-sm text-ink-muted">The page you're looking for doesn't exist.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="mt-2 px-5 py-2.5 bg-ink-main text-paper rounded-xl text-sm font-medium hover:bg-ink-main/90 transition"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

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
    <>
      <ScrollToTop />
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function AppInner() {
  const { setBackendAvailable, setPredictions, setNarrative, setLastVitals } = usePredictionStore();

  useEffect(() => {
    checkHealth()
      .then(() => {
        setBackendAvailable(true);
      })
      .catch(() => {
        setBackendAvailable(false);
        setPredictions(DEMO_CRITICAL_RESULT);
        setLastVitals(DEMO_CRITICAL_VITALS_TYPED);
        setNarrative(DEMO_CRITICAL_NARRATIVE);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-ivory text-ink-main w-full min-h-screen overflow-x-hidden">
      <CursorGlow />
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
