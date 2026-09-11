import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import DemoLoginBar from './components/common/DemoLoginBar';
import WaiterTablet from './pages/WaiterTablet';
import KitchenKanban from './pages/KitchenKanban';
import ManagerPortal from './pages/ManagerPortal';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* 1-Click Role Switcher for Tablets & Kiosk */}
      <DemoLoginBar />

      {/* Global Navigation Bar */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/waiter" replace />} />
          <Route path="/waiter" element={<WaiterTablet />} />
          <Route path="/kitchen" element={<KitchenKanban />} />
          <Route path="/manager" element={<ManagerPortal />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/waiter" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 px-4 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 DineFlow High-Speed POS & KDS. Simplified for 10–15 table hospitality.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Waiter Handheld POS</span>
            <span>•</span>
            <span>Kitchen Display System</span>
            <span>•</span>
            <span>Local Wi-Fi Real-Time Sync</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
