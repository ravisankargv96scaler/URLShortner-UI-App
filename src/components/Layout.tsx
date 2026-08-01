import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link2, LogOut, LayoutDashboard, BarChart3 } from 'lucide-react';

export function Layout() {
  const { isAuthenticated, username, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <Link2 className="w-6 h-6" />
            <span className="text-xl font-bold tracking-tight">URL Shortener</span>
          </div>
          
          {isAuthenticated && (
            <div className="flex items-center gap-6">
              <nav className="flex gap-4">
                <Link
                  to="/"
                  className={`flex items-center gap-1.5 text-sm font-medium ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/analytics"
                  className={`flex items-center gap-1.5 text-sm font-medium ${location.pathname === '/analytics' ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>
              </nav>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700">{username}</span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
