/**
 * Navigation Bar Component
 * Provides main navigation, user authentication status, and responsive menu
 * Includes role-based navigation items and user profile dropdown
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Settings, 
  Home, 
  Package, 
  Calendar, 
  BarChart3,
  Shield,
  Truck
} from 'lucide-react';
import { logger } from '@/lib/logger';

/**
 * Main Navigation Component
 */
export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (session?.user?.role === 'enduser') {
      // End user navigation
      return [
        { name: 'Dashboard', href: '/enduser', icon: BarChart3 },
        { name: 'Products', href: '/enduser/products', icon: Package },
        { name: 'Orders', href: '/enduser/orders', icon: Calendar },
        { name: 'Transfer', href: '/enduser/transfer', icon: Truck },
        { name: 'Customers', href: '/enduser/customers', icon: User },
      ];
    } else {
      // Customer navigation
      return [
        { name: 'Home', href: '/', icon: Home },
        { name: 'My Rentals', href: '/my-rentals', icon: Calendar },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  // Handle sign out
  const handleSignOut = async () => {
    try {
      logger.auth('User signing out', session?.user?.email);
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      logger.error('Error during sign out', { error });
    }
  };

  // Check if current path is active
  const isActivePath = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main navigation */}
          <div className="flex">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center px-2 py-2 text-xl font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Package className="w-8 h-8 mr-2" />
              RentalManager
            </Link>

            {/* Desktop navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200
                      ${isActivePath(item.href)
                        ? 'text-primary-700 bg-primary-100'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center space-x-4">
            {/* User role badge */}
            {session?.user?.role === 'enduser' && (
              <div className="hidden sm:flex items-center">
                <div className="badge bg-primary-100 text-primary-800">
                  <Shield className="w-3 h-3 mr-1" />
                  Business
                </div>
              </div>
            )}

            {/* Authentication section */}
            {status === 'loading' ? (
              // Loading state
              <div className="flex items-center">
                <div className="loading-spinner w-6 h-6"></div>
              </div>
            ) : session ? (
              // Authenticated user menu
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center p-2 text-sm rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {session.user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="hidden md:block ml-2 text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {session.user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                </button>

                {/* User dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 md:hidden">
                      <div className="text-sm font-medium text-gray-900">
                        {session.user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.user.email}
                      </div>
                    </div>
                    
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Unauthenticated state
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="btn btn-outline"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-2">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-base font-medium rounded-lg transition-colors
                      ${isActivePath(item.href)
                        ? 'text-primary-700 bg-primary-100'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {(isMobileMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-25 sm:hidden"
          onClick={() => {
            setIsMobileMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </nav>
  );
}
