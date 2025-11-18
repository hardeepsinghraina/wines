'use client'

import { Button } from '@/components/ui/Button'

export function ContactExpertButton() {
  return (
    <Button 
      variant="outline" 
      size="lg" 
      className="bg-white text-burgundy hover:bg-gray-100"
      onClick={() => window.location.href = '/contact'}
    >
      Contact Wine Expert
    </Button>
  )
}