import { Suspense } from "react";
import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/product";
import { ProductFilters } from "@/components/product/ProductFilters";
import { Loading } from "@/components/ui/Loading";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: 'World Wines | International Wine Collection',
  description: 'Discover exceptional wines from around the world. From Italian Barolos to Australian Shiraz, explore our international wine collection.',
  keywords: 'world wines, international wines, Italian wines, Australian wines, Spanish wines, German wines',
};

export default function WorldWinesPage() {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'World Wines', href: '/products/world-wines' },
  ];

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 text-charcoal-black">
            World Wines
          </h1>
          <p className="text-muted-olive text-xl max-w-3xl mx-auto">
            Embark on a global wine journey. From the rolling hills of Tuscany to the sun-drenched vineyards of Australia, 
            discover exceptional wines that showcase the unique terroir of their regions.
          </p>
        </div>

        {/* Wine Regions Showcase */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🇮🇹</span>
            </div>
            <h3 className="font-heading text-xl mb-2 text-charcoal-black">Italy</h3>
            <p className="text-muted-olive text-sm">Barolo, Chianti, Brunello</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🇦🇺</span>
            </div>
            <h3 className="font-heading text-xl mb-2 text-charcoal-black">Australia</h3>
            <p className="text-muted-olive text-sm">Shiraz, Cabernet, Chardonnay</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🇪🇸</span>
            </div>
            <h3 className="font-heading text-xl mb-2 text-charcoal-black">Spain</h3>
            <p className="text-muted-olive text-sm">Rioja, Ribera del Duero</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-burgundy rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">🇩🇪</span>
            </div>
            <h3 className="font-heading text-xl mb-2 text-charcoal-black">Germany</h3>
            <p className="text-muted-olive text-sm">Riesling, Pinot Noir</p>
          </div>
        </div>

        {/* Filters and Products */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
              <h3 className="font-heading text-xl mb-4 text-charcoal-black">Filter Wines</h3>
              <Suspense fallback={<Loading />}>
                <ProductFilters 
                  searchParams={{}}
                />
              </Suspense>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-2xl text-charcoal-black">
                International Wine Collection
              </h2>
              <div className="text-muted-olive">
                Showing all premium wines
              </div>
            </div>
            
            <Suspense fallback={<Loading />}>
              <ProductGrid 
                searchParams={{}}
                showPagination={true}
              />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}