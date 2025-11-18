'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Menu, X } from 'lucide-react';
import { SearchBar } from '../product/SearchBar';
import { CartIcon } from '../cart';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  const navigationItems = [
    { href: '/products', label: 'Wines' },
    { href: '/products/bordeaux', label: 'Bordeaux' },
    { href: '/products/burgundy', label: 'Burgundy' },
    { href: '/products/champagne', label: 'Champagne' },
    { href: '/products/world-wines', label: 'World Wines' },
    { href: '/collections', label: 'Collections' },
    { href: '/nft', label: 'Wine NFTs' },
  ];

  return (
    <header className={`bg-ivory border-b border-olive/20 sticky top-0 z-50 glass-effect ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 hover-gold">
              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-luxury-gradient rounded-full flex items-center justify-center">
                <span className="text-ivory font-display font-bold text-lg lg:text-xl">W</span>
              </div>
              <span className="font-display font-semibold text-lg lg:text-xl text-charcoal">
                Luxury Wine
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-body-md text-charcoal hover-gold transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-8">
            <SearchBar className="w-full" />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Toggle */}
            <button
              onClick={toggleSearch}
              className="lg:hidden p-2 text-charcoal hover:text-burgundy transition-colors duration-200"
              aria-label="Toggle search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Account */}
            <Link
              href="/account"
              className="p-2 text-charcoal hover:text-burgundy transition-colors duration-200"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Shopping Cart */}
            <CartIcon />

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-charcoal hover:text-burgundy transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t border-olive/20 animate-slide-down">
            <SearchBar autoFocus />
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-olive/20 animate-slide-down">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-body-md text-charcoal hover:bg-champagne/10 hover:text-burgundy transition-colors duration-200 rounded-lg font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;