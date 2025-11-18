'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
      <Link
        href="/"
        className="text-muted-olive hover:text-burgundy transition-colors duration-200"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-muted-olive" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-muted-olive hover:text-burgundy transition-colors duration-200"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-charcoal-black font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  )
}

export default Breadcrumb