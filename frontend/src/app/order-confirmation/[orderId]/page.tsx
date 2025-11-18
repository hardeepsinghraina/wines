'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { CheckCircle, Package, Download, ArrowRight, Calendar, MapPin, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { OrderTrackingTimeline } from '@/components/order/OrderTrackingTimeline';

interface OrderItem {
  id: string;
  wineId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  wine: {
    id: string;
    name: string;
    producer: string;
    region: string;
    vintage: number;
    bottleSize: string;
    images: Array<{
      url: string;
      altText?: string;
      isPrimary: boolean;
    }>;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  items: OrderItem[];
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  shippingAddress: {
    id: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  shipping?: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery?: string;
  };
  payments?: Array<{
    method: string;
    status: string;
    amount: number;
  }>;
}

interface RecommendedProduct {
  id: string;
  name: string;
  producer: string;
  region: string;
  vintage: number;
  images: Array<{
    url: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  prices: Array<{
    price: number;
    currency: string;
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const orderId = params.orderId as string;
  const paymentStatus = searchParams.get('payment');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      fetchRecommendations();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${orderId}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/recommendations`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // Don't set error state for recommendations failure
    }
  };

  const downloadReceipt = async () => {
    setDownloadingReceipt(true);
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/receipt`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const receiptData = await response.json();
      
      // Create and download PDF (simplified - in production, you'd generate a proper PDF)
      const receiptContent = JSON.stringify(receiptData.data, null, 2);
      const blob = new Blob([receiptContent], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order?.orderNumber}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'confirmed': return 'text-blue-600 bg-blue-50';
      case 'processing': return 'text-purple-600 bg-purple-50';
      case 'shipped': return 'text-indigo-600 bg-indigo-50';
      case 'delivered': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getEstimatedDelivery = () => {
    if (order?.shipping?.estimatedDelivery) {
      return new Date(order.shipping.estimatedDelivery).toLocaleDateString();
    }
    
    // Calculate estimated delivery based on shipping method and location
    const orderDate = new Date(order?.createdAt || Date.now());
    const estimatedDate = new Date(orderDate);
    
    // Add business days (skip weekends)
    let businessDays = 5; // Default standard shipping
    const country = order?.shippingAddress?.country || 'US';
    
    // Adjust for international shipping
    if (country !== 'US' && country !== 'USA') {
      businessDays = 10;
    }
    
    let daysAdded = 0;
    while (daysAdded < businessDays) {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (estimatedDate.getDay() !== 0 && estimatedDate.getDay() !== 6) {
        daysAdded++;
      }
    }
    
    return estimatedDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-center py-20">
              <Loading />
              <span className="ml-3 text-muted-olive">Loading order details...</span>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <h1 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Order Not Found
              </h1>
              <p className="text-muted-olive mb-6">
                {error || 'The order you\'re looking for could not be found.'}
              </p>
              <div className="space-x-4">
                <Button onClick={() => router.push('/account/orders')}>
                  View All Orders
                </Button>
                <Button variant="outline" onClick={() => router.push('/products')}>
                  Continue Shopping
                </Button>
              </div>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Header />
      
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="font-heading text-3xl lg:text-4xl font-bold text-charcoal-black mb-2">
              Order Confirmed!
            </h1>
            <p className="text-lg text-muted-olive">
              Thank you for your order. We'll send you updates as your order progresses.
            </p>
            {paymentStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md inline-block">
                <p className="text-green-800 text-sm">
                  ✓ Payment confirmed successfully
                </p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Summary */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-heading text-xl font-semibold text-charcoal-black">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-sm text-muted-olive">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <p className="text-lg font-bold text-charcoal-black mt-1">
                      ${order.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-medium text-charcoal-black">Items Ordered</h3>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0">
                        {item.wine.images?.[0] && (
                          <img
                            src={item.wine.images[0].url}
                            alt={item.wine.images[0].altText || item.wine.name}
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-charcoal-black">{item.wine.name}</h4>
                        <p className="text-sm text-muted-olive">
                          {item.wine.producer} • {item.wine.vintage} • {item.wine.region}
                        </p>
                        <p className="text-sm text-muted-olive">
                          Quantity: {item.quantity} • ${item.unitPrice.toFixed(2)} each
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-charcoal-black">
                          ${item.totalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-t pt-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-olive">Subtotal</span>
                      <span className="text-charcoal-black">${order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-olive">Shipping</span>
                      <span className="text-charcoal-black">${order.shippingCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-olive">Tax</span>
                      <span className="text-charcoal-black">${order.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t">
                      <span className="text-charcoal-black">Total</span>
                      <span className="text-charcoal-black">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Shipping Information */}
              <Card className="p-6">
                <h3 className="font-heading text-lg font-semibold text-charcoal-black mb-4">
                  Shipping Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="w-4 h-4 text-muted-olive mr-2" />
                      <span className="font-medium text-charcoal-black">Delivery Address</span>
                    </div>
                    <div className="text-sm text-muted-olive pl-6">
                      <p className="font-medium">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      <p>{order.shippingAddress.street}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="w-4 h-4 text-muted-olive mr-2" />
                      <span className="font-medium text-charcoal-black">Estimated Delivery</span>
                    </div>
                    <p className="text-sm text-muted-olive pl-6">
                      {getEstimatedDelivery()}
                    </p>
                    {order.shipping?.trackingNumber ? (
                      <div className="mt-3">
                        <div className="flex items-center mb-1">
                          <Package className="w-4 h-4 text-muted-olive mr-2" />
                          <span className="font-medium text-charcoal-black">Tracking</span>
                        </div>
                        <p className="text-sm text-muted-olive pl-6">
                          {order.shipping.trackingNumber} ({order.shipping.carrier || 'FedEx'})
                        </p>
                      </div>
                    ) : order.status !== 'PENDING' && (
                      <div className="mt-3">
                        <div className="flex items-center mb-1">
                          <Package className="w-4 h-4 text-muted-olive mr-2" />
                          <span className="font-medium text-charcoal-black">Tracking</span>
                        </div>
                        <p className="text-sm text-muted-olive pl-6">
                          Tracking number will be provided when your order ships
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Payment Information */}
              <Card className="p-6">
                <h3 className="font-heading text-lg font-semibold text-charcoal-black mb-4">
                  Payment Information
                </h3>
                <div className="flex items-center">
                  <CreditCard className="w-4 h-4 text-muted-olive mr-2" />
                  <span className="text-sm text-muted-olive">
                    {order.payments?.[0]?.method === 'CRYPTO' ? 'Cryptocurrency Payment' : 'Credit Card Payment'}
                  </span>
                  <span className="ml-auto text-sm font-medium text-charcoal-black">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="font-heading text-lg font-semibold text-charcoal-black mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={downloadReceipt}
                    disabled={downloadingReceipt}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloadingReceipt ? 'Downloading...' : 'Download Receipt'}
                  </Button>
                  
                  {order.status === 'PENDING' && (
                    <Button
                      onClick={() => router.push(`/account/orders/${orderId}/modify`)}
                      variant="outline"
                      className="w-full"
                    >
                      Modify Order
                    </Button>
                  )}
                  
                  {['PENDING', 'CONFIRMED'].includes(order.status) && (
                    <Button
                      onClick={async () => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                          // Handle order cancellation
                          const { getApiUrl } = await import('@/config/api');
                          fetch(getApiUrl(`/api/orders/${orderId}/cancel`), {
                            method: 'PUT',
                            headers: {
                              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                            }
                          }).then(() => {
                            window.location.reload();
                          });
                        }
                      }}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  )}
                  
                  <Link href="/account/orders" className="block">
                    <Button variant="outline" className="w-full">
                      <Package className="w-4 h-4 mr-2" />
                      View All Orders
                    </Button>
                  </Link>
                  <Link href="/products" className="block">
                    <Button className="w-full">
                      Continue Shopping
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Recommended Products */}
              {recommendations.length > 0 && (
                <Card className="p-6">
                  <h3 className="font-heading text-lg font-semibold text-charcoal-black mb-4">
                    You Might Also Like
                  </h3>
                  <div className="space-y-4">
                    {recommendations.slice(0, 3).map((product) => (
                      <Link key={product.id} href={`/products/${product.id}`} className="block">
                        <div className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 transition-colors">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0].url}
                                alt={product.images[0].altText || product.name}
                                className="w-full h-full object-cover rounded-md"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-charcoal-black truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-muted-olive">
                              {product.producer} • {product.vintage}
                            </p>
                            <p className="text-sm font-medium text-burgundy">
                              ${product.prices?.[0]?.price.toFixed(2) || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link href="/products" className="block mt-4">
                    <Button variant="outline" size="sm" className="w-full">
                      View More Products
                    </Button>
                  </Link>
                </Card>
              )}

              {/* Order Tracking Timeline */}
              <OrderTrackingTimeline
                orderId={orderId}
                orderStatus={order.status}
                trackingNumber={order.shipping?.trackingNumber || undefined}
                estimatedDelivery={getEstimatedDelivery()}
              />

              {/* Support */}
              <Card className="p-6">
                <h3 className="font-heading text-lg font-semibold text-charcoal-black mb-4">
                  Need Help?
                </h3>
                <div className="space-y-3 text-sm text-muted-olive">
                  <p>
                    Questions about your order? Our customer service team is here to help.
                  </p>
                  <div className="space-y-2">
                    <p>
                      <strong>Email:</strong> support@luxurywines.com
                    </p>
                    <p>
                      <strong>Phone:</strong> +1 (555) 123-4567
                    </p>
                    <p>
                      <strong>Hours:</strong> Mon-Fri 9AM-6PM EST
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}