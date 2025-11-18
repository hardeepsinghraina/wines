'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

interface TrackingEvent {
  timestamp: Date;
  status: string;
  description: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: TrackingStatus;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  events: TrackingEvent[];
  currentLocation?: string;
}

enum TrackingStatus {
  LABEL_CREATED = 'LABEL_CREATED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  EXCEPTION = 'EXCEPTION',
  RETURNED = 'RETURNED'
}

interface TrackingDisplayProps {
  trackingNumber: string;
  carrier: string;
  className?: string;
}

export function TrackingDisplay({ trackingNumber, carrier, className = '' }: TrackingDisplayProps) {
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTrackingInfo();
  }, [trackingNumber, carrier]);

  const loadTrackingInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/shipping-provider/tracking/${carrier}/${trackingNumber}`));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load tracking information');
      }
      
      setTrackingInfo(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  };

  const refreshTracking = async () => {
    try {
      setRefreshing(true);
      
      const { getApiUrl } = await import('@/config/api');
      const response = await fetch(getApiUrl(`/api/shipping-provider/tracking/${carrier}/${trackingNumber}`), {
        method: 'PUT'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh tracking information');
      }
      
      setTrackingInfo(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh tracking information');
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: TrackingStatus): string => {
    switch (status) {
      case TrackingStatus.DELIVERED:
        return 'text-green-600 bg-green-50 border-green-200';
      case TrackingStatus.OUT_FOR_DELIVERY:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case TrackingStatus.IN_TRANSIT:
      case TrackingStatus.PICKED_UP:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case TrackingStatus.EXCEPTION:
      case TrackingStatus.RETURNED:
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: TrackingStatus): string => {
    switch (status) {
      case TrackingStatus.DELIVERED:
        return '✅';
      case TrackingStatus.OUT_FOR_DELIVERY:
        return '🚚';
      case TrackingStatus.IN_TRANSIT:
        return '📦';
      case TrackingStatus.PICKED_UP:
        return '📋';
      case TrackingStatus.EXCEPTION:
        return '⚠️';
      case TrackingStatus.RETURNED:
        return '↩️';
      default:
        return '📄';
    }
  };

  const formatStatus = (status: TrackingStatus): string => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Package Tracking</h3>
        </div>
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Package Tracking</h3>
          <Button onClick={loadTrackingInfo} size="sm">
            Try Again
          </Button>
        </div>
        <div className="text-red-600 text-center py-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-4 text-gray-500">
          <p>No tracking information available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Package Tracking</h3>
        <Button 
          onClick={refreshTracking} 
          disabled={refreshing}
          size="sm"
          variant="outline"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Tracking Number:</span>
          <span className="font-mono text-sm font-medium">{trackingInfo.trackingNumber}</span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Carrier:</span>
          <span className="text-sm font-medium">{trackingInfo.carrier}</span>
        </div>
        {trackingInfo.currentLocation && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Current Location:</span>
            <span className="text-sm font-medium">{trackingInfo.currentLocation}</span>
          </div>
        )}
      </div>

      <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border mb-6 ${getStatusColor(trackingInfo.status)}`}>
        <span className="mr-2">{getStatusIcon(trackingInfo.status)}</span>
        {formatStatus(trackingInfo.status)}
      </div>

      {trackingInfo.estimatedDelivery && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {trackingInfo.status === TrackingStatus.DELIVERED ? 'Delivered:' : 'Estimated Delivery:'}
            </span>
            <span className="text-sm text-blue-700">
              {formatDate(trackingInfo.estimatedDelivery)}
            </span>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-900 mb-4">Tracking History</h4>
        <div className="space-y-4">
          {trackingInfo.events.map((event, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-burgundy rounded-full mt-2"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {event.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(event.timestamp)}
                  </p>
                </div>
                {event.location && (
                  <p className="text-xs text-gray-600 mt-1">
                    {event.location}
                    {event.city && `, ${event.city}`}
                    {event.state && `, ${event.state}`}
                    {event.country && `, ${event.country}`}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {trackingInfo.status === TrackingStatus.EXCEPTION && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-medium text-red-800">Delivery Exception</p>
          <p className="text-sm text-red-700 mt-1">
            There was an issue with your delivery. Please contact customer service for assistance.
          </p>
        </div>
      )}

      {trackingInfo.status === TrackingStatus.DELIVERED && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-medium text-green-800">Package Delivered Successfully</p>
          <p className="text-sm text-green-700 mt-1">
            Your package has been delivered. We hope you enjoy your wine selection!
          </p>
        </div>
      )}
    </div>
  );
}