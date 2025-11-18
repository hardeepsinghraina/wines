export interface WineNFT {
  id: string;
  wineId: string;
  tokenId: string;
  contractAddress: string;
  blockchain: 'ethereum' | 'polygon' | 'solana';
  ownerAddress: string;
  mintedAt: Date;
  transactionHash: string;
  metadata: NFTMetadata;
  digitalCertificate: DigitalCertificate;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  externalUrl?: string;
}

export interface NFTAttribute {
  traitType: string;
  value: string | number;
  displayType?: 'boost_number' | 'boost_percentage' | 'number' | 'date';
}

export interface DigitalCertificate {
  certificateId: string;
  wineDetails: {
    name: string;
    producer: string;
    vintage: number;
    region: string;
    bottleNumber?: string;
    totalBottles?: number;
  };
  authenticity: {
    verifiedBy: string;
    verificationDate: Date;
    provenanceHash: string;
  };
  storage: {
    facility: string;
    conditions: string;
    insuranceValue: number;
  };
}

export interface NFTCollection {
  id: string;
  name: string;
  description: string;
  contractAddress: string;
  blockchain: 'ethereum' | 'polygon' | 'solana';
  totalSupply: number;
  mintedCount: number;
  floorPrice: number;
  coverImage: string;
  isActive: boolean;
  createdAt: Date;
}

export interface NFTPurchaseRequest {
  wineId: string;
  collectionId: string;
  buyerAddress: string;
  paymentMethod: 'crypto' | 'fiat';
  currency: string;
  amount: number;
}

export interface NFTMintRequest {
  wineId: string;
  collectionId: string;
  recipientAddress: string;
  metadata: NFTMetadata;
  digitalCertificate: DigitalCertificate;
}

export interface BlockchainTransaction {
  id: string;
  transactionHash: string;
  blockchain: 'ethereum' | 'polygon' | 'solana';
  fromAddress: string;
  toAddress: string;
  contractAddress: string;
  tokenId?: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasPrice?: string;
  blockNumber?: number;
  confirmations: number;
  createdAt: Date;
  updatedAt: Date;
}