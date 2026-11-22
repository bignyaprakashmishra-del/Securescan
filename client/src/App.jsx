import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import WebsitesPage from './pages/WebsitesPage';
import ScansPage from './pages/ScansPage';
import ScanDetailPage from './pages/ScanDetailPage';
import ScanComparePage from './pages/ScanComparePage';
import DemoModePage from './pages/DemoModePage';
import { useAuth } from './context/AuthContext';
import { useDemo } from './context/DemoContext';

export default function App() {
  const { user, loading } = useAuth();
  const { isDemoMode } = useDemo();
  const [currentPage, setCurrentPage] = useState('landing');
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [compareAId, setCompareAId] = useState(null);
  const [compareBId, setCompareBId] = useState(null);

  // If user is already logged in on initial load, take them to dashboard
  useEffect(() => {
    if (user && currentPage === 'landing') {
      setCurrentPage('dashboard');
    }
  }, [user]);

  // Navigate helper
  const navigate = (page) => {
    // If attempting to access protected pages without auth and not in demo mode
    const protectedPages = ['dashboard', 'websites', 'scans', 'scan-detail', 'scan-compare'];
    if (protectedPages.includes(page) && !user && !isDemoMode) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectScan = (scanId) => {
    setSelectedScanId(scanId);
  };

  const handleCompareScans = (idA, idB) => {
    setCompareAId(idA);
    setCompareBId(idB);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-slate-400 font-mono text-sm space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-purple to-brand-cyan p-0.5 shadow-glow animate-pulse">
          <div className="w-full h-full bg-dark-950 rounded-[14px] flex items-center justify-center">
            <span className="text-brand-cyan font-bold">SS</span>
          </div>
        </div>
        <p>Initializing SecureScan Intelligence Platform...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
      <Navbar onNavigate={navigate} currentPage={currentPage} />

      <main className="flex-1">
        {currentPage === 'landing' && <LandingPage onNavigate={navigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
        {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
        {currentPage === 'dashboard' && (
          <DashboardPage onNavigate={navigate} onSelectScan={handleSelectScan} />
        )}
        {currentPage === 'websites' && (
          <WebsitesPage onNavigate={navigate} onSelectScan={handleSelectScan} />
        )}
        {currentPage === 'scans' && (
          <ScansPage
            onNavigate={navigate}
            onSelectScan={handleSelectScan}
            onCompareScans={handleCompareScans}
          />
        )}
        {currentPage === 'scan-detail' && (
          <ScanDetailPage
            scanId={selectedScanId}
            onNavigate={navigate}
            onCompareScans={(id) => handleCompareScans(id, null)}
          />
        )}
        {currentPage === 'scan-compare' && (
          <ScanComparePage
            scanAId={compareAId}
            scanBId={compareBId}
            onNavigate={navigate}
          />
        )}
        {currentPage === 'demo' && <DemoModePage onNavigate={navigate} />}
      </main>
    </div>
  );
}
