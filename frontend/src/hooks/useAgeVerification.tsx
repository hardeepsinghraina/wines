'use client';

import { useState, useEffect } from 'react';

export interface AgeVerificationState {
  isVerified: boolean;
  showOverlay: boolean;
  isLoading: boolean;
}

export const useAgeVerification = () => {
  const [state, setState] = useState<AgeVerificationState>({
    isVerified: false,
    showOverlay: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') {
      return;
    }

    const checkVerificationStatus = () => {
      try {
        const isVerified = sessionStorage.getItem('ageVerified') === 'true';
        const timestamp = sessionStorage.getItem('ageVerificationTimestamp');
        
        // Check if verification is still valid (within current session)
        let isValidVerification = false;
        if (isVerified && timestamp) {
          const verificationTime = parseInt(timestamp, 10);
          const currentTime = Date.now();
          // Consider verification valid for 24 hours (86400000 ms)
          const maxAge = 24 * 60 * 60 * 1000;
          isValidVerification = (currentTime - verificationTime) < maxAge;
        }

        setState({
          isVerified: isValidVerification,
          showOverlay: !isValidVerification,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error checking age verification status:', error);
        // If there's an error accessing sessionStorage, show overlay
        setState({
          isVerified: false,
          showOverlay: true,
          isLoading: false,
        });
      }
    };

    // Initial check
    checkVerificationStatus();

    // Listen for storage changes (in case user opens multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ageVerified' || e.key === 'ageVerificationTimestamp') {
        checkVerificationStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleVerificationComplete = () => {
    setState(prev => ({
      ...prev,
      isVerified: true,
      showOverlay: false,
    }));
  };

  const clearVerification = () => {
    try {
      sessionStorage.removeItem('ageVerified');
      sessionStorage.removeItem('ageVerificationTimestamp');
      setState({
        isVerified: false,
        showOverlay: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error clearing age verification:', error);
    }
  };

  return {
    ...state,
    handleVerificationComplete,
    clearVerification,
  };
};

export default useAgeVerification;