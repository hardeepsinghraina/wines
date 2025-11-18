/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `payments` table. All the data in the column will be lost.
  - Added the required column `method` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carrier` to the `shipping` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPrice` to the `wines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalPrice` to the `wines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sku` to the `wines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "wine_specifications" ADD COLUMN "acidity" TEXT;
ALTER TABLE "wine_specifications" ADD COLUMN "body" TEXT;
ALTER TABLE "wine_specifications" ADD COLUMN "finish" TEXT;
ALTER TABLE "wine_specifications" ADD COLUMN "malolacticFermentation" BOOLEAN;
ALTER TABLE "wine_specifications" ADD COLUMN "oakTreatment" TEXT;
ALTER TABLE "wine_specifications" ADD COLUMN "ph" REAL;
ALTER TABLE "wine_specifications" ADD COLUMN "residualSugar" REAL;
ALTER TABLE "wine_specifications" ADD COLUMN "tannins" TEXT;

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "imageUrl" TEXT,
    "iconUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "product_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'SHIPPING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tracking_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT,
    "description" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tracking_events_trackingNumber_fkey" FOREIGN KEY ("trackingNumber") REFERENCES "shipping" ("trackingNumber") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "security_events" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "userId" TEXT,
    "email" TEXT,
    "endpoint" TEXT,
    "method" TEXT,
    "payload" TEXT,
    "requestId" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedBy" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "userId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT,
    "oldValues" TEXT,
    "newValues" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "requestId" TEXT,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "permissions" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" DATETIME,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "wine_prices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "originalPrice" REAL NOT NULL,
    "currentPrice" REAL NOT NULL,
    "costPrice" REAL,
    "discountType" TEXT,
    "discountValue" REAL,
    "discountStartDate" DATETIME,
    "discountEndDate" DATETIME,
    "tier" TEXT NOT NULL DEFAULT 'STANDARD',
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "maxQuantity" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPromotion" BOOLEAN NOT NULL DEFAULT false,
    "promotionCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wine_prices_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wine_inventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "availableQty" INTEGER NOT NULL DEFAULT 0,
    "damagedQty" INTEGER NOT NULL DEFAULT 0,
    "location" TEXT NOT NULL DEFAULT 'main_warehouse',
    "warehouse" TEXT,
    "zone" TEXT,
    "temperature" REAL,
    "humidity" REAL,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "reorderPoint" INTEGER NOT NULL DEFAULT 5,
    "maxStockLevel" INTEGER,
    "lastRestocked" DATETIME,
    "lastSold" DATETIME,
    "lastInventoryCheck" DATETIME,
    "expiryDate" DATETIME,
    "batchNumber" TEXT,
    "lotNumber" TEXT,
    "supplierRef" TEXT,
    "unitCost" REAL,
    "totalValue" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wine_inventory_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wine_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT,
    "altText" TEXT,
    "title" TEXT,
    "caption" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PRODUCT',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "thumbnailUrl" TEXT,
    "mediumUrl" TEXT,
    "largeUrl" TEXT,
    "seoScore" REAL,
    "tags" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wine_images_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wine_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "bottleSize" TEXT NOT NULL,
    "packaging" TEXT,
    "format" TEXT,
    "originalPrice" REAL NOT NULL,
    "currentPrice" REAL NOT NULL,
    "priceModifier" REAL NOT NULL DEFAULT 0,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "reservedQty" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "attributes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wine_variants_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wine_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT NOT NULL,
    "tasteRating" INTEGER,
    "aromaRating" INTEGER,
    "appearanceRating" INTEGER,
    "valueRating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "purchaseDate" DATETIME,
    "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "unhelpfulVotes" INTEGER NOT NULL DEFAULT 0,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "responseCount" INTEGER NOT NULL DEFAULT 0,
    "moderatorNotes" TEXT,
    "moderatedBy" TEXT,
    "moderatedAt" DATETIME,
    "qualityScore" REAL,
    "sentimentScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wine_reviews_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "wine_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "wine_seo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT NOT NULL,
    "slug" TEXT,
    "canonicalUrl" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "ogType" TEXT DEFAULT 'product',
    "ogUrl" TEXT,
    "twitterTitle" TEXT,
    "twitterDescription" TEXT,
    "twitterImage" TEXT,
    "twitterCard" TEXT DEFAULT 'summary_large_image',
    "structuredData" TEXT NOT NULL,
    "breadcrumbData" TEXT,
    "productSchema" TEXT,
    "seoScore" REAL,
    "keywordDensity" TEXT,
    "readabilityScore" REAL,
    "searchTerms" TEXT,
    "competitorKeywords" TEXT,
    "lastOptimized" DATETIME,
    "optimizationNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wine_seo_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceProductId" TEXT NOT NULL,
    "targetProductId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT,
    "conditions" TEXT NOT NULL,
    "targetProducts" TEXT NOT NULL,
    "customerSegments" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "clickThroughRate" REAL,
    "conversionRate" REAL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isAutoGenerated" BOOLEAN NOT NULL DEFAULT false,
    "testGroup" TEXT,
    "testVariant" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_recommendations_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_recommendations_targetProductId_fkey" FOREIGN KEY ("targetProductId") REFERENCES "wines" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_certifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "certifyingBody" TEXT NOT NULL,
    "certificateNumber" TEXT,
    "type" TEXT NOT NULL,
    "level" TEXT,
    "description" TEXT,
    "issuedDate" DATETIME NOT NULL,
    "expiryDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "certificateUrl" TEXT,
    "logoUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_certifications_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "product_awards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "wineId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT,
    "awardingBody" TEXT NOT NULL,
    "competition" TEXT,
    "year" INTEGER NOT NULL,
    "score" REAL,
    "maxScore" REAL,
    "level" TEXT,
    "rank" INTEGER,
    "description" TEXT,
    "certificateUrl" TEXT,
    "logoUrl" TEXT,
    "pressRelease" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "product_awards_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subtotal" REAL NOT NULL,
    "shippingCost" REAL NOT NULL,
    "taxAmount" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "shippingAddressId" TEXT,
    "billingAddressId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "addresses" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "orders_billingAddressId_fkey" FOREIGN KEY ("billingAddressId") REFERENCES "addresses" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_orders" ("createdAt", "currency", "id", "orderNumber", "shippingCost", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt", "userId") SELECT "createdAt", "currency", "id", "orderNumber", "shippingCost", "status", "subtotal", "taxAmount", "totalAmount", "updatedAt", "userId" FROM "orders";
DROP TABLE "orders";
ALTER TABLE "new_orders" RENAME TO "orders";
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");
CREATE TABLE "new_payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "currency" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "cryptoAmount" REAL,
    "cryptoCurrency" TEXT,
    "transactionHash" TEXT,
    "paymentAddress" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_payments" ("amount", "createdAt", "cryptoAmount", "cryptoCurrency", "currency", "id", "orderId", "status", "transactionHash", "updatedAt") SELECT "amount", "createdAt", "cryptoAmount", "cryptoCurrency", "currency", "id", "orderId", "status", "transactionHash", "updatedAt" FROM "payments";
DROP TABLE "payments";
ALTER TABLE "new_payments" RENAME TO "payments";
CREATE UNIQUE INDEX "payments_orderId_key" ON "payments"("orderId");
CREATE TABLE "new_shipping" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "carrier" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "estimatedDelivery" DATETIME,
    "actualDelivery" DATETIME,
    "isInsured" BOOLEAN NOT NULL DEFAULT false,
    "insuranceAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "shipping_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_shipping" ("actualDelivery", "createdAt", "estimatedDelivery", "id", "insuranceAmount", "isInsured", "method", "orderId", "status", "trackingNumber", "updatedAt") SELECT "actualDelivery", "createdAt", "estimatedDelivery", "id", "insuranceAmount", "isInsured", "method", "orderId", "status", "trackingNumber", "updatedAt" FROM "shipping";
DROP TABLE "shipping";
ALTER TABLE "new_shipping" RENAME TO "shipping";
CREATE UNIQUE INDEX "shipping_orderId_key" ON "shipping"("orderId");
CREATE UNIQUE INDEX "shipping_trackingNumber_key" ON "shipping"("trackingNumber");
CREATE TABLE "new_user_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "lastActivity" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_sessions" ("createdAt", "expiresAt", "id", "refreshToken", "sessionToken", "userId") SELECT "createdAt", "expiresAt", "id", "refreshToken", "sessionToken", "userId" FROM "user_sessions";
DROP TABLE "user_sessions";
ALTER TABLE "new_user_sessions" RENAME TO "user_sessions";
CREATE UNIQUE INDEX "user_sessions_sessionToken_key" ON "user_sessions"("sessionToken");
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" DATETIME,
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "passwordChangedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "dateOfBirth", "email", "emailVerified", "firstName", "id", "isActive", "lastName", "passwordHash", "role", "updatedAt") SELECT "createdAt", "dateOfBirth", "email", "emailVerified", "firstName", "id", "isActive", "lastName", "passwordHash", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE TABLE "new_wines" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "producer" TEXT NOT NULL DEFAULT 'Premium Producer',
    "description" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "appellation" TEXT,
    "vintage" INTEGER NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Red Wine',
    "categoryId" TEXT,
    "tastingNotes" TEXT,
    "alcoholContent" REAL NOT NULL DEFAULT 13.5,
    "bottleSize" TEXT NOT NULL DEFAULT '750ml',
    "sku" TEXT NOT NULL,
    "originalPrice" REAL NOT NULL,
    "currentPrice" REAL NOT NULL,
    "discountPercent" REAL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "terroir" TEXT,
    "winemaker" TEXT,
    "estate" TEXT,
    "classification" TEXT,
    "servingTemp" TEXT,
    "agingPotential" TEXT,
    "harvestDate" DATETIME,
    "bottlingDate" DATETIME,
    "releaseDate" DATETIME,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isLimitedEdition" BOOLEAN NOT NULL DEFAULT false,
    "isNftAvailable" BOOLEAN NOT NULL DEFAULT false,
    "isPreOrder" BOOLEAN NOT NULL DEFAULT false,
    "availableFrom" DATETIME,
    "price" REAL,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "wines_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "product_categories" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_wines" ("createdAt", "currency", "description", "id", "imageUrl", "isActive", "isFeatured", "name", "price", "region", "stock", "updatedAt", "vintage") SELECT "createdAt", "currency", "description", "id", "imageUrl", "isActive", "isFeatured", "name", "price", "region", "stock", "updatedAt", "vintage" FROM "wines";
DROP TABLE "wines";
ALTER TABLE "new_wines" RENAME TO "wines";
CREATE UNIQUE INDEX "wines_sku_key" ON "wines"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_slug_key" ON "product_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "wine_prices_wineId_currency_tier_key" ON "wine_prices"("wineId", "currency", "tier");

-- CreateIndex
CREATE UNIQUE INDEX "wine_inventory_wineId_location_key" ON "wine_inventory"("wineId", "location");

-- CreateIndex
CREATE UNIQUE INDEX "wine_variants_sku_key" ON "wine_variants"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "wine_reviews_wineId_userId_key" ON "wine_reviews"("wineId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "wine_seo_wineId_key" ON "wine_seo"("wineId");

-- CreateIndex
CREATE UNIQUE INDEX "wine_seo_slug_key" ON "wine_seo"("slug");
