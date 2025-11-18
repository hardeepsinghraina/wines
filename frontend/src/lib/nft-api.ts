import { api } from './api';
import { 
  NFTCollection, 
  WineNFT, 
  NFTPurchaseRequest, 
  BlockchainTransaction 
} from '../types/nft';

export const nftApi = {
  // Collections
  async getCollections(): Promise<NFTCollection[]> {
    const response = await api.get('/api/nft/collections');
    return (response as any).data;
  },

  async getCollection(id: string): Promise<NFTCollection> {
    const response = await api.get(`/api/nft/collections/${id}`);
    return (response as any).data;
  },

  // Wine NFTs
  async getWineNFTs(collectionId?: string): Promise<WineNFT[]> {
    const url = collectionId ? `/api/nft/wines?collectionId=${collectionId}` : '/api/nft/wines';
    const response = await api.get(url);
    return (response as any).data;
  },

  async getWineNFT(id: string): Promise<WineNFT> {
    const response = await api.get(`/api/nft/wines/${id}`);
    return (response as any).data;
  },

  // Purchase
  async purchaseNFT(request: NFTPurchaseRequest): Promise<{ transactionId: string; paymentUrl?: string }> {
    const response = await api.post('/api/nft/purchase', request);
    return (response as any).data;
  },

  // Verification
  async verifyOwnership(tokenId: string, ownerAddress: string): Promise<{ isOwner: boolean }> {
    const response = await api.get(`/api/nft/verify/${tokenId}/${ownerAddress}`);
    return (response as any).data;
  },

  // Transaction status
  async getTransactionStatus(transactionId: string): Promise<BlockchainTransaction> {
    const response = await api.get(`/api/nft/transactions/${transactionId}`);
    return (response as any).data;
  }
};