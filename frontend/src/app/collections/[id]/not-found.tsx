import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function CollectionNotFound() {
  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8">
            <div className="w-24 h-24 bg-burgundy/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-12 h-12 text-burgundy" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m8 0V7a2 2 0 012 2v6.414l-1.293-1.293A1 1 0 0015 14h-2.586l-1.293-1.293A1 1 0 0010 12H7.414l-1.293-1.293A1 1 0 005 10V4a2 2 0 012-2h10a2 2 0 012 2v6z" 
                />
              </svg>
            </div>
            
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-black mb-4">
              Collection Not Found
            </h1>
            
            <p className="text-lg text-muted-olive mb-8">
              The wine collection you&apos;re looking for doesn&apos;t exist or may have been moved. 
              Explore our other exclusive collections below.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/collections">
              <Button size="lg" className="bg-burgundy text-white hover:bg-burgundy/90">
                Browse All Collections
              </Button>
            </Link>
            
            <Link href="/products">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-charcoal-black"
              >
                Shop Individual Wines
              </Button>
            </Link>
          </div>

          {/* Featured Collections */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="font-heading text-2xl font-bold text-charcoal-black mb-6">
              Popular Collections
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Link 
                href="/collections/vintage-bordeaux"
                className="group p-4 rounded-lg border border-gray-200 hover:border-burgundy transition-colors"
              >
                <h3 className="font-semibold text-charcoal-black group-hover:text-burgundy mb-2">
                  Vintage Bordeaux
                </h3>
                <p className="text-sm text-muted-olive">
                  Exceptional wines from legendary vintages
                </p>
              </Link>
              
              <Link 
                href="/collections/champagne-prestige"
                className="group p-4 rounded-lg border border-gray-200 hover:border-burgundy transition-colors"
              >
                <h3 className="font-semibold text-charcoal-black group-hover:text-burgundy mb-2">
                  Champagne Prestige
                </h3>
                <p className="text-sm text-muted-olive">
                  Premium champagnes from prestigious houses
                </p>
              </Link>
              
              <Link 
                href="/collections/connoisseurs-choice"
                className="group p-4 rounded-lg border border-gray-200 hover:border-burgundy transition-colors"
              >
                <h3 className="font-semibold text-charcoal-black group-hover:text-burgundy mb-2">
                  Connoisseur&apos;s Choice
                </h3>
                <p className="text-sm text-muted-olive">
                  Our most exclusive collection worldwide
                </p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}