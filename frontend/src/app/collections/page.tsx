"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { CollectionsClient } from "@/components/collections";
import { ErrorBoundary } from "@/components/ErrorBoundary";


export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resetAndRetry = async () => {
    try {
      // Reset circuit breakers
      const { CircuitBreakerManager } = await import('@/lib/error-handler');
      CircuitBreakerManager.getInstance().resetAll();
      console.log('Circuit breakers reset, retrying...');
      
      // Retry fetching
      setError(null);
      setLoading(true);
      window.location.reload();
    } catch (error) {
      console.error('Failed to reset circuit breakers:', error);
      window.location.reload();
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
  ];

  useEffect(() => {
    async function fetchCollections() {
      try {
        setLoading(true);
        console.log('Fetching collections data...');
        
        // Get wine counts for each collection type
        const { getApiUrl } = await import('@/config/api');
        const [champagneCount, redCount, whiteCount, giftCount] = await Promise.all([
          fetch(getApiUrl('/api/products?category=Champagne&limit=1'))
            .then(res => res.json())
            .then(data => data.data?.total || 0),
          fetch(getApiUrl('/api/products?category=Red%20Wine&limit=1'))
            .then(res => res.json())
            .then(data => data.data?.total || 0),
          fetch(getApiUrl('/api/products?category=White%20Wine&limit=1'))
            .then(res => res.json())
            .then(data => data.data?.total || 0),
          fetch(getApiUrl('/api/products?category=Gift%20Set&limit=1'))
            .then(res => res.json())
            .then(data => data.data?.total || 0)
        ]);

        console.log('Wine counts:', { champagneCount, redCount, whiteCount, giftCount });

        const collectionsData = [
          {
            id: 'champagne-prestige',
            title: 'Champagne Prestige Collection',
            description: 'Premium champagnes from the most prestigious houses in the Champagne region.',
            image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: 'From €150',
            bottles: champagneCount,
            years: '2012-2018',
            link: '/products?category=Champagne',
          },
          {
            id: 'red-wine-collection',
            title: 'Premium Red Wine Collection',
            description: 'Exceptional red wines from renowned regions around the world.',
            image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: 'From €50',
            bottles: redCount,
            years: '2015-2020',
            link: '/products?category=Red%20Wine',
          },
          {
            id: 'white-wine-collection',
            title: 'Premium White Wine Collection',
            description: 'Elegant white wines showcasing terroir and craftsmanship.',
            image: 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: 'From €45',
            bottles: whiteCount,
            years: '2019-2022',
            link: '/products?category=White%20Wine',
          },
          {
            id: 'gift-sets',
            title: 'Luxury Gift Sets',
            description: 'Beautifully curated gift sets perfect for special occasions.',
            image: 'https://images.unsplash.com/photo-1474722883778-792e7990302f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
            price: 'From €200',
            bottles: giftCount,
            years: '2018-2023',
            link: '/products?category=Gift%20Set',
          },
        ];

        console.log('Collections data created:', collectionsData);
        setCollections(collectionsData);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setError('Failed to load collections');
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-burgundy mx-auto"></div>
              <p className="mt-4 text-charcoal">Loading collections...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <main className="pt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button 
                onClick={resetAndRetry} 
                className="mt-4 px-4 py-2 bg-burgundy text-ivory rounded hover:bg-burgundy/80"
              >
                Reset & Retry
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-ivory">
        <Header />

        <main className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />

          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 text-charcoal-black">
              Curated Collections
            </h1>
            <p className="text-muted-olive text-xl max-w-4xl mx-auto">
              Discover our expertly curated wine collections, each thoughtfully assembled to showcase
              the finest expressions of their respective regions and styles. Perfect for collectors,
              connoisseurs, and those seeking the ultimate wine experience.
            </p>
          </div>

          {/* Collections Content */}
          <ErrorBoundary>
            <CollectionsClient collections={collections} />
          </ErrorBoundary>
        </main>

        <Footer />
      </div>
    </ErrorBoundary>
  );
}