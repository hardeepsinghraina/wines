export interface Wine {
    id: string;
    name: string;
    producer: string;
    region: string;
    vintage: number;
    category: WineCategory;
    description: string;
    tastingNotes?: string;
    alcoholContent: number;
    bottleSize: string;
    sku: string;
    isActive: boolean;
    isFeatured: boolean;
    isNftAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;
    prices: WinePrice[];
    inventory: WineInventory[];
    images: WineImage[];
    specifications?: WineSpecification;
    reviews?: Review[];
    nfts?: WineNFT[];
}
export interface WinePrice {
    id: string;
    wineId: string;
    currency: string;
    price: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface WineInventory {
    id: string;
    wineId: string;
    quantity: number;
    reservedQty: number;
    location: string;
    lastRestocked?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface WineImage {
    id: string;
    wineId: string;
    url: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: Date;
}
export interface WineSpecification {
    id: string;
    wineId: string;
    grapeVariety: string[];
    servingTemp?: string;
    agingPotential?: string;
    foodPairing?: string;
    awards: string[];
    createdAt: Date;
    updatedAt: Date;
}
export interface Review {
    id: string;
    userId: string;
    wineId: string;
    rating: number;
    title?: string;
    comment?: string;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface WineNFT {
    id: string;
    wineId: string;
    tokenId: string;
    contractAddress: string;
    blockchain: string;
    metadataUri: string;
    ownerAddress?: string;
    isForSale: boolean;
    price?: number;
    createdAt: Date;
    updatedAt: Date;
}
export type WineCategory = 'bordeaux' | 'burgundy' | 'rhone-valley' | 'champagne' | 'world-wines' | 'specialty-collections';
export type CryptoCurrency = 'BTC' | 'ETH' | 'SOL' | 'DOGE' | 'LTC' | 'USDC' | 'USDT';
export type FiatCurrency = 'USD' | 'EUR';
export type Currency = CryptoCurrency | FiatCurrency;
export interface CreateWineRequest {
    name: string;
    producer: string;
    region: string;
    vintage: number;
    category: WineCategory;
    description: string;
    tastingNotes?: string;
    alcoholContent: number;
    bottleSize: string;
    sku: string;
    prices: CreateWinePriceRequest[];
    inventory: CreateWineInventoryRequest[];
    images: CreateWineImageRequest[];
    specifications?: CreateWineSpecificationRequest;
}
export interface CreateWinePriceRequest {
    currency: Currency;
    price: number;
}
export interface CreateWineInventoryRequest {
    quantity: number;
    location?: string;
}
export interface CreateWineImageRequest {
    url: string;
    altText?: string;
    isPrimary: boolean;
    sortOrder: number;
}
export interface CreateWineSpecificationRequest {
    grapeVariety: string[];
    servingTemp?: string;
    agingPotential?: string;
    foodPairing?: string;
    awards?: string[];
}
export interface UpdateWineRequest extends Partial<CreateWineRequest> {
    id: string;
    isActive?: boolean;
    isFeatured?: boolean;
    isNftAvailable?: boolean;
}
export interface WineFilters {
    category?: WineCategory[];
    region?: string[];
    vintage?: {
        min?: number;
        max?: number;
    };
    price?: {
        min?: number;
        max?: number;
        currency?: Currency;
    };
    producer?: string[];
    availability?: boolean;
    featured?: boolean;
    search?: string;
}
export interface WineSearchParams extends WineFilters {
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'price' | 'vintage' | 'createdAt' | 'rating';
    sortOrder?: 'asc' | 'desc';
}
export interface WineListResponse {
    wines: Wine[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface WineDetailResponse extends Wine {
    relatedWines?: Wine[];
    averageRating?: number;
    reviewCount?: number;
}
export interface PriceDisplay {
    fiat: {
        usd: number;
        eur: number;
    };
    crypto: {
        [K in CryptoCurrency]?: number;
    };
    displayCurrency: Currency;
    lastUpdated: Date;
}
export interface WineCategoryInfo {
    id: WineCategory;
    name: string;
    description: string;
    image: string;
    wineCount: number;
    featured: boolean;
}
export declare const WINE_CATEGORIES: Record<WineCategory, WineCategoryInfo>;
//# sourceMappingURL=product.d.ts.map