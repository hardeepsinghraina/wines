'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

interface NavigationItem {
  href: string;
  label: string;
  children?: NavigationItem[];
}

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  isOpen, 
  onClose, 
  className = '' 
}) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems: NavigationItem[] = [
    {
      href: '/products',
      label: 'All Wines',
    },
    {
      href: '/categories/bordeaux',
      label: 'Bordeaux',
      children: [
        { href: '/categories/bordeaux?region=left-bank', label: 'Left Bank' },
        { href: '/categories/bordeaux?region=right-bank', label: 'Right Bank' },
        { href: '/categories/bordeaux?vintage=2010-2020', label: 'Vintage Selection' },
      ],
    },
    {
      href: '/categories/burgundy',
      label: 'Burgundy',
      children: [
        { href: '/categories/burgundy?region=cote-dor', label: 'Côte d&apos;Or' },
        { href: '/categories/burgundy?region=chablis', label: 'Chablis' },
        { href: '/categories/burgundy?region=beaujolais', label: 'Beaujolais' },
      ],
    },
    {
      href: '/categories/champagne',
      label: 'Champagne',
      children: [
        { href: '/categories/champagne?type=prestige-cuvee', label: 'Prestige Cuvée' },
        { href: '/categories/champagne?type=vintage', label: 'Vintage Champagne' },
        { href: '/categories/champagne?type=grower', label: 'Grower Champagne' },
      ],
    },
    {
      href: '/categories/rhone',
      label: 'Rhône Valley',
      children: [
        { href: '/categories/rhone?region=northern', label: 'Northern Rhône' },
        { href: '/categories/rhone?region=southern', label: 'Southern Rhône' },
        { href: '/categories/rhone?appellation=chateauneuf', label: 'Châteauneuf-du-Pape' },
      ],
    },
    {
      href: '/products/world-wines',
      label: 'World Wines',
      children: [
        { href: '/categories/tuscany', label: 'Italy' },
        { href: '/categories/rioja', label: 'Spain' },
        { href: '/categories/napa-valley', label: 'California' },
        { href: '/categories/australia', label: 'Australia' },
      ],
    },
    {
      href: '/collections',
      label: 'Collections',
      children: [
        { href: '/collections/rare', label: 'Rare Wines' },
        { href: '/collections/investment', label: 'Investment Grade' },
        { href: '/collections/new-arrivals', label: 'New Arrivals' },
        { href: '/collections/staff-picks', label: 'Staff Picks' },
      ],
    },
    {
      href: '/nft',
      label: 'Wine NFTs',
      children: [
        { href: '/nft/collections', label: 'NFT Collections' },
        { href: '/nft/marketplace', label: 'Marketplace' },
        { href: '/nft/create', label: 'Create NFT' },
      ],
    },
    {
      href: '/private-sales',
      label: 'Private Sales',
    },
  ];

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isExpanded = (href: string) => {
    return expandedItems.includes(href);
  };

  // Close navigation when clicking outside or on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const itemIsActive = isActive(item.href);
    const itemIsExpanded = isExpanded(item.href);

    return (
      <div key={item.href} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div className="flex items-center justify-between">
          <Link
            href={item.href}
            onClick={onClose}
            className={`flex-1 py-3 px-4 rounded-lg transition-all duration-200 font-medium ${
              itemIsActive
                ? 'bg-champagne/20 text-burgundy border-l-4 border-champagne'
                : 'text-charcoal hover:bg-champagne/10 hover:text-burgundy'
            } ${level > 0 ? 'text-body-sm' : 'text-body-md'}`}
          >
            {item.label}
          </Link>
          
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(item.href)}
              className="p-2 text-olive hover:text-burgundy transition-colors duration-200"
              aria-label={`Toggle ${item.label} submenu`}
            >
              {itemIsExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {hasChildren && itemIsExpanded && (
          <div className="mt-2 space-y-1 animate-slide-down">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-charcoal/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Navigation Panel */}
      <nav
        className={`fixed top-0 left-0 h-full w-80 bg-ivory shadow-luxury-lg z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-olive/20">
          <Link href="/" onClick={onClose} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-luxury-gradient rounded-full flex items-center justify-center">
              <span className="text-ivory font-display font-bold text-lg">W</span>
            </div>
            <span className="font-display font-semibold text-lg text-charcoal">
              Luxury Wine
            </span>
          </Link>
          
          <button
            onClick={onClose}
            className="p-2 text-olive hover:text-burgundy transition-colors duration-200"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navigationItems.map(item => renderNavigationItem(item))}
          </div>

          {/* Additional Links */}
          <div className="mt-8 pt-6 border-t border-olive/20">
            <div className="space-y-2">
              <Link
                href="/account"
                onClick={onClose}
                className="block py-3 px-4 text-body-md text-charcoal hover:bg-champagne/10 hover:text-burgundy transition-colors duration-200 rounded-lg font-medium"
              >
                My Account
              </Link>
              <Link
                href="/categories"
                onClick={onClose}
                className="block py-3 px-4 text-body-md text-charcoal hover:bg-champagne/10 hover:text-burgundy transition-colors duration-200 rounded-lg font-medium"
              >
                Categories
              </Link>
              <Link
                href="/about"
                onClick={onClose}
                className="block py-3 px-4 text-body-md text-charcoal hover:bg-champagne/10 hover:text-burgundy transition-colors duration-200 rounded-lg font-medium"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={onClose}
                className="block py-3 px-4 text-body-md text-charcoal hover:bg-champagne/10 hover:text-burgundy transition-colors duration-200 rounded-lg font-medium"
              >
                Contact
              </Link>
              <Link
                href="/faq"
                onClick={onClose}
                className="block py-3 px-4 text-body-md text-charcoal hover:bg-champagne/10 hover:text-burgundy transition-colors duration-200 rounded-lg font-medium"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-6 border-t border-olive/20">
            <div className="px-4">
              <h4 className="font-display font-semibold text-heading-sm text-charcoal mb-3">
                Contact Us
              </h4>
              <div className="space-y-2 text-body-sm text-olive">
                <p>info@luxurywine.com</p>
                <p>+1 (555) 123-4567</p>
                <p>Napa Valley, CA</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-olive/20 bg-ivory/50">
          <div className="text-center">
            <p className="text-caption text-olive mb-2">
              Secure Crypto Payments
            </p>
            <div className="flex justify-center space-x-2">
              <span className="text-xs bg-champagne/20 text-burgundy px-2 py-1 rounded">BTC</span>
              <span className="text-xs bg-champagne/20 text-burgundy px-2 py-1 rounded">ETH</span>
              <span className="text-xs bg-champagne/20 text-burgundy px-2 py-1 rounded">SOL</span>
              <span className="text-xs bg-champagne/20 text-burgundy px-2 py-1 rounded">EUR</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;