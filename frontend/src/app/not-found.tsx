import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BackButton } from '@/components/ui/BackButton'
import { Home, Search } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Page Not Found | Luxury Wine Collection',
  description: 'The page you are looking for could not be found.',
  keywords: '404, page not found, luxury wine, wine collection',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-white flex items-center justify-center py-12">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Card className="p-8">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl font-bold text-burgundy mb-4">404</div>
            <div className="w-24 h-24 mx-auto mb-4 bg-muted-olive/10 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-muted-olive" />
            </div>
          </div>

          {/* Content */}
          <h1 className="text-2xl font-bold text-charcoal-black mb-4">
            Page Not Found
          </h1>
          <p className="text-muted-olive mb-8">
            The wine you're looking for seems to have been uncorked already. 
            Let's help you find something else from our cellar.
          </p>

          {/* Actions */}
          <div className="space-y-3">
            <Link href="/" className="block">
              <Button size="lg" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Return Home
              </Button>
            </Link>
            <Link href="/products" className="block">
              <Button variant="outline" size="lg" className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Browse Wines
              </Button>
            </Link>
            <BackButton />
          </div>

          {/* Suggestions */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-olive mb-3">Popular pages:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/categories">
                <span className="text-xs px-3 py-1 bg-burgundy/10 text-burgundy rounded-full hover:bg-burgundy/20 transition-colors">
                  Wine Categories
                </span>
              </Link>
              <Link href="/nft">
                <span className="text-xs px-3 py-1 bg-burgundy/10 text-burgundy rounded-full hover:bg-burgundy/20 transition-colors">
                  Wine NFTs
                </span>
              </Link>
              <Link href="/private-sales">
                <span className="text-xs px-3 py-1 bg-burgundy/10 text-burgundy rounded-full hover:bg-burgundy/20 transition-colors">
                  Private Sales
                </span>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}