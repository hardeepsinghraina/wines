'use client';

// Service Worker registration and management
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  async register(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully');

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.notifyUpdate();
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  async unregister(): Promise<boolean> {
    if (this.registration) {
      const result = await this.registration.unregister();
      this.registration = null;
      return result;
    }
    return false;
  }

  private notifyUpdate(): void {
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  async update(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
    }
  }

  // Background sync registration
  async registerBackgroundSync(tag: string): Promise<void> {
    if (this.registration && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        await (this.registration as any).sync.register(tag);
      } catch (error) {
        console.error('Background sync registration failed:', error);
      }
    }
  }

  // Push notification subscription
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) return null;

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ) as BufferSource,
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// React hook for service worker
import { useState, useEffect } from 'react';

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const supported = 'serviceWorker' in navigator;
    setIsSupported(supported);

    if (supported) {
      serviceWorkerManager.register().then(setIsRegistered);

      // Listen for updates
      const handleUpdate = () => setUpdateAvailable(true);
      window.addEventListener('sw-update-available', handleUpdate);

      return () => {
        window.removeEventListener('sw-update-available', handleUpdate);
      };
    }
  }, []);

  const updateApp = async () => {
    if (updateAvailable) {
      await serviceWorkerManager.update();
      window.location.reload();
    }
  };

  return {
    isSupported,
    isRegistered,
    updateAvailable,
    updateApp,
  };
}