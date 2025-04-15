import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { Home, Clipboard, Settings, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AdminLogin } from './AdminLogin';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { isAdmin } = useAuth();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Define navigation items
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home, requiresAdmin: true },
    { name: 'Erasers', href: '/erasers', icon: Clipboard, requiresAdmin: false },
    { name: 'Settings', href: '/settings', icon: Settings, requiresAdmin: true },
  ];

  // Filter navigation items based on admin status
  const navigation = navigationItems.filter(item => !item.requiresAdmin || isAdmin);

  // If user is on a protected page without admin access, redirect to Erasers
  if (!isAdmin && (location.pathname === '/' || location.pathname === '/settings')) {
    return <Navigate to="/erasers" />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-10 flex w-64 flex-col bg-white transition-all duration-300 shadow-lg",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-blue-600">SmartErase</h1>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-4 py-3 mt-2 text-gray-600 rounded-lg hover:bg-gray-100",
                location.pathname === item.href && "bg-blue-50 text-blue-600"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
        
        {/* Admin Login Section */}
        <AdminLogin />
      </div>

      {/* Main content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "ml-64" : "ml-0"
      )}>
        <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-white px-4 shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="mr-4"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <h2 className="text-lg font-medium">Smart Board Eraser Management System</h2>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
