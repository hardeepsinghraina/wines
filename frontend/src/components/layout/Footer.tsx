'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  CreditCard,
  Shield,
  Truck
} from 'lucide-react';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Wine Categories',
      links: [
        { href: '/products/bordeaux', label: 'Bordeaux' },
        { href: '/products/burgundy', label: 'Burgundy' },
        { href: '/products/champagne', label: 'Champagne' },
        { href: '/products/rhone-valley', label: 'Rhône Valley' },
        { href: '/products/world-wines', label: 'World Wines' },
        { href: '/collections/rare', label: 'Rare Wines' },
      ],
    },
    {
      title: 'Services',
      links: [
        { href: '/services/vip-delivery', label: 'VIP Delivery' },
        { href: '/services/wine-storage', label: 'Wine Storage' },
        { href: '/services/authentication', label: 'Authentication' },
        { href: '/services/insurance', label: 'Wine Insurance' },
        { href: '/nft', label: 'Wine NFTs' },
        { href: '/private-sales', label: 'Private Sales' },
      ],
    },
    {
      title: 'Support',
      links: [
        { href: '/contact', label: 'Contact Us' },
        { href: '/faq', label: 'FAQ' },
        { href: '/categories', label: 'Categories' },
        { href: '/account/orders', label: 'Order History' },
        { href: '/products/search', label: 'Search Wines' },
        { href: '/account/profile', label: 'My Profile' },
      ],
    },
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us' },
        { href: '/careers', label: 'Careers' },
        { href: '/press', label: 'Press' },
        { href: '/sustainability', label: 'Sustainability' },
        { href: '/affiliate', label: 'Affiliate Program' },
        { href: '/blog', label: 'Wine Blog' },
      ],
    },
  ];

  const socialLinks = [
    { href: 'https://facebook.com', icon: Facebook, label: 'Facebook' },
    { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
    { href: 'https://instagram.com', icon: Instagram, label: 'Instagram' },
    { href: 'https://youtube.com', icon: Youtube, label: 'YouTube' },
  ];

  const paymentMethods = [
    'Bitcoin (BTC)',
    'Ethereum (ETH)',
    'Solana (SOL)',
    'Dogecoin (DOGE)',
    'Litecoin (LITE)',
    'USDC',
    'USDT',
    'Euro (EUR)',
  ];

  return (
    <footer className={`bg-charcoal text-ivory ${className}`}>
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-luxury-gradient rounded-full flex items-center justify-center">
                <span className="text-ivory font-display font-bold text-xl">W</span>
              </div>
              <span className="font-display font-semibold text-xl text-ivory">
                Luxury Wine
              </span>
            </Link>
            <p className="text-body-sm text-ivory/80 mb-6 leading-relaxed">
              Discover the world&apos;s finest wines with secure cryptocurrency payments. 
              Premium collection featuring exclusive vintages and rare bottles.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-champagne" />
                <span className="text-body-sm text-ivory/80">info@luxurywine.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-champagne" />
                <span className="text-body-sm text-ivory/80">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-champagne" />
                <span className="text-body-sm text-ivory/80">Napa Valley, CA</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="font-display font-semibold text-heading-sm text-ivory mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-body-sm text-ivory/80 hover:text-champagne transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Methods & Features */}
        <div className="mt-12 pt-8 border-t border-ivory/20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="h-5 w-5 text-champagne" />
                <h4 className="font-display font-semibold text-heading-sm text-ivory">
                  Payment Methods
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map((method) => (
                  <span
                    key={method}
                    className="text-body-sm text-ivory/80 bg-charcoal-light px-3 py-1 rounded-md border border-ivory/10"
                  >
                    {method}
                  </span>
                ))}
              </div>
            </div>

            {/* Security Features */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-champagne" />
                <h4 className="font-display font-semibold text-heading-sm text-ivory">
                  Security & Trust
                </h4>
              </div>
              <ul className="space-y-2">
                <li className="text-body-sm text-ivory/80">SSL Encrypted Transactions</li>
                <li className="text-body-sm text-ivory/80">Blockchain Verification</li>
                <li className="text-body-sm text-ivory/80">Wine Authentication</li>
                <li className="text-body-sm text-ivory/80">GDPR Compliant</li>
              </ul>
            </div>

            {/* Delivery Features */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Truck className="h-5 w-5 text-champagne" />
                <h4 className="font-display font-semibold text-heading-sm text-ivory">
                  Delivery & Service
                </h4>
              </div>
              <ul className="space-y-2">
                <li className="text-body-sm text-ivory/80">Global VIP Delivery</li>
                <li className="text-body-sm text-ivory/80">Temperature Controlled</li>
                <li className="text-body-sm text-ivory/80">Full Insurance Coverage</li>
                <li className="text-body-sm text-ivory/80">Real-time Tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="mt-12 pt-8 border-t border-ivory/20">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <span className="font-display font-medium text-ivory">Follow Us:</span>
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <Link
                    key={social.href}
                    href={social.href}
                    className="text-ivory/80 hover:text-champagne transition-colors duration-200"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent className="h-5 w-5" />
                  </Link>
                );
              })}
            </div>

            {/* Newsletter Signup */}
            <div className="flex items-center space-x-4">
              <span className="font-display font-medium text-ivory">Stay Updated:</span>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-2 bg-charcoal-light border border-ivory/20 rounded-l-lg text-ivory placeholder-ivory/60 focus:outline-none focus:ring-2 focus:ring-champagne focus:border-transparent"
                />
                <button className="px-6 py-2 bg-champagne text-charcoal font-medium rounded-r-lg hover:bg-champagne-light transition-colors duration-200">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-ivory/20 bg-charcoal-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-body-sm text-ivory/60">
              © {currentYear} Luxury Wine Collection. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy-policy"
                className="text-body-sm text-ivory/60 hover:text-champagne transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-body-sm text-ivory/60 hover:text-champagne transition-colors duration-200"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookie-policy"
                className="text-body-sm text-ivory/60 hover:text-champagne transition-colors duration-200"
              >
                Cookie Policy
              </Link>
              <Link
                href="/refund-policy"
                className="text-body-sm text-ivory/60 hover:text-champagne transition-colors duration-200"
              >
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;