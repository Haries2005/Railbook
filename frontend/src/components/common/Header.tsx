import React from 'react';
import { Train, LogOut, User, Search, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    onNavigate('login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 shadow-2xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onNavigate('search')}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
              <Train className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Railbook</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => onNavigate('search')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                currentPage === 'search' || currentPage === 'results'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Search className="h-4 w-4" />
              <span>Search Trains</span>
            </button>
            
            <button
              onClick={() => onNavigate('bookings')}
              className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                currentPage === 'bookings'
                  ? 'bg-green-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <User className="h-4 w-4" />
              <span>My Bookings</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                  currentPage === 'admin'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-slate-300">
              <User className="h-4 w-4" />
              <span className="text-sm">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden mt-3 flex space-x-2">
          <button
            onClick={() => onNavigate('search')}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-all ${
              currentPage === 'search' || currentPage === 'results'
                ? 'bg-blue-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
          
          <button
            onClick={() => onNavigate('bookings')}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-all ${
              currentPage === 'bookings'
                ? 'bg-green-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Bookings</span>
          </button>
          
          {isAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg transition-all ${
                currentPage === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;