-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cart_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT,
    "wineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "cart_items_wineId_fkey" FOREIGN KEY ("wineId") REFERENCES "wines" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_cart_items" ("createdAt", "id", "quantity", "updatedAt", "userId", "wineId") SELECT "createdAt", "id", "quantity", "updatedAt", "userId", "wineId" FROM "cart_items";
DROP TABLE "cart_items";
ALTER TABLE "new_cart_items" RENAME TO "cart_items";
CREATE UNIQUE INDEX "cart_items_userId_wineId_key" ON "cart_items"("userId", "wineId");
CREATE UNIQUE INDEX "cart_items_sessionId_wineId_key" ON "cart_items"("sessionId", "wineId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
