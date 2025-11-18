import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loading } from "@/components/ui/Loading";
import { Button } from "@/components/ui/Button";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface CollectionPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Mock collection data - in a real app, this would come from an API
const getCollection = (id: string) => {
  const collections = {
    'vintage-bordeaux': {
      id: 'vintage-bordeaux',
      title: 'Vintage Bordeaux Collection',
      description: 'A carefully selected collection of exceptional Bordeaux wines from legendary vintages. Each bottle represents the pinnacle of winemaking excellence from the world\'s most prestigious wine region.',
      longDescription: 'This exclusive collection brings together the finest Bordeaux wines from exceptional vintages, carefully selected by our master sommeliers. From the Left Bank\'s powerful Cabernet Sauvignon blends to the Right Bank\'s elegant Merlot-based wines, each bottle tells a story of terroir, tradition, and uncompromising quality.',
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      price: '€2,500',
      originalPrice: '€3,200',
      bottles: 12,
      years: '2010-2016',
      wineIds: ['1'], // Château Margaux 2015 as representative wine
      regions: ['Pauillac', 'Saint-Julien', 'Margaux', 'Saint-Émilion'],
      highlights: [
        'Château Margaux 2010 - 95 Parker Points',
        'Château Pichon Baron 2012 - 94 Parker Points',
        'Château Angelus 2014 - 96 Parker Points',
        'Château Cos d\'Estournel 2016 - 97 Parker Points'
      ],
      features: [
        'Professionally stored in temperature-controlled cellars',
        'Authenticated provenance and certificates',
        'Luxury wooden presentation case included',
        'Detailed tasting notes and vintage information',
        'Free white-glove delivery and insurance'
      ]
    },
    'champagne-prestige': {
      id: 'champagne-prestige',
      title: 'Champagne Prestige Collection',
      description: 'Premium champagnes from the most prestigious houses in the Champagne region.',
      longDescription: 'Celebrate life\'s finest moments with this exceptional collection of prestige cuvées from Champagne\'s most revered houses. Each bottle represents decades of expertise and the finest terroir expressions.',
      image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      price: '€1,800',
      originalPrice: '€2,200',
      bottles: 6,
      years: '2012-2018',
      wineIds: ['2'], // Dom Pérignon Vintage 2012 as representative wine
      regions: ['Reims', 'Épernay', 'Aÿ'],
      highlights: [
        'Dom Pérignon 2012 - Vintage Excellence',
        'Krug Grande Cuvée - Multi-vintage Blend',
        'Louis Roederer Cristal 2014 - Crystal Clear Perfection',
        'Pol Roger Winston Churchill - Historic Legacy'
      ],
      features: [
        'Temperature-controlled storage and shipping',
        'Elegant gift presentation boxes',
        'Champagne serving and storage guide',
        'Exclusive access to future releases',
        'Complimentary champagne flutes set'
      ]
    },
    'connoisseurs-choice': {
      id: 'connoisseurs-choice',
      title: 'The Connoisseur\'s Choice',
      description: 'Our most exclusive collection featuring rare vintages and legendary producers.',
      longDescription: 'The ultimate collection for the discerning wine enthusiast. This carefully curated selection represents the pinnacle of winemaking artistry from around the world.',
      image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      price: '€4,500',
      originalPrice: '€5,800',
      bottles: 24,
      years: '2015-2019',
      wineIds: ['1', '4', '8'], // Château Margaux, Opus One, Amarone
      regions: ['Bordeaux', 'Napa Valley', 'Veneto', 'Piedmont'],
      highlights: [
        'Château Margaux 2015 - Legendary Bordeaux',
        'Opus One 2019 - Napa Valley Excellence',
        'Amarone della Valpolicella 2017 - Italian Masterpiece',
        'Barolo Brunate 2018 - Piedmont Perfection'
      ],
      features: [
        'Handpicked by master sommeliers',
        'Limited to 50 sets worldwide',
        'Luxury wooden presentation case',
        'Detailed provenance certificates',
        'VIP delivery and insurance included'
      ]
    }
  };

  return collections[id as keyof typeof collections] || null;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { id } = await params;
  const collection = getCollection(id);
  
  if (!collection) {
    return {
      title: 'Collection Not Found',
    };
  }

  return {
    title: `${collection.title} | Wine Collections`,
    description: collection.description,
    keywords: `wine collection, ${collection.title.toLowerCase()}, luxury wines, premium wine set`,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  try {
    const { id } = await params;
    
    if (!id || typeof id !== 'string') {
      notFound();
    }

    const collection = getCollection(id);

    if (!collection) {
      notFound();
    }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
    { label: collection.title, href: `/collections/${collection.id}` },
  ];

    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-ivory">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={collection.image}
              alt={collection.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="flex flex-col justify-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 text-charcoal-black">
              {collection.title}
            </h1>
            
            <p className="text-muted-olive text-lg mb-6 leading-relaxed">
              {collection.longDescription}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-burgundy">{collection.bottles}</div>
                <div className="text-sm text-muted-olive">Bottles</div>
              </div>
              <div className="bg-white rounded-lg p-4 text-center shadow-md">
                <div className="text-2xl font-bold text-burgundy">{collection.years}</div>
                <div className="text-sm text-muted-olive">Vintages</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="text-3xl font-bold text-burgundy">{collection.price}</div>
              {collection.originalPrice && (
                <div className="text-xl text-muted-olive line-through">{collection.originalPrice}</div>
              )}
              <div className="bg-champagne-gold text-charcoal-black px-3 py-1 rounded-full text-sm font-semibold">
                Save {Math.round((1 - parseFloat(collection.price.slice(1)) / parseFloat(collection.originalPrice?.slice(1) || '0')) * 100)}%
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {collection.wineIds && collection.wineIds.length > 0 ? (
                <AddToCartButton
                  wineId={collection.wineIds[0]} // Add the first wine as representative
                  size="lg"
                  className="flex-1 bg-burgundy text-white hover:bg-burgundy/90"
                >
                  Add to Cart
                </AddToCartButton>
              ) : (
                <Button 
                  size="lg" 
                  className="flex-1 bg-burgundy text-white hover:bg-burgundy/90"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact for Availability
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg" 
                className="border-champagne-gold text-champagne-gold hover:bg-champagne-gold hover:text-charcoal-black"
              >
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>

        {/* Collection Highlights */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="font-heading text-3xl font-bold mb-6 text-charcoal-black">
              Collection Highlights
            </h2>
            <div className="space-y-4">
              {collection.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-champagne-gold rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <svg className="w-4 h-4 text-charcoal-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-charcoal-black">{highlight}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="font-heading text-3xl font-bold mb-6 text-charcoal-black">
              What's Included
            </h2>
            <div className="space-y-4">
              {collection.features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-sapphire-blue rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-charcoal-black">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Regions */}
        <div className="mb-16">
          <h2 className="font-heading text-3xl font-bold mb-6 text-charcoal-black text-center">
            Featured Regions
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {collection.regions.map((region, index) => (
              <div key={index} className="bg-white rounded-full px-6 py-3 shadow-md">
                <span className="text-charcoal-black font-medium">{region}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Related Collections */}
        <div className="mb-16">
          <h2 className="font-heading text-3xl font-bold mb-8 text-charcoal-black text-center">
            You Might Also Like
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Suspense fallback={
              <div className="col-span-3 flex justify-center">
                <Loading />
              </div>
            }>
              <ErrorBoundary>
                {/* Mock related products - in real app, fetch from API */}
                <div className="col-span-3 text-center text-muted-olive bg-white rounded-lg p-8 shadow-md">
                  <p>Related collections will be displayed here</p>
                  <p className="text-sm mt-2">Check back soon for personalized recommendations</p>
                </div>
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-burgundy to-sapphire-blue rounded-2xl p-12 text-white">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Ready to Add This Collection?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Secure your {collection.title} today. Limited quantities available with 
            worldwide VIP delivery and full insurance coverage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {collection.wineIds && collection.wineIds.length > 0 ? (
              <AddToCartButton
                wineId={collection.wineIds[0]}
                size="lg"
                className="bg-champagne-gold text-charcoal-black hover:bg-champagne-gold/90"
              >
                Add to Cart - {collection.price}
              </AddToCartButton>
            ) : (
              <Button 
                size="lg" 
                className="bg-champagne-gold text-charcoal-black hover:bg-champagne-gold/90"
                onClick={() => window.location.href = '/contact'}
              >
                Contact for Availability - {collection.price}
              </Button>
            )}
            <Button 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-charcoal-black"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Wine Expert
            </Button>
          </div>
        </div>
      </main>

          <Footer />
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Collection page error:', error);
    notFound();
  }
}