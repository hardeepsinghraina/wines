'use client';

import React, { useState } from 'react';
import { Shield, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

export interface AgeVerificationOverlayProps {
  isOpen: boolean;
  onVerificationComplete: () => void;
}

export const AgeVerificationOverlay: React.FC<AgeVerificationOverlayProps> = ({
  isOpen,
  onVerificationComplete,
}) => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleAgeConfirmation = async () => {
    if (!hasAcceptedTerms) return;

    setIsVerifying(true);
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store verification status in session storage
    sessionStorage.setItem('ageVerified', 'true');
    sessionStorage.setItem('ageVerificationTimestamp', Date.now().toString());
    
    setIsVerifying(false);
    onVerificationComplete();
  };

  const handleDecline = () => {
    // Redirect to a different page or show appropriate message
    window.location.href = 'https://www.google.com';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing
      size="md"
      variant="luxury"
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEscape={false}
      className="select-none"
    >
      <div className="text-center space-y-6">
        {/* Header with Icon */}
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-burgundy/10 rounded-full">
            <Shield className="h-12 w-12 text-burgundy" />
          </div>
          <h2 className="font-display font-bold text-heading-xl text-charcoal">
            Age Verification Required
          </h2>
        </div>

        {/* Main Content */}
        <div className="space-y-4 text-left">
          <div className="bg-champagne/20 border border-champagne/40 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-burgundy mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-body-md text-charcoal">
                  Legal Age Requirement
                </p>
                <p className="text-body-sm text-olive leading-relaxed">
                  This website contains information about alcoholic beverages. 
                  By entering this site, you confirm that you are of legal drinking age 
                  in your jurisdiction and agree to our terms of service.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-ivory border border-olive/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-burgundy mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold text-body-md text-charcoal">
                  Age Confirmation
                </p>
                <p className="text-body-sm text-olive leading-relaxed">
                  You must be at least <strong>25 years old</strong> to access this luxury wine platform. 
                  This age requirement ensures compliance with international regulations 
                  for premium alcohol sales and responsible consumption.
                </p>
              </div>
            </div>
          </div>

          {/* Terms Acceptance */}
          <div className="space-y-3">
            <label className="flex items-start space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasAcceptedTerms}
                onChange={(e) => setHasAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-burgundy border-olive/30 rounded focus:ring-burgundy focus:ring-offset-0"
              />
              <span className="text-body-sm text-olive leading-relaxed group-hover:text-charcoal transition-colors">
                I confirm that I am at least 25 years old and agree to the{' '}
                <a 
                  href="/terms-of-service" 
                  target="_blank"
                  className="text-burgundy hover:text-burgundy-light underline"
                >
                  Terms of Service
                </a>
                {' '}and{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank"
                  className="text-burgundy hover:text-burgundy-light underline"
                >
                  Privacy Policy
                </a>
                . I understand that this website contains information about alcoholic beverages 
                and that I am legally permitted to view such content in my jurisdiction.
              </span>
            </label>
          </div>

          {/* Legal Disclaimer */}
          <div className="bg-olive/5 border border-olive/20 rounded-lg p-3">
            <p className="text-body-xs text-olive/80 leading-relaxed">
              <strong>Legal Disclaimer:</strong> By proceeding, you acknowledge that you are accessing 
              a platform that sells alcoholic beverages. You confirm that you are of legal drinking age 
              in your country/state/province of residence and that it is legal for you to view and 
              purchase alcoholic beverages online in your jurisdiction.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleDecline}
            className="flex-1 order-2 sm:order-1"
          >
            I am under 25
          </Button>
          <Button
            variant="luxury"
            size="lg"
            onClick={handleAgeConfirmation}
            disabled={!hasAcceptedTerms}
            isLoading={isVerifying}
            className="flex-1 order-1 sm:order-2"
          >
            {isVerifying ? 'Verifying...' : 'I am 25 or older - Enter Site'}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-4 border-t border-olive/20">
          <p className="text-body-xs text-olive/60 text-center">
            Your verification status will be stored for this browser session only. 
            We do not collect or store personal age information.
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AgeVerificationOverlay;