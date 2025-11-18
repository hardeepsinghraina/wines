# Links and Collections Display Fix

## Issues Found

### 1. Home Page Category Buttons Have No Links
The three category cards (Red Wines, White Wines, Champagne) are just buttons without navigation.

**Location**: `frontend/src/app/page.tsx`

**Current**:
```tsx
<button className="bg-burgundy...">Explore Reds</button>
```

**Should be**:
```tsx
<Link href="/products?search=Red">
  <button>Explore Reds</button>
</Link>
```

### 2. Collections Page Fetching Wrong Categories
Collections page tries to fetch wines by categories that don't exist in the database.

**Trying to fetch**:
- `category=Champagne` → 0 results
- `category=Red%20Wine` → 0 results  
- `category=White%20Wine` → 0 results
- `category=Gift%20Set` → 94 results ✓

**Database reality**:
- Total wines: 94
- All wines have category: "Gift Set"

### 3. Database Content Mismatch
The database was populated with gift sets and collections, not individual wines categorized by type.

## Solutions

### Fix 1: Add Navigation to Home Page Buttons
Update the category cards to link to appropriate pages:

```tsx
import Link from 'next/link'

// Red Wines
<Link href="/products?search=Red">
  <button className="...">Explore Reds</button>
</Link>

// White Wines  
<Link href="/products?search=White">
  <button className="...">Explore Whites</button>
</Link>

// Champagne
<Link href="/products?search=Champagne">
  <button className="...">Explore Champagne</button>
</Link>
```

### Fix 2: Update Collections Page to Use Actual Data
Since all wines are "Gift Set" category, update the collections page to:

**Option A**: Fetch all wines and group them by search terms
```typescript
const [allWines, champagneWines, redWines, whiteWines] = await Promise.all([
  fetch(getApiUrl('/api/products?limit=94')),
  fetch(getApiUrl('/api/products?search=Champagne&limit=6')),
  fetch(getApiUrl('/api/products?search=Red&limit=8')),
  fetch(getApiUrl('/api/products?search=White&limit=5'))
]);
```

**Option B**: Show actual gift set collections
```typescript
const collections = await fetch(getApiUrl('/api/products?category=Gift%20Set&limit=12'));
```

### Fix 3: Add Proper Wine Categories to Database
Seed the database with individual wines that have proper categories:

```sql
-- Add individual wines with proper categories
INSERT INTO Wine (name, producer, region, category, price, vintage, ...)
VALUES 
  -- Red Wines
  ('Château Margaux 2015', 'Château Margaux', 'Bordeaux', 'Red', 850.00, 2015, ...),
  ('Penfolds Grange', 'Penfolds', 'Barossa Valley', 'Red', 650.00, 2018, ...),
  
  -- White Wines
  ('Domaine Leflaive Montrachet', 'Domaine Leflaive', 'Burgundy', 'White', 450.00, 2020, ...),
  ('Cloudy Bay Sauvignon Blanc', 'Cloudy Bay', 'Marlborough', 'White', 35.00, 2022, ...),
  
  -- Champagne/Sparkling
  ('Dom Pérignon', 'Moët & Chandon', 'Champagne', 'Sparkling', 180.00, 2012, ...),
  ('Krug Grande Cuvée', 'Krug', 'Champagne', 'Sparkling', 220.00, 2015, ...);
```

## Current Database Stats
- **Total Products**: 94
- **Categories**: Gift Set (100%)
- **Regions**: Various (Master Sommelier Curated, Investment Grade Selection, Multi-Regional, etc.)

## Recommended Actions

1. **Immediate**: Update home page buttons to have working links
2. **Short-term**: Update collections page to use search instead of category filter
3. **Long-term**: Populate database with individual wines in proper categories

## Testing After Fixes

### Home Page:
- Click "Explore Reds" → Should go to `/products?search=Red`
- Click "Explore Whites" → Should go to `/products?search=White`
- Click "Explore Champagne" → Should go to `/products?search=Champagne`

### Collections Page:
- Should show 4 collections with actual wines
- Each collection should have wines matching the search term
- Clicking a collection should show the wines in that collection

### Products Page:
- `/products` → Should show all 94 wines
- `/products?search=Champagne` → Should show wines with "Champagne" in name/description
- `/products?category=Gift%20Set` → Should show all 94 wines
