'use client';

import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Image from "next/image";

interface Collection {
  id: string;
  title: string;
  description: string;
  image: string;
  price: string;
  bottles: number;
  years: string;
  link?: string; // Link to filtered products page
  wineIds?: string[]; // Array of wine IDs that make up this collection (optional)
}

interface CollectionsClientProps {
  collections: Collection[];
}

export function CollectionsClient({ collections }: CollectionsClientProps) {
  const handleViewDetails = (collection: Collection) => {
    try {
      // If collection has a direct link, use it; otherwise go to collection detail page
      if (collection.link) {
        window.location.href = collection.link;
      } else {
        window.location.href = `/collections/${collection.id}`;
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleContactExpert = () => {
    try {
      window.location.href = '/contact';
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handlePrivateSales = () => {
    try {
      window.location.href = '/private-sales';
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (!collections || collections.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-muted-olive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-muted-olive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-charcoal-black mb-2">No Collections Available</h3>
        <p className="text-muted-olive mb-6">We're currently updating our collections. Please check back soon.</p>
        <Button onClick={handleContactExpert} className="bg-burgundy text-white hover:bg-burgundy/90">
          Contact Us for Updates
        </Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {/* Featured Collection Hero */}
      <div className="relative mb-16 rounded-2xl overflow-hidden shadow-2xl">
        <div className="aspect-[21/9] relative">
          <Image
            src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Featured wine collection"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30"></div>
        </div>
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-8">
            <div className="max-w-2xl text-white">
              <h2 className="font-heading text-3xl md:text-5xl font-bold mb-4">
                The Connoisseur&apos;s Choice
              </h2>
              <p className="text-lg md:text-xl mb-6 opacity-90">
                Our most exclusive collection featuring rare vintages and legendary producers. 
                Limited availability - only 50 sets worldwide.
              </p>
              <Button 
                size="lg" 
                className="bg-champagne-gold text-charcoal-black hover:bg-champagne-gold/90"
                onClick={() => handleViewDetails('connoisseurs-choice')}
              >
                Explore Collection
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <div key={collection.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group">
            <div className="aspect-[4/3] relative overflow-hidden">
              <Image
                src={collection.image}
                alt={collection.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-4 right-4 bg-burgundy text-white px-3 py-1 rounded-full text-sm font-semibold">
                {collection.bottles} bottles
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="font-heading text-xl font-bold mb-3 text-charcoal-black">
                {collection.title}
              </h3>
              <p className="text-muted-olive mb-4 text-sm leading-relaxed">
                {collection.description}
              </p>
              
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="text-muted-olive">Vintages: {collection.years}</span>
                <span className="font-bold text-burgundy text-lg">{collection.price}</span>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  className="flex-1 bg-burgundy text-white hover:bg-burgundy/90"
                  onClick={() => handleViewDetails(collection)}
                >
                  {collection.link ? 'Browse Collection' : 'View Details'}
                </Button>
                {collection.wineIds && collection.wineIds.length > 0 && (
                  <AddToCartButton
                    wineId={collection.wineIds[0]} // For now, add the first wine in the collection
                    variant="outline"
                    className="border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-charcoal-black"
                  >
                    Add to Cart
                  </AddToCartButton>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="mt-16 text-center bg-gradient-to-r from-burgundy to-sapphire-blue rounded-2xl p-12 text-white">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
          Can&apos;t Find What You&apos;re Looking For?
        </h2>
        <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
          Our wine experts can create a custom collection tailored to your preferences, 
          budget, and occasion. Contact us for personalized recommendations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-champagne-gold text-charcoal-black hover:bg-champagne-gold/90"
            onClick={handleContactExpert}
          >
            Contact Wine Expert
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-charcoal-black"
            onClick={handlePrivateSales}
          >
            Private Sales
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
}