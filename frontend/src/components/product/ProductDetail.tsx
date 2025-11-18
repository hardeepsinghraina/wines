"use client";

import { useState, useEffect } from "react";

import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { Error } from "@/components/ui/Error";
import { WineImage } from "@/components/ui/PlaceholderImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { productApi } from "@/lib/api";
import type { Wine } from "@/types/wine";

interface ProductDetailProps {
  productId: string;
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const [product, setProduct] = useState<Wine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await productApi.getById(productId);
        setProduct(data as Wine);
      } catch (err: any) {
        setError(err?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!product) return <Error message="Product not found" />;

  // Helper functions
  const getUsdPrice = () => {
    const usdPrice = product.prices?.find(p => p.currency === 'USD');
    return usdPrice?.price || product.price || 0;
  };

  const getCryptoPrices = () => {
    return product.prices?.filter(p => ['BTC', 'ETH', 'SOL', 'DOGE', 'LTC', 'USDC', 'USDT'].includes(p.currency)) || [];
  };

  const getTotalInventory = () => {
    return product.inventory?.reduce((total, inv) => total + inv.quantity, 0) || product.stock || 0;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square relative bg-white rounded-lg overflow-hidden">
          <WineImage
            src={product.images?.[selectedImage]?.url || product.imageUrl}
            alt={product.name}
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {product.images && product.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                  selectedImage === index ? "border-burgundy" : "border-gray-200"
                }`}
              >
                <WineImage
                  src={image.url}
                  alt={`${product.name} view ${index + 1}`}
                  width={80}
                  height={80}
                  className="object-contain w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-4xl font-bold text-charcoal-black mb-2">
            {product.name}
          </h1>
          <p className="text-xl text-muted-olive mb-4">
            {product.producer || 'Premium Producer'} • {product.vintage}
          </p>
          <p className="text-lg text-charcoal-black">
            {product.region}
          </p>
        </div>

        {/* Pricing */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <span className="text-3xl font-bold text-burgundy">
                {formatPrice(getUsdPrice())}
              </span>
              <span className="text-lg text-muted-olive ml-2">USD</span>
            </div>
            
            {getCryptoPrices().length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-charcoal-black">
                  Cryptocurrency Prices:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {getCryptoPrices().map((crypto) => (
                    <div key={crypto.currency} className="flex justify-between">
                      <span className="text-muted-olive">{crypto.currency}:</span>
                      <span className="font-medium">{formatPrice(crypto.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quantity and Add to Cart */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <label htmlFor="quantity" className="font-medium text-charcoal-black">
              Quantity:
            </label>
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 hover:bg-gray-100"
                disabled={quantity <= 1}
              >
                -
              </button>
              <input
                id="quantity"
                type="number"
                min="1"
                max={getTotalInventory()}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center py-2 border-0 focus:ring-0"
              />
              <button
                onClick={() => setQuantity(Math.min(getTotalInventory(), quantity + 1))}
                className="px-3 py-2 hover:bg-gray-100"
                disabled={quantity >= getTotalInventory()}
              >
                +
              </button>
            </div>
            <span className="text-sm text-muted-olive">
              {getTotalInventory()} available
            </span>
          </div>

          <AddToCartButton
            wineId={product.id}
            quantity={quantity}
            className="w-full"
            size="lg"
          />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h3 className="font-heading text-xl font-semibold mb-3 text-charcoal-black">
              Description
            </h3>
            <p className="text-muted-olive leading-relaxed">
              {product.description}
            </p>
          </div>

          {(product.tastingNotes || product.specification?.tastingNotes) && (
            <div>
              <h3 className="font-heading text-xl font-semibold mb-3 text-charcoal-black">
                Tasting Notes
              </h3>
              <p className="text-muted-olive leading-relaxed">
                {product.tastingNotes || product.specification?.tastingNotes}
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-charcoal-black mb-2">Wine Details</h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-olive">Vintage:</dt>
                  <dd className="font-medium">{product.vintage}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-olive">Region:</dt>
                  <dd className="font-medium">{product.region}</dd>
                </div>
                {product.category && (
                  <div className="flex justify-between">
                    <dt className="text-muted-olive">Category:</dt>
                    <dd className="font-medium">{product.category}</dd>
                  </div>
                )}
                {(product.alcoholContent || product.specification?.alcoholContent) && (
                  <div className="flex justify-between">
                    <dt className="text-muted-olive">Alcohol:</dt>
                    <dd className="font-medium">{product.alcoholContent || product.specification?.alcoholContent}%</dd>
                  </div>
                )}
                {product.bottleSize && (
                  <div className="flex justify-between">
                    <dt className="text-muted-olive">Bottle Size:</dt>
                    <dd className="font-medium">{product.bottleSize}</dd>
                  </div>
                )}
              </dl>
            </div>

            {(product.specifications || product.specification) && (
              <div>
                <h4 className="font-medium text-charcoal-black mb-2">Specifications</h4>
                <dl className="space-y-1 text-sm">
                  {Object.entries(product.specifications || product.specification || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <dt className="text-muted-olive capitalize">{key.replace(/([A-Z])/g, ' $1')}:</dt>
                      <dd className="font-medium">{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}