import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductGrid } from "@/components/product";
import { Loading } from "@/components/ui/Loading";
import { productApi } from "@/lib/api";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProduct(id: string): Promise<any> {
  try {
    const product = await productApi.getById(id);
    return product;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      
      {/* Product Detail */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Suspense fallback={<Loading />}>
            <ProductDetail productId={id} />
          </Suspense>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl mb-8 text-charcoal-black text-center">
            You May Also Like
          </h2>
          
          <Suspense fallback={<Loading />}>
            <ProductGrid 
              limit={4}
              excludeId={id}
            />
          </Suspense>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product?.name || 'Product'} - ${product?.producer || 'Wine'} | Luxury Wine Store`,
    description: `${product?.description || 'Premium wine'} from ${product?.region || 'our collection'}. Secure cryptocurrency payments accepted.`,
  };
}