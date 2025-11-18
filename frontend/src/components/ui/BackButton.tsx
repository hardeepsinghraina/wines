'use client'

import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  return (
    <button 
      onClick={() => window.history.back()} 
      className="w-full"
    >
      <Button variant="ghost" size="lg" className="w-full">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back
      </Button>
    </button>
  );
}