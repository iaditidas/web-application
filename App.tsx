
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, User, Order } from './types.ts';
import { SplashView } from './views/SplashView.tsx';
import { AuthView } from './views/AuthView.tsx';
import { UserDashboard } from './views/UserDashboard.tsx';
import { AdminDashboard } from './views/AdminDashboard.tsx';
import { TrackingView } from './views/TrackingView.tsx';
import { mockStore } from './services/mockStore.ts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('SPLASH');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  useEffect(() => {
    try {
      const user = mockStore.getUser();
      if (user) {
        // Auto-correct role if it was incorrectly set due to the previous typo
        if (user.email.endsWith('@flashman.com') && user.role !== 'ADMIN') {
          user.role = 'ADMIN';
          mockStore.setUser(user);
        }
        setCurrentUser(user);
      }
    } catch (e) {
      console.error('Session restoration failed', e);
    }
  }, []);

  const handleSplashFinish = useCallback(() => {
    const user = mockStore.getUser();
    if (user) {
      if (user.email.endsWith('@flashman.com') && user.role !== 'ADMIN') {
        user.role = 'ADMIN';
        mockStore.setUser(user);
      }
      setCurrentUser(user);
      setView(user.role === 'ADMIN' ? 'ADMIN' : 'DASHBOARD');
    } else {
      setView('AUTH');
    }
  }, []);

  const handleAuth = useCallback((user: User) => {
    setCurrentUser(user);
    setView(user.role === 'ADMIN' ? 'ADMIN' : 'DASHBOARD');
  }, []);

  const handleLogout = useCallback(() => {
    mockStore.setUser(null);
    setCurrentUser(null);
    setView('AUTH');
  }, []);

  const handleSelectOrder = useCallback((order: Order) => {
    setActiveOrder(order);
    setView('TRACKING');
  }, []);

  const renderView = () => {
    try {
      switch (view) {
        case 'SPLASH':
          return <SplashView onFinish={handleSplashFinish} />;
        case 'AUTH':
          return <AuthView onAuth={handleAuth} />;
        case 'DASHBOARD':
          return currentUser ? (
            <UserDashboard 
              user={currentUser} 
              onLogout={handleLogout} 
              onSelectOrder={handleSelectOrder} 
            />
          ) : <AuthView onAuth={handleAuth} />;
        case 'ADMIN':
          return currentUser?.role === 'ADMIN' ? (
            <AdminDashboard user={currentUser} onLogout={handleLogout} />
          ) : <AuthView onAuth={handleAuth} />;
        case 'TRACKING':
          return activeOrder ? (
            <TrackingView order={activeOrder} onBack={() => setView('DASHBOARD')} />
          ) : <div className="p-8 text-center font-bold text-red-600">Order context lost. Redirecting...</div>;
        default:
          return <SplashView onFinish={handleSplashFinish} />;
      }
    } catch (e) {
      console.error('View rendering failed', e);
      return <div className="p-10 text-center">A critical error occurred. Please refresh.</div>;
    }
  };

  return (
    <div className="antialiased selection:bg-red-100 selection:text-red-600 min-h-screen bg-white">
      {renderView()}
    </div>
  );
};

export default App;
