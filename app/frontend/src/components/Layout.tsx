import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, Mail, LogOut, Shield } from 'lucide-react';

export const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-semibold">
        ⚠️ INTERNAL USE ONLY - Security Training Platform
      </div>
      <div className="flex">
        <aside className="w-64 bg-white shadow-lg min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Shield className="w-8 h-8 text-primary-600" />
              <h1 className="text-xl font-bold">PhishGuard</h1>
            </div>
            <nav className="space-y-2">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink 
                to="/campaigns" 
                className={({ isActive }) => 
                  `flex items-center space-x-3 px-4 py-3 rounded-lg ${
                    isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Mail className="w-5 h-5" />
                <span>Campaigns</span>
              </NavLink>
            </nav>
          </div>
          <div className="absolute bottom-0 w-64 p-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              <button 
                onClick={() => { logout(); navigate('/login'); }} 
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};