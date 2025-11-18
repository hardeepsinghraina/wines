'use client'

import React, { useState } from 'react'
import { 
  BookOpen, 
  MapPin, 
  Calendar, 
  Users, 
  Award, 
  Leaf, 
  Sun, 
  Droplets,
  Mountain,
  Clock,
  Crown,
  Heart,
  Star,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { Wine } from '@/types/wine'

interface LuxuryBrandStorytellingProps {
  wine: Wine
  className?: string
}

interface StorySection {
  id: string
  title: string
  icon: React.ComponentType<any>
  content: string
  image?: string
  timeline?: string
}

interface TimelineEvent {
  year: number
  title: string
  description: string
  icon: React.ComponentType<any>
}

export function LuxuryBrandStorytelling({
  wine,
  className = ''
}: LuxuryBrandStorytellingProps) {
  const [activeSection, setActiveSection] = useState<string>('heritage')
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isVideoMuted, setIsVideoMuted] = useState(true)

  // Generate story sections based on wine data
  const generateStorySections = (wine: Wine): StorySection[] => {
    return [
      {
        id: 'heritage',
        title: 'Heritage & Legacy',
        icon: Crown,
        content: generateHeritageStory(wine)
      },
      {
        id: 'terroir',
        title: 'Terroir & Vineyard',
        icon: Mountain,
        content: generateTerroirStory(wine)
      },
      {
        id: 'winemaking',
        title: 'Winemaking Philosophy',
        icon: Leaf,
        content: generateWinemakingStory(wine)
      },
      {
        id: 'vintage',
        title: `The ${wine.vintage} Vintage`,
        icon: Sun,
        content: generateVintageStory(wine),
        timeline: wine.vintage.toString()
      },
      {
        id: 'awards',
        title: 'Recognition & Awards',
        icon: Award,
        content: generateAwardsStory(wine)
      },
      {
        id: 'legacy',
        title: 'Continuing Legacy',
        icon: Heart,
        content: generateLegacyStory(wine)
      }
    ]
  }

  const generateTimelineEvents = (wine: Wine): TimelineEvent[] => {
    const currentYear = new Date().getFullYear()
    const wineAge = currentYear - wine.vintage
    
    return [
      {
        year: wine.vintage - 1,
        title: 'Vineyard Preparation',
        description: 'Careful vineyard management and soil preparation for the upcoming harvest season.',
        icon: Leaf
      },
      {
        year: wine.vintage,
        title: 'Harvest & Vinification',
        description: `The ${wine.vintage} harvest brought exceptional fruit quality, carefully selected and vinified.`,
        icon: Sun
      },
      {
        year: wine.vintage + 1,
        title: 'Aging & Maturation',
        description: 'The wine begins its aging process, developing complexity and character.',
        icon: Clock
      },
      {
        year: wine.vintage + 2,
        title: 'Blending & Refinement',
        description: 'Master blending creates the perfect harmony of flavors and aromas.',
        icon: Droplets
      },
      {
        year: wine.vintage + 3,
        title: 'Bottling & Release',
        description: 'The wine is carefully bottled and prepared for release to discerning collectors.',
        icon: Crown
      },
      {
        year: currentYear,
        title: 'Peak Enjoyment',
        description: 'Now at its optimal drinking window, showcasing the full expression of the vintage.',
        icon: Star
      }
    ]
  }

  const generateHeritageStory = (wine: Wine): string => {
    const producer = wine.producer || 'This prestigious estate'
    const region = wine.region || 'this renowned region'
    
    return `${producer} represents generations of winemaking excellence in ${region}. Founded on principles of quality and tradition, the estate has been crafting exceptional wines that reflect the unique character of their terroir. Each bottle carries forward a legacy of passion, dedication, and unwavering commitment to excellence that has been passed down through generations of master winemakers.`
  }

  const generateTerroirStory = (wine: Wine): string => {
    const region = wine.region || 'this exceptional terroir'
    
    return `The vineyards of ${region} benefit from a unique combination of climate, soil, and topography that creates the perfect conditions for producing world-class wines. The terroir imparts distinctive characteristics that can be tasted in every glass - from the mineral complexity derived from ancient soils to the elegant structure influenced by the local microclimate. This wine is a pure expression of place, capturing the essence of the land in liquid form.`
  }

  const generateWinemakingStory = (wine: Wine): string => {
    return `Our winemaking philosophy combines time-honored traditions with modern precision. Every decision, from harvest timing to fermentation techniques, is made with meticulous attention to detail. The grapes are hand-selected at optimal ripeness, ensuring only the finest fruit makes it into the final blend. Traditional methods are employed where they enhance quality, while modern technology is used to preserve the wine's natural character and complexity.`
  }

  const generateVintageStory = (wine: Wine): string => {
    const vintage = wine.vintage
    const age = new Date().getFullYear() - vintage
    
    return `The ${vintage} vintage was marked by exceptional growing conditions that produced fruit of remarkable quality and concentration. ${age > 10 ? 'This mature vintage has developed beautiful tertiary aromas and flavors, showcasing the wine\'s aging potential.' : age > 5 ? 'This wine is entering its prime drinking window, displaying perfect balance and integration.' : 'This young vintage shows tremendous potential and will continue to evolve beautifully over the coming years.'} The ${vintage} harvest will be remembered as one of the great vintages of the decade.`
  }

  const generateAwardsStory = (wine: Wine): string => {
    return `This exceptional wine has garnered recognition from critics and connoisseurs worldwide. Its quality and craftsmanship have been acknowledged by prestigious wine competitions and respected publications. These accolades reflect not just the excellence of this particular vintage, but the consistent quality and reputation that the estate has built over decades of dedicated winemaking.`
  }

  const generateLegacyStory = (wine: Wine): string => {
    return `As you enjoy this wine, you become part of its continuing story. Each bottle represents not just a moment in time, but a connection to the land, the people, and the traditions that created it. This wine will continue to evolve, creating new memories and experiences for those who appreciate the artistry of fine winemaking. It stands as a testament to the enduring power of quality, tradition, and the pursuit of excellence.`
  }

  const storySections = generateStorySections(wine)
  const timelineEvents = generateTimelineEvents(wine)
  const activeStorySection = storySections.find(section => section.id === activeSection)

  return (
    <div className={`luxury-brand-storytelling ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-charcoal-black mb-2 flex items-center justify-center gap-2">
          <BookOpen className="w-8 h-8 text-burgundy" />
          The Story Behind {wine.name}
        </h2>
        <p className="text-muted-olive text-lg">
          Discover the heritage, craftsmanship, and passion that created this exceptional wine
        </p>
      </div>

      {/* Story Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {storySections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 ${
              activeSection === section.id 
                ? 'bg-burgundy hover:bg-burgundy/90' 
                : 'border-burgundy text-burgundy hover:bg-burgundy hover:text-white'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.title}
          </Button>
        ))}
      </div>

      {/* Active Story Section */}
      {activeStorySection && (
        <Card className="mb-8 overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Story Image */}
            <div className="aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-gray-100 to-gray-200 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <activeStorySection.icon className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-sm font-medium">{activeStorySection.title}</p>
                  <p className="text-xs text-gray-400 mt-2">Visual storytelling experience</p>
                </div>
              </div>
              
              {/* Video Overlay for Heritage Section */}
              {activeSection === 'heritage' && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="bg-white/90 hover:bg-white text-charcoal-black rounded-full p-4"
                  >
                    {isVideoPlaying ? (
                      <Pause className="w-8 h-8" />
                    ) : (
                      <Play className="w-8 h-8" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Story Content */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-burgundy/10 rounded-lg flex items-center justify-center">
                  <activeStorySection.icon className="w-6 h-6 text-burgundy" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-charcoal-black">
                    {activeStorySection.title}
                  </h3>
                  {activeStorySection.timeline && (
                    <p className="text-muted-olive">
                      {activeStorySection.timeline}
                    </p>
                  )}
                </div>
              </div>
              
              <p className="text-muted-olive leading-relaxed text-lg mb-6">
                {activeStorySection.content}
              </p>

              {/* Additional Details for Specific Sections */}
              {activeSection === 'terroir' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-burgundy" />
                    <span className="text-sm text-charcoal-black font-medium">
                      {wine.region}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-burgundy" />
                    <span className="text-sm text-charcoal-black font-medium">
                      Premium Terroir
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-burgundy" />
                    <span className="text-sm text-charcoal-black font-medium">
                      Optimal Climate
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-burgundy" />
                    <span className="text-sm text-charcoal-black font-medium">
                      Perfect Drainage
                    </span>
                  </div>
                </div>
              )}

              {activeSection === 'vintage' && (
                <div className="bg-gradient-to-r from-burgundy/5 to-burgundy/10 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-charcoal-black mb-2">
                    {wine.vintage} Vintage Highlights
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-olive">
                    <li>• Exceptional growing season with optimal weather conditions</li>
                    <li>• Hand-harvested at peak ripeness for maximum flavor concentration</li>
                    <li>• Limited production ensuring exclusivity and quality</li>
                    <li>• Aged to perfection using traditional methods</li>
                  </ul>
                </div>
              )}

              <Button
                variant="outline"
                className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
              >
                Learn More About Our Heritage
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-burgundy" />
            Wine Journey Timeline
          </CardTitle>
          <p className="text-sm text-muted-olive">
            From vineyard to your glass - the story of {wine.name}
          </p>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-burgundy via-burgundy/50 to-burgundy/20"></div>
            
            {/* Timeline Events */}
            <div className="space-y-8">
              {timelineEvents.map((event, index) => (
                <div key={event.year} className="relative flex items-start gap-4">
                  {/* Timeline Dot */}
                  <div className="w-12 h-12 bg-burgundy rounded-full flex items-center justify-center text-white font-bold text-sm z-10">
                    <event.icon className="w-5 h-5" />
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-burgundy">
                        {event.year}
                      </span>
                      <span className="text-sm text-muted-olive">
                        {event.year === new Date().getFullYear() ? '(Current)' : 
                         event.year > new Date().getFullYear() ? '(Future)' : 
                         `(${new Date().getFullYear() - event.year} years ago)`}
                      </span>
                    </div>
                    <h4 className="font-semibold text-charcoal-black mb-2">
                      {event.title}
                    </h4>
                    <p className="text-muted-olive text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Producer Spotlight */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-burgundy" />
            Meet the Winemaker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Winemaker Image */}
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Winemaker Portrait</p>
              </div>
            </div>
            
            {/* Winemaker Info */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-charcoal-black mb-2">
                {wine.producer || 'Master Winemaker'}
              </h3>
              <p className="text-muted-olive mb-4">
                With decades of experience and an unwavering commitment to excellence, our master winemaker brings together traditional techniques and modern innovation to create wines of exceptional quality and character.
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-charcoal-black">Experience:</span>
                  <p className="text-muted-olive">25+ Years</p>
                </div>
                <div>
                  <span className="font-medium text-charcoal-black">Philosophy:</span>
                  <p className="text-muted-olive">Terroir Expression</p>
                </div>
                <div>
                  <span className="font-medium text-charcoal-black">Specialty:</span>
                  <p className="text-muted-olive">Premium Wines</p>
                </div>
                <div>
                  <span className="font-medium text-charcoal-black">Awards:</span>
                  <p className="text-muted-olive">International Recognition</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}