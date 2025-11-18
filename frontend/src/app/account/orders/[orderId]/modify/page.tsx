'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  notes?: string;
  shippingAddress?: {
    id: string;
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export default function ModifyOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const orderId = params.orderId as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
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
      const orderData = data.data;
      setOrder(orderData);
      setNotes(orderData.notes || '');
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!order) return;

    setSaving(true);
    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/orders/${orderId}/modify`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: notes.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order');
      }

      alert('Order updated successfully!');
      router.push(`/order-confirmation/${orderId}`);
    } catch (error) {
      console.error('Error updating order:', error);
      alert(error instanceof Error ? error.message : 'Failed to update order. Please try again.');
    } finally {
      setSaving(false);
    }
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

  // Check if order can be modified
  if (order.status !== 'PENDING') {
    return (
      <div className="min-h-screen bg-ivory">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 text-center">
              <h1 className="font-heading text-2xl font-bold text-charcoal-black mb-4">
                Order Cannot Be Modified
              </h1>
              <p className="text-muted-olive mb-6">
                This order has already been confirmed and cannot be modified. 
                Please contact customer service if you need to make changes.
              </p>
              <div className="space-x-4">
                <Link href={`/order-confirmation/${orderId}`}>
                  <Button>View Order</Button>
                </Link>
                <Button variant="outline" onClick={() => router.push('/account/orders')}>
                  All Orders
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href={`/order-confirmation/${orderId}`}
              className="inline-flex items-center text-burgundy hover:text-burgundy-dark mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Order
            </Link>
            <h1 className="font-heading text-3xl font-bold text-charcoal-black">
              Modify Order #{order.orderNumber}
            </h1>
            <p className="text-muted-olive mt-2">
              You can make limited changes to your order while it's still pending.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="font-heading text-xl font-semibold text-charcoal-black mb-6">
                  Order Details
                </h2>

                {/* Order Notes */}
                <div className="mb-6">
                  <label htmlFor="notes" className="block text-sm font-medium text-charcoal-black mb-2">
                    Special Instructions or Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any special instructions for your order..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-olive mt-1">
                    {notes.length}/500 characters
                  </p>
                </div>

                {/* Shipping Address Display */}
                {order.shippingAddress && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-charcoal-black mb-2">
                      Shipping Address
                    </h3>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="font-medium">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p>{order.shippingAddress.street}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                    <p className="text-xs text-muted-olive mt-2">
                      Contact customer service to change the shipping address.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <Button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Link href={`/order-confirmation/${orderId}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div>
              <Card className="p-6">
                <h3 className="font-heading text-lg font-semibold text-charcoal-black mb-4">
                  What You Can Change
                </h3>
                <div className="space-y-3 text-sm text-muted-olive">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <p>Add or update special instructions</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <p>Items and quantities cannot be changed</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                    <p>Shipping address requires customer service</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100">
                  <h4 className="font-medium text-charcoal-black mb-2">Need More Help?</h4>
                  <p className="text-sm text-muted-olive mb-3">
                    For major changes, contact our customer service team.
                  </p>
                  <div className="space-y-1 text-sm text-muted-olive">
                    <p><strong>Email:</strong> support@luxurywines.com</p>
                    <p><strong>Phone:</strong> +1 (555) 123-4567</p>
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