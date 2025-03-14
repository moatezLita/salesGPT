// components/layout/Navbar.js
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '../auth/UserMenu';

export function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  const isActive = (path) => pathname === path;

  const navItems = user ? [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Analyze', path: '/analyze' },
    { name: 'Emails', path: '/emails' }
  ] : [
    { name: 'Home', path: '/' },
    { name: 'Analyze', path: '/analyze' },
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed w-full top-0 z-50 border-b bg-white/80 backdrop-blur-md"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
                SalesGPT
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map(({ name, path }) => (
              <Link
                key={path}
                href={path}
                className={`relative py-5 text-sm font-medium transition-colors ${
                  isActive(path) 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {name}
                {isActive(path) && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <Link href="/auth?type=login">
                  <Button 
                    variant="ghost" 
                    className="hidden md:inline-flex hover:bg-blue-50 text-blue-600"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth?type=register">
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}