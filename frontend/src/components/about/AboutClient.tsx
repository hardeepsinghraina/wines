'use client'

import { Button } from "@/components/ui/Button";

export function ExploreCollectionButton() {
  return (
    <Button 
      size="lg"
      onClick={() => window.location.href = '/products'}
    >
      Explore Our Collection
    </Button>
  );
}

export function AboutCTAButtons() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button 
        size="lg"
        onClick={() => window.location.href = '/auth/register'}
      >
        Create Account
      </Button>
      <Button 
        variant="outline" 
        size="lg"
        onClick={() => window.location.href = '/contact'}
      >
        Contact Us
      </Button>
    </div>
  );
}