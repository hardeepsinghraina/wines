import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/product";
import { ProductFilters } from "@/components/product/ProductFilters";
import { SearchBar } from "@/components/product/SearchBar";
import { Loading } from "@/components/ui/Loading";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<{
    region?: string;
    vintage?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  }>;
}

// Valid wine categories
const VALID_CATEGORIES = [
  'bordeaux',
  'burgundy', 
  'champagne',
  'rhone',
  'loire',
  'alsace',
  'languedoc',
  'provence',
  'tuscany',
  'piedmont',
  'veneto',
  'rioja',
  'ribera-del-duero',
  'napa-valley',
  'sonoma',
  'oregon',
  'washington',
  'australia',
  'new-zealand',
  'chile',
  'argentina',
  'south-africa'
];

const CATEGORY_INFO: Record<string, { name: string; description: string; region?: string }> = {
  'bordeaux': {
    name: 'Bordeaux',
    description: 'Prestigious wines from the world-renowned Bordeaux region, featuring exceptional Cabernet Sauvignon and Merlot blends.',
    region: 'France'
  },
  'burgundy': {
    name: 'Burgundy',
    description: 'Elegant Pinot Noir and Chardonnay from the historic Burgundy region, known for terroir-driven excellence.',
    region: 'France'
  },
  'champagne': {
    name: 'Champagne',
    description: 'Authentic Champagne from the Champagne region of France, the pinnacle of sparkling wine craftsmanship.',
    region: 'France'
  },
  'rhone': {
    name: 'Rhône Valley',
    description: 'Bold and expressive wines from the Rhône Valley, featuring Syrah, Grenache, and distinctive blends.',
    region: 'France'
  },
  'loire': {
    name: 'Loire Valley',
    description: 'Diverse wines from the Loire Valley, from crisp Sancerre to elegant Chinon and sweet Coteaux du Layon.',
    region: 'France'
  },
  'alsace': {
    name: 'Alsace',
    description: 'Aromatic white wines from Alsace, featuring Riesling, Gewürztraminer, and Pinot Gris.',
    region: 'France'
  },
  'languedoc': {
    name: 'Languedoc',
    description: 'Modern and traditional wines from Southern France, offering exceptional value and quality.',
    region: 'France'
  },
  'provence': {
    name: 'Provence',
    description: 'World-class rosé wines and elegant reds from the sun-soaked Provence region.',
    region: 'France'
  },
  'tuscany': {
    name: 'Tuscany',
    description: 'Iconic Italian wines including Chianti Classico, Brunello di Montalcino, and Super Tuscans.',
    region: 'Italy'
  },
  'piedmont': {
    name: 'Piedmont',
    description: 'Noble wines from Piedmont, home to Barolo, Barbaresco, and exceptional white truffles.',
    region: 'Italy'
  },
  'veneto': {
    name: 'Veneto',
    description: 'Diverse wines from Veneto, including Amarone, Prosecco, and Soave.',
    region: 'Italy'
  },
  'rioja': {
    name: 'Rioja',
    description: 'Traditional Spanish wines with modern flair, featuring Tempranillo-based blends.',
    region: 'Spain'
  },
  'ribera-del-duero': {
    name: 'Ribera del Duero',
    description: 'Powerful and elegant Spanish reds from the prestigious Ribera del Duero region.',
    region: 'Spain'
  },
  'napa-valley': {
    name: 'Napa Valley',
    description: 'World-class Cabernet Sauvignon and Chardonnay from California\'s most famous wine region.',
    region: 'USA'
  },
  'sonoma': {
    name: 'Sonoma',
    description: 'Diverse and exceptional wines from Sonoma County, featuring Pinot Noir, Chardonnay, and Zinfandel.',
    region: 'USA'
  },
  'oregon': {
    name: 'Oregon',
    description: 'Elegant Pinot Noir and crisp whites from the cool climate regions of Oregon.',
    region: 'USA'
  },
  'washington': {
    name: 'Washington State',
    description: 'Bold reds and crisp whites from Washington\'s diverse wine regions.',
    region: 'USA'
  },
  'australia': {
    name: 'Australia',
    description: 'Bold Shiraz, elegant Chardonnay, and diverse wines from across Australia\'s wine regions.',
    region: 'Australia'
  },
  'new-zealand': {
    name: 'New Zealand',
    description: 'Vibrant Sauvignon Blanc and elegant Pinot Noir from New Zealand\'s pristine wine regions.',
    region: 'New Zealand'
  },
  'chile': {
    name: 'Chile',
    description: 'Exceptional value wines from Chile\'s diverse terroirs, from the Andes to the Pacific.',
    region: 'Chile'
  },
  'argentina': {
    name: 'Argentina',
    description: 'Bold Malbec and high-altitude wines from Argentina\'s renowned wine regions.',
    region: 'Argentina'
  },
  'south-africa': {
    name: 'South Africa',
    description: 'Distinctive wines from South Africa, featuring Pinotage and exceptional Chenin Blanc.',
    region: 'South Africa'
  }
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { category } = await params;
  const searchParamsResolved = await searchParams;

  // Check if category is valid
  if (!VALID_CATEGORIES.includes(category)) {
    notFound();
  }

  const categoryInfo = CATEGORY_INFO[category];
  
  // Build search params with region filter (categories are actually regions)
  const categorySearchParams = {
    ...searchParamsResolved,
    region: categoryInfo.name // Use the full region name instead of slug
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: categoryInfo.name, href: `/categories/${category}` }
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      
      {/* Breadcrumb */}
      <section className="py-4 bg-white border-b">
        <div className="container mx-auto px-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </section>

      {/* Category Header */}
      <section className="bg-gradient-to-r from-burgundy to-charcoal-black text-ivory py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-center mb-6">
            {categoryInfo.name}
          </h1>
          {categoryInfo.region && (
            <p className="font-accent text-xl text-center mb-4 text-gold">
              {categoryInfo.region}
            </p>
          )}
          <p className="font-accent text-lg text-center max-w-3xl mx-auto">
            {categoryInfo.description}
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-8">
            <Suspense fallback={<Loading />}>
              <SearchBar initialValue={searchParamsResolved.search} />
            </Suspense>
          </div>
          
          <Suspense fallback={<Loading />}>
            <ProductFilters searchParams={categorySearchParams} />
          </Suspense>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={<Loading />}>
            <ProductGrid 
              searchParams={categorySearchParams}
              showPagination={true}
            />
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  
  if (!VALID_CATEGORIES.includes(category)) {
    return {
      title: "Category Not Found",
    };
  }

  const categoryInfo = CATEGORY_INFO[category];
  
  return {
    title: `${categoryInfo.name} Wines${categoryInfo.region ? ` from ${categoryInfo.region}` : ''} | Luxury Wine Store`,
    description: `${categoryInfo.description} Shop premium ${categoryInfo.name} wines with secure cryptocurrency payments.`,
    keywords: `${categoryInfo.name}, wine, ${categoryInfo.region || ''}, luxury, premium, cryptocurrency`,
  };
}

export async function generateStaticParams() {
  // Generate static params for all valid categories
  return VALID_CATEGORIES.map((category) => ({
    category,
  }));
}