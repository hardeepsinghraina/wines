'use client'

import { Button } from "@/components/ui/Button";

export function HomeClient() {
  return (
    <>
      {/* Hero Section Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center">
        <Button 
          size="lg" 
          className="bg-champagne-gold text-charcoal-black hover:bg-champagne-gold/90 font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          onClick={() => window.location.href = '/products'}
        >
          Explore Collection
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="border-2 border-white text-white hover:bg-white hover:text-charcoal-black font-semibold px-8 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          onClick={() => window.location.href = '/nft'}
        >
          Wine NFTs
        </Button>
      </div>
    </>
  );
}

export function ViewAllWinesButton() {
  return (
    <Button 
      size="lg" 
      className="bg-burgundy text-white hover:bg-burgundy/90 font-semibold px-12 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
      onClick={() => window.location.href = '/products'}
    >
      View All Wines
      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </Button>
  );
}

export function CTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-6 justify-center">
      <Button 
        size="lg" 
        className="bg-white text-charcoal-black hover:bg-white/90 font-semibold px-10 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
        onClick={() => window.location.href = '/register'}
      >
        Start Your Collection
        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Button>
      <Button 
        variant="outline" 
        size="lg" 
        className="border-2 border-white text-white hover:bg-white hover:text-charcoal-black font-semibold px-10 py-4 text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
        onClick={() => window.location.href = '/private-sales'}
      >
        Private Sales
        <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </Button>
    </div>
  );
}