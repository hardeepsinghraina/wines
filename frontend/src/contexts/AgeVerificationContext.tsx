'use client';

import React, { createContext, useContext } from 'react';
import { AgeVerificationOverlay } from '@/components/legal/AgeVerificationOverlay';
import { useAgeVerification } from '@/hooks/useAgeVerification';

interface AgeVerificationContextType {
  isVerified: boolean;
  showOverlay: boolean;
  isLoading: boolean;
  clearVerification: () => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

export const useAgeVerificationContext = () => {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error('useAgeVerificationContext must be used within an AgeVerificationProvider');
  }
  return context;
};

interface AgeVerificationProviderProps {
  children: React.ReactNode;
}

export const AgeVerificationProvider: React.FC<AgeVerificationProviderProps> = ({ children }) => {
  const {
    isVerified,
    showOverlay,
    isLoading,
    handleVerificationComplete,
    clearVerification,
  } = useAgeVerification();

  const contextValue: AgeVerificationContextType = {
    isVerified,
    showOverlay,
    isLoading,
    clearVerification,
  };

  return (
    <AgeVerificationContext.Provider value={contextValue}>
      {/* Age Verification Overlay */}
      <AgeVerificationOverlay
        isOpen={showOverlay}
        onVerificationComplete={handleVerificationComplete}
      />
      
      {/* Content Blocker - Only show content when verified or loading */}
      <div className={showOverlay ? 'pointer-events-none select-none opacity-50 blur-sm' : ''}>
        {children}
      </div>
    </AgeVerificationContext.Provider>
  );
};

export default AgeVerificationProvider;