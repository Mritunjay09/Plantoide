import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { HomeView } from './views/HomeView';
import { AnalyticsView } from './views/AnalyticsView';
import { CatalogView } from './views/CatalogView';
import { DiagnosisView } from './views/DiagnosisView';
import { SchedulerView } from './views/SchedulerView';

import { LoginView, type UserInfo } from './views/LoginView';
import { PermissionsModal } from './components/PermissionsModal';

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('userInfo'));
  const [showPermissions, setShowPermissions] = useState(() => {
    return !!localStorage.getItem('userInfo') && !localStorage.getItem('coords');
  });
  const [showHint, setShowHint] = useState(false);
  
  const [currentTab, setCurrentTab] = useState<'home' | 'inventory' | 'analytics' | 'scheduler'>('home');
  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // We expose location by storing it in localStorage so WeatherWidget can read it.
  const handleLocation = (coords: {lat: number, lon: number}) => {
    localStorage.setItem('coords', JSON.stringify(coords));
  };

  const handleLogin = (info: UserInfo) => {
    localStorage.setItem('userInfo', JSON.stringify(info));
    setIsAuthenticated(true);
    setShowPermissions(true); // Ask for permissions immediately after login
  };

  const handlePermissionsComplete = () => {
    setShowPermissions(false);
    setShowHint(true); // Show hints after permissions
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

      <main style={{
        flex: 1,
        backgroundColor: 'var(--color-background)',
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 'var(--bottom-nav-height)',
      }}>
        {currentTab === 'home' && (
          <HomeView
            onOpenDiagnosis={() => setIsDiagnosisOpen(true)}
            onNavigate={setCurrentTab}
          />
        )}
        {currentTab === 'analytics' && <AnalyticsView />}
        {currentTab === 'inventory' && <CatalogView />}
        {currentTab === 'scheduler' && <SchedulerView />}
      </main>

      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Sidebar draws over everything inside the phone */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onLogout={() => { localStorage.removeItem('userInfo'); setIsAuthenticated(false); }} onNavigate={setCurrentTab} />

      {/* Camera fullscreen — sits outside main scroll, over everything */}
      {isDiagnosisOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100 }}>
          <DiagnosisView onClose={() => setIsDiagnosisOpen(false)} />
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissions && (
        <PermissionsModal onComplete={handlePermissionsComplete} onLocationGranted={handleLocation} />
      )}

      {/* Intro Hint Overlay */}
      {showHint && !showPermissions && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 90,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          paddingBottom: '120px'
        }}>
          <div style={{
            backgroundColor: 'var(--color-surface)',
            padding: '1.5rem', borderRadius: '16px',
            width: '80%', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease'
          }}>
            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', fontWeight: 800 }}>Welcome to Plantoide!</h3>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
              Use the bottom navigation bar to manage your inventory, analyze data, and schedule tasks.
            </p>
            <button onClick={() => setShowHint(false)} style={{
              width: '100%', padding: '0.8rem',
              backgroundColor: 'var(--color-primary)', color: 'white',
              border: 'none', borderRadius: '8px', fontWeight: 700
            }}>
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppContent />
  );
}

export default App;
