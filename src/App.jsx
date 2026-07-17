import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Results from './pages/Results';
import Premium from './pages/Premium';
import History from './pages/History';
import Settings from './pages/Settings';

// ── NOTE ──────────────────────────────────────────────────────────────────────
// This standalone version removes Base44 auth/SDK dependencies.
// Replace the stub functions in src/lib/generationService.js with your own
// LLM API calls (OpenAI, Anthropic, etc.) and add your own auth if needed.
// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/home" element={<Home />} />
        <Route path="/results" element={<Results />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/history" element={<History />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <Toaster richColors position="top-center" />
    </Router>
  );
}