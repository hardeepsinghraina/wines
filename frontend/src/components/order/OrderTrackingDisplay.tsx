'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Package, Truck, CheckCircle, Clock, MapPin, RefreshCw } from 'lucide-react';

interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  description: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  trackingEvents: TrackingEvent[];
}

interface OrderTrackingDisplayProps {
  orderId: string;
  trackingNumber?: string;
  initialStatus?: string;
}

export function OrderTrackingDisplay({ orderId, trackingNumber, initialStatus }: OrderTrackingDisplayProps) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingInfo();
    }
  }, [trackingNumber]);

  const fetchTrackingInfo = async () => {
    if (!trackingNumber) return;

    setLoading(true);
    setError(null);

    try {
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/tracking/${trackingNumber}`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tracking information');
      }

      const data = await response.json();
      setTrackingInfo(data.data);
    } catch (error) {
      console.error('Error fetching tracking info:', error);
      setError('Unable to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'shipped':
      case 'in_transit':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'shipped':
      case 'in_transit':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'exception':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!trackingNumber) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <Package className="w-12 h-12 text-muted-olive mx-auto mb-4" />
          <h3 className="font-medium text-charcoal-black mb-2">Preparing Your Order</h3>
          <p className="text-sm text-muted-olive">
            Your order is being prepared for shipment. You'll receive tracking information once it ships.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-lg font-semibold text-charcoal-black">
            Package Tracking
          </h3>
          <p className="text-sm text-muted-olive">
            Tracking Number: {trackingNumber}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchTrackingInfo}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {trackingInfo ? (
        <div className="space-y-6">
          {/* Current Status */}
          <div className={`p-4 rounded-md border ${getStatusColor(trackingInfo.status)}`}>
            <div className="flex items-center">
              {getStatusIcon(trackingInfo.status)}
              <div className="ml-3">
                <h4 className="font-medium">
                  {trackingInfo.status.charAt(0).toUpperCase() + trackingInfo.status.slice(1).replace('_', ' ')}
                </h4>
                <p className="text-sm opacity-75">
                  Carrier: {trackingInfo.carrier}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {(trackingInfo.estimatedDelivery || trackingInfo.actualDelivery) && (
            <div className="grid md:grid-cols-2 gap-4">
              {trackingInfo.estimatedDelivery && !trackingInfo.actualDelivery && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-muted-olive mr-2" />
                  <div>
                    <p className="text-sm font-medium text-charcoal-black">Estimated Delivery</p>
                    <p className="text-sm text-muted-olive">
                      {new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {trackingInfo.actualDelivery && (
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-charcoal-black">Delivered</p>
                    <p className="text-sm text-muted-olive">
                      {new Date(trackingInfo.actualDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tracking Events */}
          {trackingInfo.trackingEvents.length > 0 && (
            <div>
              <h4 className="font-medium text-charcoal-black mb-4">Tracking History</h4>
              <div className="space-y-4">
                {trackingInfo.trackingEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(event.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-charcoal-black">
                          {event.description}
                        </p>
                        <p className="text-xs text-muted-olive">
                          {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      {event.location && (
                        <div className="flex items-center mt-1">
                          <MapPin className="w-3 h-3 text-muted-olive mr-1" />
                          <p className="text-xs text-muted-olive">{event.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="text-center py-8">
          <RefreshCw className="w-8 h-8 text-muted-olive mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-olive">Loading tracking information...</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <Package className="w-8 h-8 text-muted-olive mx-auto mb-2" />
          <p className="text-sm text-muted-olive">
            Tracking information will be available once your package is in transit.
          </p>
        </div>
      )}
    </Card>
  );
}