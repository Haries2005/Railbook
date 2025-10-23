import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { useAuth } from './contexts/AuthContext';
import Header from './components/common/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TrainSearch from './components/search/TrainSearch';
import TrainResults from './components/search/TrainResults';
import BookingForm from './components/booking/BookingForm';
import AdminDashboard from './components/admin/AdminDashboard';
import MyBookings from './components/bookings/MyBookings';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('login');
  const { isAuthenticated, isAdmin } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    // Handle authentication redirect
    if (!isAuthenticated && !['login', 'register'].includes(currentPage)) {
      return <Login onNavigate={handleNavigate} />;
    }

    switch (currentPage) {
      case 'login':
        return <Login onNavigate={handleNavigate} />;
      case 'register':
        return <Register onNavigate={handleNavigate} />;
      case 'search':
        return <TrainSearch onNavigate={handleNavigate} />;
      case 'results':
        return <TrainResults onNavigate={handleNavigate} />;
      case 'booking':
        return <BookingForm onNavigate={handleNavigate} />;
      case 'admin':
        return isAdmin ? <AdminDashboard onNavigate={handleNavigate} /> : <TrainSearch onNavigate={handleNavigate} />;
      case 'bookings':
        return <MyBookings onNavigate={handleNavigate} />;
      default:
        return isAuthenticated ? <TrainSearch onNavigate={handleNavigate} /> : <Login onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isAuthenticated && (
        <Header onNavigate={handleNavigate} currentPage={currentPage} />
      )}
      <main className={`${isAuthenticated ? 'pt-20' : ''} min-h-screen`}>
        {renderPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;