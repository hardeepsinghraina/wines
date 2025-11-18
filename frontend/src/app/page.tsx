import { Suspense } from "react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/product";
import { SearchBar } from "@/components/product/SearchBar";
import { Loading } from "@/components/ui/Loading";
import { HomeClient, ViewAllWinesButton, CTAButtons } from "@/components/home/HomeClient";
// import { ChatbotWidget } from "@/components/chatbot";

export const metadata: Metadata = {
  title: 'Luxury Wine Collection | Premium Wines with Crypto Payments',
  description: 'Discover premium wines from the world\'s finest vineyards. Pay with cryptocurrency or traditional methods. Global delivery available.',
  keywords: 'luxury wine, premium wine, cryptocurrency payments, bitcoin wine, ethereum wine, wine collection',
  openGraph: {
    title: 'Luxury Wine Collection | Premium Wines with Crypto Payments',
    description: 'Discover premium wines from the world\'s finest vineyards. Pay with cryptocurrency or traditional methods.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      
      {/* Hero Section with Background Image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury wine cellar"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="font-heading text-6xl md:text-8xl font-bold mb-6 drop-shadow-2xl">
            Exquisite Wines
          </h1>
          <p className="font-accent text-2xl md:text-3xl mb-4 max-w-3xl mx-auto drop-shadow-lg">
            Where Tradition Meets Innovation
          </p>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto opacity-90">
            Discover the world&apos;s finest wines with secure cryptocurrency payments and global VIP delivery
          </p>
          <HomeClient />
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="animate-bounce">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Wine Categories Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl mb-6 text-charcoal-black">
              Curated Collections
            </h2>
            <p className="text-muted-olive text-xl max-w-3xl mx-auto">
              From legendary vintages to emerging terroirs, explore our handpicked selections
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Red Wines */}
            <div className="group relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="aspect-[4/5] relative">
                <Image
                  src="https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Premium red wines"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="font-heading text-3xl mb-3">Red Wines</h3>
                <p className="text-lg opacity-90 mb-4">Bold, complex, and unforgettable</p>
                <Link href="/products?search=Red">
                  <button className="bg-burgundy hover:bg-burgundy/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Explore Reds
                  </button>
                </Link>
              </div>
            </div>

            {/* White Wines */}
            <div className="group relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="aspect-[4/5] relative">
                <Image
                  src="https://images.unsplash.com/photo-1551538827-9c037cb4f32a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Premium white wines"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="font-heading text-3xl mb-3">White Wines</h3>
                <p className="text-lg opacity-90 mb-4">Crisp, elegant, and refined</p>
                <Link href="/products?search=White">
                  <button className="bg-champagne-gold hover:bg-champagne-gold/90 text-charcoal-black px-6 py-3 rounded-lg font-semibold transition-colors">
                    Explore Whites
                  </button>
                </Link>
              </div>
            </div>

            {/* Champagne */}
            <div className="group relative overflow-hidden rounded-2xl shadow-2xl">
              <div className="aspect-[4/5] relative">
                <Image
                  src="https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Premium champagne"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="font-heading text-3xl mb-3">Champagne</h3>
                <p className="text-lg opacity-90 mb-4">Celebrate life&apos;s finest moments</p>
                <Link href="/products?search=Champagne">
                  <button className="bg-sapphire-blue hover:bg-sapphire-blue/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                    Explore Champagne
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-ivory to-white p-8 rounded-2xl shadow-xl">
            <h3 className="font-heading text-3xl text-center mb-6 text-charcoal-black">
              Find Your Perfect Wine
            </h3>
            <Suspense fallback={<Loading />}>
              <SearchBar />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-b from-ivory to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl mb-6 text-charcoal-black">
              Featured Selections
            </h2>
            <p className="text-muted-olive text-xl max-w-3xl mx-auto">
              Handpicked by our master sommeliers from the world&apos;s most prestigious vineyards
            </p>
          </div>
          
          <Suspense fallback={<Loading />}>
            <ProductGrid limit={8} />
          </Suspense>
          
          <div className="text-center mt-16">
            <ViewAllWinesButton />
          </div>
        </div>
      </section>

      {/* Crypto Payment Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Cryptocurrency and luxury"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-charcoal-black/85"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="text-white">
              <h2 className="font-heading text-5xl mb-8">
                The Future of Wine Commerce
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Experience seamless transactions with cryptocurrency payments. 
                Bitcoin, Ethereum, and more - your digital assets, our premium wines.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-champagne-gold rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-charcoal-black">₿</span>
                  </div>
                  <span className="text-lg">Bitcoin</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-champagne-gold rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-charcoal-black">Ξ</span>
                  </div>
                  <span className="text-lg">Ethereum</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-champagne-gold rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-charcoal-black">◎</span>
                  </div>
                  <span className="text-lg">Solana</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-champagne-gold rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-charcoal-black">$</span>
                  </div>
                  <span className="text-lg">USDC</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <h3 className="font-heading text-2xl text-white mb-6">Why Choose Crypto?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-champagne-gold rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-charcoal-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h4 className="font-semibold mb-1">Instant Transactions</h4>
                      <p className="text-sm opacity-80">No waiting for bank transfers or clearances</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-champagne-gold rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-charcoal-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h4 className="font-semibold mb-1">Global Access</h4>
                      <p className="text-sm opacity-80">Purchase from anywhere in the world</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-champagne-gold rounded-full flex items-center justify-center mt-1">
                      <svg className="w-4 h-4 text-charcoal-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-white">
                      <h4 className="font-semibold mb-1">Enhanced Security</h4>
                      <p className="text-sm opacity-80">Blockchain-secured transactions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Luxury Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-heading text-5xl mb-6 text-charcoal-black">
              Unparalleled Service
            </h2>
            <p className="text-muted-olive text-xl max-w-3xl mx-auto">
              Every detail crafted for the discerning wine connoisseur
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
                  <Image
                    src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="VIP delivery service"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h3 className="font-heading text-2xl mb-4 text-charcoal-black">VIP Delivery</h3>
              <p className="text-muted-olive text-lg mb-6">
                White-glove delivery service with temperature-controlled shipping and full insurance coverage worldwide.
              </p>
              <div className="flex justify-center space-x-4 text-sm text-muted-olive">
                <span>• Climate Controlled</span>
                <span>• Fully Insured</span>
                <span>• Global Reach</span>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
                  <Image
                    src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Wine NFTs and blockchain"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h3 className="font-heading text-2xl mb-4 text-charcoal-black">Wine NFTs</h3>
              <p className="text-muted-olive text-lg mb-6">
                Digital certificates of authenticity and ownership, creating a new dimension of wine collecting and trading.
              </p>
              <div className="flex justify-center space-x-4 text-sm text-muted-olive">
                <span>• Blockchain Verified</span>
                <span>• Tradeable</span>
                <span>• Collectible</span>
              </div>
            </div>
            
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-2xl group-hover:shadow-3xl transition-shadow duration-300">
                  <Image
                    src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                    alt="Exclusive wine access"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
              <h3 className="font-heading text-2xl mb-4 text-charcoal-black">Exclusive Access</h3>
              <p className="text-muted-olive text-lg mb-6">
                Private sales, limited releases, and direct access to prestigious wineries and rare vintage collections.
              </p>
              <div className="flex justify-center space-x-4 text-sm text-muted-olive">
                <span>• Private Sales</span>
                <span>• Limited Editions</span>
                <span>• Rare Vintages</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1474722883778-792e7990302f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Luxury wine tasting"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-burgundy/90 to-charcoal-black/90"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h2 className="font-heading text-6xl mb-8">
            Begin Your Journey
          </h2>
          <p className="text-2xl mb-12 max-w-3xl mx-auto opacity-90">
            Join the world&apos;s most exclusive wine community where tradition meets innovation, 
            and every bottle tells a story worth sharing.
          </p>
          <CTAButtons />
        </div>
      </section>

      <Footer />
      
      {/* Chatbot Widget */}
      {/* <ChatbotWidget /> */}
    </div>
  );
}
