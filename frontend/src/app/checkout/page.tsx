"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { AddressForm } from "@/components/forms/AddressForm";
import { CryptoPaymentConfirmation } from "@/components/payment";
import { EnhancedPaymentForm } from "@/components/checkout/EnhancedPaymentForm";
import { ShippingMethodSelector } from "@/components/shipping/ShippingMethodSelector";

import { CheckoutProgressIndicator, CheckoutErrorBoundary, CheckoutMobileNavigation, CheckoutSummary } from "@/components/checkout";
import { GuestCheckoutOption } from "@/components/checkout/GuestCheckoutOption";
import { useCheckoutState, CheckoutStep } from "@/hooks/useCheckoutState";
import type { ShippingAddress } from "@/types/shipping";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, summary, clearCart, isLoading: cartLoading, error: cartError } = useCart();
  const { isAuthenticated, user } = useAuth();
  
  // Use the checkout state hook
  const {
    state: checkoutState,
    setShippingAddress,
    setBillingAddress,
    setUseSameAddress,
    setShippingMethod,
    setPaymentMethod,
    nextStep,
    previousStep,
    goToStep,
    setProcessing,
    setError,
    clearError,

    reset,
    showCryptoPaymentScreen,
    hideCryptoPaymentScreen
  } = useCheckoutState();

  const [loading, setLoading] = useState(false);

  // Redirect to products if cart is empty
  useEffect(() => {
    if (!cartLoading && (!cart?.items || cart.items.length === 0)) {
      router.push("/products");
    }
  }, [cart?.items, cartLoading, router]);

  // Guest checkout state
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [showGuestOption, setShowGuestOption] = useState(false);

  // Handle authentication redirect - show guest option instead of immediate redirect
  useEffect(() => {
    if (!isAuthenticated && !isGuestCheckout) {
      setShowGuestOption(true);
    }
  }, [isAuthenticated, isGuestCheckout]);

  // Handle step navigation from URL params
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 1 && stepNumber <= 5) {
        goToStep(stepNumber as CheckoutStep);
      }
    }
  }, [searchParams, goToStep]);

  const handleAddressSubmit = useCallback((address: ShippingAddress, type: 'shipping' | 'billing') => {
    if (type === 'shipping') {
      setShippingAddress(address);
    } else {
      setBillingAddress(address);
    }
  }, [setShippingAddress, setBillingAddress]);

  const handleNextStep = useCallback(() => {
    if (nextStep()) {
      // Update URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('step', checkoutState.step.toString());
      window.history.pushState({}, '', newUrl.toString());
    }
  }, [nextStep, checkoutState.step]);

  const handlePreviousStep = useCallback(() => {
    previousStep();
    
    // Update URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('step', checkoutState.step.toString());
    window.history.pushState({}, '', newUrl.toString());
  }, [previousStep, checkoutState.step]);

  const handlePlaceOrder = useCallback(async () => {
    setProcessing(true);
    setLoading(true);

    try {
      // Generate order ID
      const newOrderId = `WO-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      
      // Create order data
      const orderData = {
        orderId: newOrderId,
        items: cart?.items || [],
        shippingAddress: checkoutState.shippingAddress!,
        billingAddress: checkoutState.billingAddress || checkoutState.shippingAddress!,
        shippingMethod: checkoutState.selectedShipping!,
        paymentMethod: checkoutState.selectedPayment!,
        total: (summary?.subtotal || 0) + (checkoutState.selectedShipping?.cost || 0),
        userId: user?.id,
      };

      // For crypto payments, show the payment confirmation screen
      if (checkoutState.selectedPayment!.type === 'crypto') {
        showCryptoPaymentScreen(newOrderId);
        setLoading(false);
        return;
      }

      // Process order and payment for other payment methods
      console.log('Processing order:', orderData);
      
      // Clear cart and redirect
      await clearCart();
      
      // Clear checkout state
      reset();
      
      router.push(`/account/orders?order=${newOrderId}`);
    } catch (error) {
      console.error("Order placement failed:", error);
      setError('order', error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setLoading(false);
      setProcessing(false);
    }
  }, [cart?.items, checkoutState, summary?.subtotal, user?.id, clearCart, router, setProcessing, setError, reset, showCryptoPaymentScreen]);

  const handleCryptoPaymentComplete = useCallback(async (success: boolean, transactionHash?: string) => {
    if (success) {
      console.log('Crypto payment completed:', { orderId: checkoutState.orderId, transactionHash });
      
      try {
        await clearCart();
        reset();
        router.push(`/account/orders?order=${checkoutState.orderId}&payment=success`);
      } catch (error) {
        console.error('Failed to complete order:', error);
        setError('payment', 'Payment completed but order processing failed. Please contact support.');
      }
    } else {
      hideCryptoPaymentScreen();
      setError('payment', 'Payment was cancelled or failed. Please try again.');
    }
  }, [checkoutState.orderId, clearCart, router, reset, setError, hideCryptoPaymentScreen]);

  const handleCryptoPaymentCancel = useCallback(() => {
    hideCryptoPaymentScreen();
  }, [hideCryptoPaymentScreen]);

  const handleGuestCheckout = useCallback((email: string) => {
    setGuestEmail(email);
    setIsGuestCheckout(true);
    setShowGuestOption(false);
  }, []);

  const handleLoginRedirect = useCallback(() => {
    const currentUrl = `/checkout${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`);
  }, [router, searchParams]);

  const handleRegisterRedirect = useCallback(() => {
    const currentUrl = `/checkout${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    router.push(`/auth/register?redirect=${encodeURIComponent(currentUrl)}`);
  }, [router, searchParams]);

  // Show guest checkout option
  if (showGuestOption && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <GuestCheckoutOption
              onGuestCheckout={handleGuestCheckout}
              onLoginRedirect={handleLoginRedirect}
              onRegisterRedirect={handleRegisterRedirect}
              isLoading={loading}
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (cartLoading || (!cart?.items && !cartError)) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <Loading />
              <span className="ml-3 text-muted-olive">Loading checkout...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (cartError || (!cart?.items || cart.items.length === 0)) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <Card className="p-8 text-center">
              <h1 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                {cartError ? 'Checkout Error' : 'Your Cart is Empty'}
              </h1>
              <p className="text-muted-olive mb-6">
                {cartError || 'Add some wines to your cart before proceeding to checkout.'}
              </p>
              <Button onClick={() => router.push('/products')}>
                Continue Shopping
              </Button>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const steps = [
    { 
      number: CheckoutStep.SHIPPING_ADDRESS, 
      title: "Shipping Address", 
      completed: !!checkoutState.shippingAddress,
      isActive: checkoutState.step === CheckoutStep.SHIPPING_ADDRESS
    },
    { 
      number: CheckoutStep.SHIPPING_METHOD, 
      title: "Shipping Method", 
      completed: !!checkoutState.selectedShipping,
      isActive: checkoutState.step === CheckoutStep.SHIPPING_METHOD
    },
    { 
      number: CheckoutStep.PAYMENT, 
      title: "Payment", 
      completed: !!checkoutState.selectedPayment,
      isActive: checkoutState.step === CheckoutStep.PAYMENT
    },
    { 
      number: CheckoutStep.REVIEW, 
      title: "Review Order", 
      completed: checkoutState.step > CheckoutStep.REVIEW,
      isActive: checkoutState.step === CheckoutStep.REVIEW
    },
  ];

  return (
    <CheckoutErrorBoundary>
      <div className="min-h-screen bg-ivory">
        <Header />
        
        <div className="container mx-auto px-4 py-6 lg:py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-black mb-6 lg:mb-8 text-center">
              Checkout
            </h1>

            {/* Global Error Display */}
            {Object.keys(checkoutState.errors).length > 0 && (
              <div className="mb-6">
                <Card className="p-4 bg-red-50 border-red-200">
                  <div className="text-red-800">
                    {Object.entries(checkoutState.errors).map(([key, error]) => (
                      <p key={key} className="text-sm">{error}</p>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Progress Steps - Desktop */}
            <div className="hidden lg:block mb-12">
              <CheckoutProgressIndicator 
                steps={steps} 
                currentStep={checkoutState.step}
                onStepClick={(stepNumber) => {
                  if (stepNumber < checkoutState.step) {
                    goToStep(stepNumber as CheckoutStep);
                  }
                }}
              />
            </div>

            {/* Mobile Navigation */}
            <div className="lg:hidden mb-6">
              <CheckoutMobileNavigation 
                currentStep={checkoutState.step}
                totalSteps={steps.length}
                stepTitle={steps.find(s => s.number === checkoutState.step)?.title || ''}
                onPrevious={handlePreviousStep}
                canGoBack={checkoutState.step > CheckoutStep.SHIPPING_ADDRESS}
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                {/* Crypto Payment Confirmation Screen */}
                {checkoutState.showCryptoPayment && checkoutState.selectedPayment && (
                  <CryptoPaymentConfirmation
                    orderId={checkoutState.orderId}
                    currency={checkoutState.selectedPayment.currency}
                    amount={checkoutState.selectedPayment.amount}
                    fiatAmount={(summary?.subtotal || 0) + (checkoutState.selectedShipping?.cost || 0)}
                    fiatCurrency="USD"
                    walletAddress={checkoutState.selectedPayment.walletAddress}
                    qrCodeData={checkoutState.selectedPayment.qrCodeData}
                    networkInfo={checkoutState.selectedPayment.networkInfo}
                    onPaymentComplete={handleCryptoPaymentComplete}
                    onCancel={handleCryptoPaymentCancel}
                  />
                )}
                
                {/* Step 1: Shipping Address */}
                {!checkoutState.showCryptoPayment && checkoutState.step === CheckoutStep.SHIPPING_ADDRESS && (
                  <Card className="p-4 lg:p-6">
                    <h2 className="font-heading text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-charcoal-black">
                      Shipping Address
                    </h2>
                    
                    {checkoutState.errors.shippingAddress && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">{checkoutState.errors.shippingAddress}</p>
                      </div>
                    )}
                    
                    <AddressForm
                      onSubmit={(address) => handleAddressSubmit(address, 'shipping')}
                      address={checkoutState.shippingAddress || undefined}
                      title="Shipping Address"
                      isLoading={loading}
                      showGuestEmail={isGuestCheckout}
                      guestEmail={guestEmail}
                      onGuestEmailChange={setGuestEmail}
                      savedAddresses={user?.addresses || []}
                      onSelectSavedAddress={(address) => handleAddressSubmit(address, 'shipping')}
                      formId="shipping-address-form"
                    />

                    <div className="mt-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={checkoutState.useSameAddress}
                          onChange={(e) => setUseSameAddress(e.target.checked)}
                          className="mr-2 h-4 w-4 text-burgundy focus:ring-burgundy border-gray-300 rounded"
                        />
                        <span className="text-sm text-charcoal-black">
                          Use same address for billing
                        </span>
                      </label>
                    </div>

                    {!checkoutState.useSameAddress && (
                      <div className="mt-6">
                        <h3 className="font-heading text-lg lg:text-xl font-semibold mb-4 text-charcoal-black">
                          Billing Address
                        </h3>
                        {checkoutState.errors.billingAddress && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-red-800 text-sm">{checkoutState.errors.billingAddress}</p>
                          </div>
                        )}
                        <AddressForm
                          onSubmit={(address) => handleAddressSubmit(address, 'billing')}
                          address={checkoutState.billingAddress || undefined}
                          title="Billing Address"
                          isLoading={loading}
                          savedAddresses={user?.addresses || []}
                          onSelectSavedAddress={(address) => handleAddressSubmit(address, 'billing')}
                          formId="billing-address-form"
                        />
                      </div>
                    )}

                    <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
                      <Button 
                        onClick={handleNextStep}
                        disabled={!checkoutState.shippingAddress || loading}
                        className="w-full sm:w-auto"
                      >
                        {loading ? 'Processing...' : 'Continue to Shipping'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Step 2: Shipping Method */}
                {!checkoutState.showCryptoPayment && checkoutState.step === CheckoutStep.SHIPPING_METHOD && (
                  <Card className="p-4 lg:p-6">
                    <h2 className="font-heading text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-charcoal-black">
                      Shipping Method
                    </h2>
                    
                    {checkoutState.errors.shippingMethod && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">{checkoutState.errors.shippingMethod}</p>
                      </div>
                    )}
                    
                    <ShippingMethodSelector
                      country={checkoutState.shippingAddress?.country || 'US'}
                      orderValue={summary?.subtotal || 0}
                      onMethodSelect={(method) => {
                        setShippingMethod(method);
                        clearError('shippingMethod');
                      }}
                      selectedMethod={checkoutState.selectedShipping?.method}
                    />

                    <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handlePreviousStep}
                        className="w-full sm:w-auto"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleNextStep}
                        disabled={!checkoutState.selectedShipping || loading}
                        className="w-full sm:w-auto"
                      >
                        {loading ? 'Processing...' : 'Continue to Payment'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Step 3: Payment Method */}
                {!checkoutState.showCryptoPayment && checkoutState.step === CheckoutStep.PAYMENT && (
                  <Card className="p-4 lg:p-6">
                    <h2 className="font-heading text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-charcoal-black">
                      Payment Method
                    </h2>
                    
                    {checkoutState.errors.paymentMethod && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-800 text-sm">{checkoutState.errors.paymentMethod}</p>
                      </div>
                    )}
                    
                    <EnhancedPaymentForm
                      totalAmount={(summary?.subtotal || 0) + (checkoutState.selectedShipping?.cost || 0)}
                      currency="USD"
                      onPaymentMethodSelect={(method) => {
                        setPaymentMethod(method);
                        clearError('paymentMethod');
                      }}
                      selectedMethod={checkoutState.selectedPayment || undefined}
                      savedPaymentMethods={user?.paymentMethods || []}
                      onSelectSavedMethod={(method) => {
                        setPaymentMethod(method);
                        clearError('paymentMethod');
                      }}
                      isLoading={loading}
                      formId="payment-method-form"
                    />

                    <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handlePreviousStep}
                        className="w-full sm:w-auto"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handleNextStep}
                        disabled={!checkoutState.selectedPayment || loading}
                        className="w-full sm:w-auto"
                      >
                        {loading ? 'Processing...' : 'Review Order'}
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Step 4: Review Order */}
                {!checkoutState.showCryptoPayment && checkoutState.step === CheckoutStep.REVIEW && (
                  <Card className="p-4 lg:p-6">
                    <h2 className="font-heading text-xl lg:text-2xl font-semibold mb-4 lg:mb-6 text-charcoal-black">
                      Review Your Order
                    </h2>
                    
                    <div className="space-y-6">
                      {/* Order Items */}
                      <div>
                        <h3 className="font-medium text-charcoal-black mb-4">Order Items</h3>
                        <div className="space-y-3">
                          {cart?.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-start py-3 border-b border-gray-100">
                              <div className="flex-1">
                                <span className="font-medium text-charcoal-black block">{item.wine?.name || 'Wine'}</span>
                                <span className="text-sm text-muted-olive">
                                  {item.wine?.producer} • {item.wine?.vintage} • {item.wine?.region}
                                </span>
                                <span className="text-sm text-muted-olive block">Quantity: {item.quantity}</span>
                              </div>
                              <span className="font-medium text-charcoal-black">
                                ${((item.wine?.prices?.[0]?.price || 0) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-charcoal-black mb-2">Shipping Address</h3>
                          <div className="text-sm text-muted-olive bg-gray-50 p-3 rounded-md">
                            <p className="font-medium">{checkoutState.shippingAddress?.firstName} {checkoutState.shippingAddress?.lastName}</p>
                            {checkoutState.shippingAddress?.company && <p>{checkoutState.shippingAddress.company}</p>}
                            <p>{checkoutState.shippingAddress?.street}</p>
                            <p>{checkoutState.shippingAddress?.city}, {checkoutState.shippingAddress?.state} {checkoutState.shippingAddress?.postalCode}</p>
                            <p>{checkoutState.shippingAddress?.country}</p>
                            {checkoutState.shippingAddress?.phone && <p>{checkoutState.shippingAddress.phone}</p>}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="font-medium text-charcoal-black mb-2">Billing Address</h3>
                          <div className="text-sm text-muted-olive bg-gray-50 p-3 rounded-md">
                            {checkoutState.useSameAddress ? (
                              <p className="italic">Same as shipping address</p>
                            ) : (
                              <>
                                <p className="font-medium">{checkoutState.billingAddress?.firstName} {checkoutState.billingAddress?.lastName}</p>
                                {checkoutState.billingAddress?.company && <p>{checkoutState.billingAddress.company}</p>}
                                <p>{checkoutState.billingAddress?.street}</p>
                                <p>{checkoutState.billingAddress?.city}, {checkoutState.billingAddress?.state} {checkoutState.billingAddress?.postalCode}</p>
                                <p>{checkoutState.billingAddress?.country}</p>
                                {checkoutState.billingAddress?.phone && <p>{checkoutState.billingAddress.phone}</p>}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Shipping Method */}
                      <div>
                        <h3 className="font-medium text-charcoal-black mb-2">Shipping Method</h3>
                        <div className="text-sm text-muted-olive bg-gray-50 p-3 rounded-md">
                          <p className="font-medium">{checkoutState.selectedShipping?.name}</p>
                          <p>{checkoutState.selectedShipping?.description}</p>
                          <p>Cost: ${checkoutState.selectedShipping?.cost.toFixed(2)}</p>
                          <p>Estimated delivery: {checkoutState.selectedShipping?.estimatedDays} business days</p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div>
                        <h3 className="font-medium text-charcoal-black mb-2">Payment Method</h3>
                        <div className="text-sm text-muted-olive bg-gray-50 p-3 rounded-md">
                          <p className="font-medium">
                            {checkoutState.selectedPayment?.type === 'crypto' ? 
                              `Cryptocurrency (${checkoutState.selectedPayment.currency})` : 
                              'Credit Card'
                            }
                          </p>
                          {checkoutState.selectedPayment?.type === 'crypto' && (
                            <p>Amount: {checkoutState.selectedPayment.amount} {checkoutState.selectedPayment.currency}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                      <Button 
                        variant="outline" 
                        onClick={handlePreviousStep}
                        disabled={checkoutState.isProcessing}
                        className="w-full sm:w-auto"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handlePlaceOrder}
                        disabled={loading || checkoutState.isProcessing}
                        className="bg-burgundy text-ivory hover:bg-opacity-90 w-full sm:w-auto"
                      >
                        {loading || checkoutState.isProcessing ? "Processing..." : "Place Order"}
                      </Button>
                    </div>
                  </Card>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <CheckoutSummary
                  summary={summary!}
                  shippingCost={checkoutState.selectedShipping?.cost || 0}
                  showShipping={checkoutState.step >= CheckoutStep.SHIPPING_METHOD}
                  showTax={false}
                  taxAmount={0}
                  isCollapsible={false}
                  selectedShipping={checkoutState.selectedShipping}
                />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </CheckoutErrorBoundary>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CheckoutContent />
    </Suspense>
  );
}