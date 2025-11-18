import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/product";
import { ProductFilters } from "@/components/product/ProductFilters";
import { SearchBar } from "@/components/product/SearchBar";
import { Loading } from "@/components/ui/Loading";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    region?: string;
    vintage?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      
      {/* Page Header */}
      <section className="bg-gradient-to-r from-burgundy to-charcoal-black text-ivory py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-center mb-6">
            Wine Collection
          </h1>
          <p className="font-accent text-lg text-center max-w-2xl mx-auto">
            Explore our curated selection of premium wines from around the world
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto mb-8">
            <Suspense fallback={<Loading />}>
              <SearchBar initialValue={params.search} />
            </Suspense>
          </div>
          
          <Suspense fallback={<Loading />}>
            <ProductFilters searchParams={params} />
          </Suspense>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={<Loading />}>
            <ProductGrid 
              searchParams={params}
              showPagination={true}
            />
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export const metadata = {
  title: "Premium Wine Collection | Luxury Wine Store",
  description: "Browse our extensive collection of premium wines from Bordeaux, Burgundy, Champagne, and world-renowned regions. Secure cryptocurrency payments accepted.",
};