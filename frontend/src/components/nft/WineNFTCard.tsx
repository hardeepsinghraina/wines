'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { WineNFT } from '../../types/nft';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface WineNFTCardProps {
  nft: WineNFT;
  onPurchase?: (nft: WineNFT) => void;
  showOwnership?: boolean;
}

export const WineNFTCard: React.FC<WineNFTCardProps> = ({
  nft,
  onPurchase,
  showOwnership = false
}) => {
  const [showCertificate, setShowCertificate] = useState(false);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <Image
            src={nft.metadata.image}
            alt={nft.metadata.name}
            width={300}
            height={300}
            className="w-full h-64 object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sapphire-blue text-white">
              #{nft.tokenId}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-burgundy text-white">
              {nft.blockchain.toUpperCase()}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-2">
            {nft.metadata.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {nft.metadata.description}
          </p>
          
          {/* NFT Attributes */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {nft.metadata.attributes.slice(0, 4).map((attr, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-2">
                <div className="text-xs text-gray-500 uppercase tracking-wide">
                  {attr.traitType}
                </div>
                <div className="text-sm font-medium text-charcoal-black">
                  {attr.value}
                </div>
              </div>
            ))}
          </div>
          
          {/* Wine Details */}
          <div className="border-t pt-4 mb-4">
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-500">Producer:</span>
                <span className="font-medium">{nft.digitalCertificate.wineDetails.producer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vintage:</span>
                <span className="font-medium">{nft.digitalCertificate.wineDetails.vintage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Region:</span>
                <span className="font-medium">{nft.digitalCertificate.wineDetails.region}</span>
              </div>
            </div>
          </div>
          
          {/* Ownership Info */}
          {showOwnership && (
            <div className="border-t pt-4 mb-4">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Owner:</span>
                  <span className="font-mono text-xs">{formatAddress(nft.ownerAddress)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Minted:</span>
                  <span className="text-xs">{formatDate(nft.mintedAt)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCertificate(true)}
              className="flex-1"
            >
              View Certificate
            </Button>
            {onPurchase && (
              <Button
                onClick={() => onPurchase(nft)}
                className="flex-1"
              >
                Purchase
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Digital Certificate Modal */}
      <Modal
        isOpen={showCertificate}
        onClose={() => setShowCertificate(false)}
        title="Digital Wine Certificate"
      >
        <DigitalCertificateView certificate={nft.digitalCertificate} />
      </Modal>
    </>
  );
};

interface DigitalCertificateViewProps {
  certificate: WineNFT['digitalCertificate'];
}

const DigitalCertificateView: React.FC<DigitalCertificateViewProps> = ({ certificate }) => {
  return (
    <div className="space-y-6">
      {/* Certificate Header */}
      <div className="text-center border-b pb-4">
        <h2 className="text-2xl font-bold text-charcoal-black mb-2">
          Digital Wine Certificate
        </h2>
        <p className="text-sm text-gray-500">Certificate ID: {certificate.certificateId}</p>
      </div>
      
      {/* Wine Details */}
      <div>
        <h3 className="text-lg font-semibold text-charcoal-black mb-3">Wine Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Name:</span>
            <p className="font-medium">{certificate.wineDetails.name}</p>
          </div>
          <div>
            <span className="text-gray-500">Producer:</span>
            <p className="font-medium">{certificate.wineDetails.producer}</p>
          </div>
          <div>
            <span className="text-gray-500">Vintage:</span>
            <p className="font-medium">{certificate.wineDetails.vintage}</p>
          </div>
          <div>
            <span className="text-gray-500">Region:</span>
            <p className="font-medium">{certificate.wineDetails.region}</p>
          </div>
          {certificate.wineDetails.bottleNumber && (
            <div>
              <span className="text-gray-500">Bottle Number:</span>
              <p className="font-medium">{certificate.wineDetails.bottleNumber}</p>
            </div>
          )}
          {certificate.wineDetails.totalBottles && (
            <div>
              <span className="text-gray-500">Total Bottles:</span>
              <p className="font-medium">{certificate.wineDetails.totalBottles}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Authenticity */}
      <div>
        <h3 className="text-lg font-semibold text-charcoal-black mb-3">Authenticity</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Verified By:</span>
            <span className="font-medium">{certificate.authenticity.verifiedBy}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Verification Date:</span>
            <span className="font-medium">
              {new Date(certificate.authenticity.verificationDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Provenance Hash:</span>
            <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded mt-1">
              {certificate.authenticity.provenanceHash}
            </p>
          </div>
        </div>
      </div>
      
      {/* Storage Information */}
      <div>
        <h3 className="text-lg font-semibold text-charcoal-black mb-3">Storage Information</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Facility:</span>
            <span className="font-medium">{certificate.storage.facility}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Conditions:</span>
            <span className="font-medium">{certificate.storage.conditions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Insurance Value:</span>
            <span className="font-medium">${certificate.storage.insuranceValue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};