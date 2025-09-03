import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Menu,
  X,
  User,
  LogOut,
  Settings,
  Bell,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  Trophy,
  BarChart3,
  Search,
  Plus,
  Star,
} from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Resources', href: '/resources', icon: FileText },
    { name: 'Bookmarks', href: '/bookmarks', icon: Star },
    { name: 'Courses', href: '/courses', icon: BookOpen },
    { name: 'Groups', href: '/study-groups', icon: Users },
    { name: 'Requests', href: '/requests', icon: MessageSquare },
    { name: 'Achievements', href: '/achievements', icon: MessageSquare },
  ];

  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Resources', href: '/admin/resources', icon: FileText },
    { name: 'Study Groups', href: '/admin/study-groups', icon: Users },
    { name: 'Requests', href: '/admin/requests', icon: MessageSquare },
    { name: 'Achievements', href: '/admin/achievements', icon: Trophy },
  ];

  if (!isAuthenticated) {
    return null;
  }

  const currentNavigation = user?.role === 'admin' ? adminNavigation : navigation;

  return (
    <nav className='bg-white shadow-lg border-b border-gray-200'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* Logo and main navigation */}
          <div className='flex items-center'>
            <Link to='/dashboard' className='flex-shrink-0 flex items-center'>
              <div className='h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center'>
                <BookOpen className='h-5 w-5 text-white' />
              </div>
              <span className='ml-2 text-xl font-bold text-gray-900'>CampusConnect</span>
            </Link>

            {/* Desktop navigation */}
            <div className='hidden md:ml-8 md:flex md:space-x-8'>
              {currentNavigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className='h-4 w-4 mr-1' />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Search bar */}


          {/* Right side items */}
          <div className='flex items-center space-x-4'>
            {/* Notifications */}
            <Link
              to='/notifications'
              className='p-2 text-gray-400 hover:text-gray-500 relative'
            >
              <Bell className='h-6 w-6' />
              {/* Notification badge - you can add logic to show unread count */}
              <span className='absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full'></span>
            </Link>

            {/* Achievements */}
            {/* <Link
              to='/achievements'
              className='p-2 text-gray-400 hover:text-gray-500'
            >
              <Trophy className='h-6 w-6' />
            </Link> */}

            {/* Profile dropdown */}
            <div className='relative'>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className='flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              >
                <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name}
                      className='h-8 w-8 rounded-full object-cover'
                    />
                  ) : (
                    <User className='h-5 w-5 text-gray-600' />
                  )}
                </div>
              </button>

              {isProfileOpen && (
                <div className='origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50'>
                  <Link
                    to='/profile'
                    className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <User className='h-4 w-4 mr-2' />
                    Your Profile
                  </Link>
                  <Link
                    to='/settings'
                    className='flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings className='h-4 w-4 mr-2' />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className='flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                  >
                    <LogOut className='h-4 w-4 mr-2' />
                    Sign out
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className='md:hidden'>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className='inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500'
              >
                {isMenuOpen ? (
                  <X className='block h-6 w-6' />
                ) : (
                  <Menu className='block h-6 w-6' />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className='md:hidden'>
          <div className='pt-2 pb-3 space-y-1'>
            {currentNavigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Icon className='h-5 w-5 mr-3' />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;