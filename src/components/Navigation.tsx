import { Link, useLocation } from 'react-router-dom';
import { Home, Map, PlusCircle, User, MessageSquare } from 'lucide-react';

export function Navigation() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/browse', icon: Map, label: 'Browse' },
    { path: '/create', icon: PlusCircle, label: 'Create' },
    { path: '/messages', icon: MessageSquare, label: 'Messages' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around md:justify-between items-center h-16">
          <div className="hidden md:flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PU</span>
            </div>
            <span className="font-bold text-xl text-gray-900">Pop-Up</span>
          </div>
          
          <div className="flex justify-around md:justify-end gap-1 md:gap-4 w-full md:w-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col md:flex-row items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-emerald-600'
                      : 'text-gray-600 hover:text-emerald-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs md:text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
