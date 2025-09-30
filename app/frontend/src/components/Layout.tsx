import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Mail,
  BookOpen,
  Users,
  Settings,
  Trophy,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import NotificationCenter from './NotificationCenter';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navigation = [
    { name: 'Tableau de Bord', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Campagnes', href: '/campaigns', icon: Mail },
    { name: 'Formation', href: '/training', icon: BookOpen },
    { name: 'Utilisateurs', href: '/users', icon: Users },
    { name: 'Classement', href: '/leaderboard', icon: Trophy },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const isActive = (href: string) => location.pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h1 className="text-xl font-bold text-primary-600">PhishGuard</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-primary-600">PhishGuard</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1" />
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <NotificationCenter />
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;