import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import DemoLoginBar from './components/common/DemoLoginBar';
import LandingPage from './pages/LandingPage';
import CustomerMenu from './pages/CustomerMenu';
import KitchenKanban from './pages/KitchenKanban';
import ManagerPortal from './pages/ManagerPortal';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col selection:bg-gold-500 selection:text-dark-900">
      {/* Recruiter & Interviewer Zero-Friction Demo Bar */}
      <DemoLoginBar />

      {/* Global Navigation Bar */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<CustomerMenu />} />
          <Route path="/kitchen" element={<KitchenKanban />} />
          <Route path="/manager" element={<ManagerPortal />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700/60 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 DineFlow SaaS. Engineered for high-concurrency culinary environments.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>MERN Stack</span>
            <span>•</span>
            <span>Socket.io Real-Time</span>
            <span>•</span>
            <span>Razorpay Test Mode</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
