import { Link, useLocation } from 'wouter';
import { Car, Menu, X, Heart, LogOut, Plus, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { useLogout, User } from '../hooks/useAuth';
import NotificationsDropdown from './NotificationsDropdown';

interface NavbarProps {
  user: User | null | undefined;
}

export default function Navbar({ user }: NavbarProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logout = useLogout();

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/cars', label: 'السيارات' },
    { href: '/dealerships', label: 'المعارض' },
    { href: '/service-centers', label: 'مراكز الخدمة' },
  ];

  const handleLogout = () => {
    logout.mutate();
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-primary-600">CarXpert</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  location === link.href
                    ? 'text-primary-600'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <NotificationsDropdown />
                <Link
                  href="/admin"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  لوحة التحكم
                </Link>
                <Link
                  href="/add-car"
                  className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Plus className="h-4 w-4" />
                  أضف سيارة
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600"
                >
                  <Heart className="h-4 w-4" />
                  المفضلة
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{user.username}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-600 hover:text-primary-600"
                >
                  تسجيل الدخول
                </Link>
                <Link href="/register" className="btn-primary text-sm">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 text-sm ${
                  location === link.href
                    ? 'text-primary-600 font-medium'
                    : 'text-gray-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 border-t mt-4">
              {user ? (
                <>
                  <Link
                    href="/admin"
                    className="block py-2 text-sm text-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    لوحة التحكم
                  </Link>
                  <Link
                    href="/add-car"
                    className="block py-2 text-sm text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    أضف سيارة
                  </Link>
                  <Link
                    href="/favorites"
                    className="block py-2 text-sm text-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    المفضلة
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block py-2 text-sm text-red-600"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block py-2 text-sm text-gray-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    تسجيل الدخول
                  </Link>
                  <Link
                    href="/register"
                    className="block py-2 text-sm text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
