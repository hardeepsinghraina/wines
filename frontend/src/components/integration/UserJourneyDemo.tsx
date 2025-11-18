"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loading } from "@/components/ui/Loading";
import { ProductCard } from "@/components/product/ProductCard";
import { LoginForm } from "@/components/forms/LoginForm";
import { RegisterForm } from "@/components/forms/RegisterForm";
import { PaymentSelector } from "@/components/payment/PaymentSelector";
import { productApi, orderApi } from "@/lib/api";
import type { Wine } from "@/types/wine";

interface UserJourneyDemoProps {
  onComplete?: () => void;
}

export function UserJourneyDemo({ onComplete }: UserJourneyDemoProps) {
  const router = useRouter();
  const { user, isAuthenticated, login, register } = useAuth();
  const { cart, summary, addToCart } = useCart();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Wine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Wine | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getFeatured();
      setProducts((data as Wine[]).slice(0, 3)); // Show only 3 products for demo
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: Wine) => {
    setSelectedProduct(product);
    addToCart(product.id, 1);
    setStep(2);
  };

  const handleAuthSuccess = () => {
    setStep(3);
  };

  const handlePaymentComplete = async () => {
    try {
      setLoading(true);
      
      // Simulate order creation
      const orderData = {
        items: cart?.items.map(item => ({
          productId: item.wineId,
          quantity: item.quantity,
          price: item.wine?.prices?.find(p => p.currency === 'USD')?.price || 0,
        })) || [],
        total: summary?.subtotal || 0,
        shippingAddress: {
          street: "123 Demo Street",
          city: "Demo City",
          state: "Demo State",
          postalCode: "12345",
          country: "US",
        },
        paymentMethod: "crypto",
      };

      // In a real app, this would create an actual order
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      
      setOrderComplete(true);
      setStep(4);
      onComplete?.();
    } catch (error) {
      console.error("Order creation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetDemo = () => {
    setStep(1);
    setSelectedProduct(null);
    setOrderComplete(false);
    setAuthMode('login');
  };

  const steps = [
    { number: 1, title: "Browse Products", completed: step > 1 },
    { number: 2, title: "Authentication", completed: step > 2 },
    { number: 3, title: "Payment", completed: step > 3 },
    { number: 4, title: "Order Complete", completed: orderComplete },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="font-heading text-3xl font-bold text-charcoal-black mb-4">
          Complete User Journey Demo
        </h2>
        <p className="text-muted-olive">
          Experience the full wine purchasing flow from browsing to payment completion
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepItem.number
                    ? "bg-burgundy text-ivory"
                    : stepItem.completed
                    ? "bg-champagne-gold text-charcoal-black"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {stepItem.completed ? "✓" : stepItem.number}
              </div>
              <span className="ml-2 text-sm font-medium text-charcoal-black hidden sm:block">
                {stepItem.title}
              </span>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-gray-300 ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="p-8">
        {step === 1 && (
          <div>
            <h3 className="font-heading text-2xl font-semibold mb-6 text-center text-charcoal-black">
              Step 1: Browse Our Wine Collection
            </h3>
            
            {loading ? (
              <Loading />
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="text-center">
                    <ProductCard
                      wine={product}
                    />
                    <Button
                      onClick={() => handleProductSelect(product)}
                      className="mt-4 w-full"
                      variant="outline"
                    >
                      Select This Wine
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="text-center mt-8">
              <p className="text-muted-olive mb-4">
                Select any wine above to continue with the demo
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-heading text-2xl font-semibold mb-6 text-center text-charcoal-black">
              Step 2: Authentication
            </h3>
            
            <div className="max-w-md mx-auto">
              <div className="flex justify-center mb-6">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      authMode === 'login'
                        ? 'bg-white text-charcoal-black shadow-sm'
                        : 'text-muted-olive hover:text-charcoal-black'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      authMode === 'register'
                        ? 'bg-white text-charcoal-black shadow-sm'
                        : 'text-muted-olive hover:text-charcoal-black'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {authMode === 'login' ? (
                <LoginForm onSuccess={handleAuthSuccess} />
              ) : (
                <RegisterForm onSuccess={handleAuthSuccess} />
              )}

              <div className="mt-6 text-center">
                <Button
                  onClick={handleAuthSuccess}
                  variant="outline"
                  className="text-sm"
                >
                  Skip Authentication (Demo Mode)
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="font-heading text-2xl font-semibold mb-6 text-center text-charcoal-black">
              Step 3: Payment Selection
            </h3>
            
            <div className="max-w-2xl mx-auto">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-charcoal-black mb-2">Order Summary</h4>
                <div className="flex justify-between items-center">
                  <span>{selectedProduct?.name}</span>
                  <span className="font-medium">${selectedProduct?.prices?.find(p => p.currency === 'USD')?.price || selectedProduct?.price || 0}</span>
                </div>
                <div className="border-t mt-2 pt-2 flex justify-between items-center font-semibold">
                  <span>Total:</span>
                  <span>${(summary?.subtotal || 0).toFixed(2)}</span>
                </div>
              </div>

              <PaymentSelector
                totalAmount={summary?.subtotal || 0}
                currency="USD"
                onPaymentMethodSelect={() => {}}
                selectedMethod={undefined}
              />

              <div className="mt-8 text-center">
                <Button
                  onClick={handlePaymentComplete}
                  disabled={loading}
                  className="bg-burgundy text-ivory hover:bg-opacity-90 px-8"
                >
                  {loading ? "Processing..." : "Complete Demo Order"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h3 className="font-heading text-2xl font-semibold mb-4 text-charcoal-black">
              Order Complete!
            </h3>
            
            <p className="text-muted-olive mb-8 max-w-md mx-auto">
              Congratulations! You've successfully completed the entire wine purchasing journey. 
              Your order has been processed and you'll receive a confirmation email shortly.
            </p>

            <div className="space-y-4">
              <Button
                onClick={() => router.push('/account/orders')}
                className="bg-burgundy text-ivory hover:bg-opacity-90"
              >
                View Order History
              </Button>
              
              <div>
                <Button
                  onClick={resetDemo}
                  variant="outline"
                >
                  Try Demo Again
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Demo Controls */}
      <div className="mt-8 text-center">
        <div className="flex justify-center space-x-4">
          {step > 1 && step < 4 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              size="sm"
            >
              Previous Step
            </Button>
          )}
          
          <Button
            onClick={resetDemo}
            variant="outline"
            size="sm"
          >
            Reset Demo
          </Button>
        </div>
      </div>
    </div>
  );
}