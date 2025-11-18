# Category Page Wine Display Issue

## Problem
When navigating to `/categories/burgundy`, no wines are displayed even though the database contains wines.

## Root Cause
The database currently contains gift sets and collections with compound regions like:
- "Burgundy & Champagne, France"
- "Multi-Regional Selection"
- "Champagne & Bordeaux, France"

The category pages filter by single regions like "Burgundy", "Champagne", etc., which don't match these compound region names.

## Current Database Content
```
- Master Sommelier Selection (region: "Master Sommelier Curated")
- Collector's Investment Portfolio (region: "Investment Grade Selection")
- Burgundy & Champagne Celebration Set (region: "Burgundy & Champagne, France")
- Wedding Celebration Luxury Set (region: "Multi-Regional Selection")
... and 16 more similar gift sets/collections
```

## Solutions

### Option 1: Populate Database with Individual Wines (Recommended)
Add individual wines with single regions:
```sql
INSERT INTO Wine (name, producer, region, category, price, vintage, ...)
VALUES 
  ('Château Margaux 2015', 'Château Margaux', 'Bordeaux', 'Red', 850.00, 2015, ...),
  ('Domaine de la Romanée-Conti', 'DRC', 'Burgundy', 'Red', 1200.00, 2018, ...),
  ('Dom Pérignon', 'Moët & Chandon', 'Champagne', 'Sparkling', 180.00, 2012, ...);
```

### Option 2: Update Backend to Use Partial Matching
The backend has been updated to use `contains` for partial matching, but there appears to be an issue with how Prisma/SQLite handles the query. The search functionality works correctly with partial matching.

**Workaround**: Users can use the search functionality (`?search=Burgundy`) which correctly finds wines with "Burgundy" in any field including region.

### Option 3: Update Existing Data
Modify existing wines to have primary single regions:
```sql
UPDATE Wine 
SET region = 'Burgundy' 
WHERE region LIKE '%Burgundy%';
```

## Testing

### What Works:
✅ `/products` - Shows all 20 wines
✅ `/products?search=Burgundy` - Finds 11 wines with "Burgundy" in name/description/region
✅ `/categories/burgundy?search=Burgundy` - Search works on category pages
✅ Exact region match: `/products?region=Burgundy%20%26%20Champagne,%20France` - Finds 1 wine

### What Doesn't Work:
❌ `/categories/burgundy` - Shows 0 wines (expects region="Burgundy" exactly)
❌ `/products?region=Burgundy` - Shows 0 wines (partial match not working as expected)

## Recommended Next Steps

1. **Immediate**: Add sample individual wines to the database with proper single regions
2. **Short-term**: Debug why Prisma `contains` operator isn't working for region filter
3. **Long-term**: Implement proper wine catalog with individual bottles organized by region

## Database Seed Script Needed

Create `backend/prisma/seeds/individual-wines.ts`:
```typescript
const individualWines = [
  {
    name: 'Château Margaux 2015',
    producer: 'Château Margaux',
    region: 'Bordeaux',
    category: 'Red',
    price: 850.00,
    vintage: 2015,
    description: 'Premier Grand Cru Classé from Margaux...',
    // ... other fields
  },
  // Add 20-30 individual wines across different regions
];
```

This will allow category pages to function correctly while maintaining the existing gift sets.
