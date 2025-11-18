'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ProductImage } from '@/components/ui/PlaceholderImage'

interface Category {
  id: string
  name: string
  description: string
  image: string
  wineCount: number
  regions: string[]
  featured?: boolean
}

interface CategoryCardProps {
  category: Category
  featured?: boolean
}

export function CategoryCard({ category, featured = false }: CategoryCardProps) {
  const handleClick = () => {
    // Map category IDs to product search/filter parameters
    const categoryMap: Record<string, string> = {
      'bordeaux': '/products?search=Bordeaux',
      'burgundy': '/products?search=Burgundy',
      'champagne': '/products?category=Champagne',
      'rhone': '/products?search=Rhône',
      'tuscany': '/products?search=Tuscany',
      'napa-valley': '/products?search=Napa',
      'world-wines': '/products',
      'specialty-collections': '/collections'
    };
    
    const url = categoryMap[category.id] || '/products';
    window.location.href = url;
  }

  if (featured) {
    return (
      <Card 
        className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
        onClick={handleClick}
      >
        <div className="aspect-[4/3] relative overflow-hidden">
          <ProductImage
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                <p className="text-sm opacity-90 mb-3">{category.description}</p>
                <div className="text-xs opacity-75">
                  {category.regions.join(' • ')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{category.wineCount}</div>
                <div className="text-xs opacity-75">wines</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card 
      className="group overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="md:flex">
        <div className="md:w-1/3 aspect-square md:aspect-auto relative overflow-hidden">
          <ProductImage
            src={category.image}
            alt={category.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="md:w-2/3 p-6">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-charcoal-black">{category.name}</h3>
            <span className="text-sm text-muted-olive">{category.wineCount} wines</span>
          </div>
          <p className="text-muted-olive mb-4">{category.description}</p>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-olive">
              {category.regions.join(', ')}
            </div>
            <Button variant="outline" size="sm" className="group-hover:bg-burgundy group-hover:text-white transition-colors">
              Explore
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}