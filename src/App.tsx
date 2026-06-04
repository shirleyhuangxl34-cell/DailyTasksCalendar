import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import TodayPage from './pages/TodayPage';
import CalendarPage from './pages/CalendarPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import BottomNav from './components/BottomNav';

type Tab = 'today' | 'calendar' | 'stats' | 'profile';

function AppContent() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<Tab>('today');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center animate-pulse">
            <span className="text-white text-xl">✓</span>
          </div>
          <p className="text-gray-400 text-sm">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {tab === 'today' && <TodayPage />}
      {tab === 'calendar' && <CalendarPage />}
      {tab === 'stats' && <StatsPage />}
      {tab === 'profile' && <ProfilePage />}
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
