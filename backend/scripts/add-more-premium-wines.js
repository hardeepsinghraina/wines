const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Additional premium wines to reach 50+ total
const additionalPremiumWines = [
  // More Bordeaux Right Bank
  {
    name: 'Château Trotanoy 2016',
    producer: 'Château Trotanoy',
    region: 'Pomerol, Bordeaux, France',
    appellation: 'Pomerol AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'One of Pomerol\'s most prestigious estates, Château Trotanoy produces wines of exceptional elegance and complexity. The vineyard\'s unique terroir of gravel and clay creates wines of remarkable depth.',
    tastingNotes: 'Intense aromas of dark plum, blackberry, and violet with hints of truffle and exotic spices. The palate is rich and concentrated with velvety tannins and exceptional length.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'CT-2016-750',
    originalPrice: 2395.00,
    currentPrice: 479.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 20,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Merlot 90%', 'Cabernet Franc 10%'],
      servingTemp: '16-18°C',
      foodPairing: 'Red meat, game, truffle dishes, aged cheeses',
      awards: ['Robert Parker 95 points', 'Wine Spectator 94 points']
    }
  },
  {
    name: 'Château L\'Évangile 2016',
    producer: 'Château L\'Évangile',
    region: 'Pomerol, Bordeaux, France',
    appellation: 'Pomerol AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'A prestigious Pomerol estate producing wines of exceptional finesse and elegance. The vineyard benefits from a unique terroir that creates wines of remarkable complexity and aging potential.',
    tastingNotes: 'Elegant aromas of red and black fruits, violets, and spices with hints of cedar and graphite. The palate is refined and structured with silky tannins and a long, sophisticated finish.',
    alcoholContent: 14.5,
    bottleSize: '750ml',
    sku: 'CLE-2016-750',
    originalPrice: 2195.00,
    currentPrice: 439.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 18,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Merlot 79%', 'Cabernet Franc 21%'],
      servingTemp: '16-18°C',
      foodPairing: 'Lamb, duck, mushroom dishes, aged Comté',
      awards: ['Wine Advocate 94 points', 'Decanter 95 points']
    }
  },
  {
    name: 'Château Canon 2016',
    producer: 'Château Canon',
    region: 'Saint-Émilion, Bordeaux, France',
    appellation: 'Saint-Émilion Grand Cru AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'A Premier Grand Cru Classé B estate located on the limestone plateau of Saint-Émilion. Château Canon produces wines of exceptional elegance and mineral precision.',
    tastingNotes: 'Complex aromas of dark berries, violets, and minerals with hints of cedar and spice. The palate is elegant and refined with fine-grained tannins and exceptional length.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'CC-2016-750',
    originalPrice: 1995.00,
    currentPrice: 399.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 25,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Merlot 75%', 'Cabernet Franc 25%'],
      servingTemp: '16-18°C',
      foodPairing: 'Roasted meats, game birds, aged cheeses',
      awards: ['Wine Spectator 93 points', 'Robert Parker 92 points']
    }
  },

  // More Left Bank Bordeaux
  {
    name: 'Château Cos d\'Estournel 2016',
    producer: 'Château Cos d\'Estournel',
    region: 'Saint-Estèphe, Bordeaux, France',
    appellation: 'Saint-Estèphe AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'A Second Growth estate known for its exotic architecture and exceptional wines. Cos d\'Estournel produces wines that combine power with elegance in the Saint-Estèphe style.',
    tastingNotes: 'Intense aromas of cassis, blackberry, cedar, and spices with hints of tobacco and graphite. The palate is powerful and structured with concentrated fruit and refined tannins.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'CDE-2016-750',
    originalPrice: 1895.00,
    currentPrice: 379.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 30,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 74%', 'Merlot 23%', 'Cabernet Franc 2%', 'Petit Verdot 1%'],
      servingTemp: '16-18°C',
      foodPairing: 'Grilled meats, lamb, aged cheeses, dark chocolate',
      awards: ['Wine Advocate 95 points', 'Wine Spectator 94 points']
    }
  },
  {
    name: 'Château Montrose 2016',
    producer: 'Château Montrose',
    region: 'Saint-Estèphe, Bordeaux, France',
    appellation: 'Saint-Estèphe AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'A Second Growth estate producing wines of exceptional power and longevity. Montrose is known for its traditional winemaking approach and wines that age gracefully for decades.',
    tastingNotes: 'Complex aromas of dark berries, cedar, tobacco, and earth with hints of graphite and spice. The palate is powerful and structured with firm tannins and exceptional aging potential.',
    alcoholContent: 13.0,
    bottleSize: '750ml',
    sku: 'CM-2016-750',
    originalPrice: 1795.00,
    currentPrice: 359.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 28,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 69%', 'Merlot 29%', 'Cabernet Franc 2%'],
      servingTemp: '16-18°C',
      foodPairing: 'Red meat, game, aged cheeses, hearty stews',
      awards: ['Robert Parker 94 points', 'Wine Spectator 93 points']
    }
  },

  // More Burgundy Whites
  {
    name: 'Domaine Leflaive Montrachet 2017',
    producer: 'Domaine Leflaive',
    region: 'Côte de Beaune, Burgundy, France',
    appellation: 'Montrachet Grand Cru AOC',
    vintage: 2017,
    category: 'White Wine',
    description: 'From the legendary Montrachet vineyard, this wine represents the pinnacle of white Burgundy. Domaine Leflaive practices biodynamic viticulture to express the unique terroir.',
    tastingNotes: 'Sublime aromas of citrus, white flowers, minerals, and subtle oak. The palate is incredibly complex with layers of fruit, vibrant acidity, and an exceptionally long, pure finish.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'DL-MON-2017-750',
    originalPrice: 3495.00,
    currentPrice: 699.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 8,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Chardonnay 100%'],
      servingTemp: '12-14°C',
      foodPairing: 'Lobster, foie gras, white truffle dishes, aged Comté',
      awards: ['Burghound 97 points', 'Wine Advocate 96 points']
    }
  },
  {
    name: 'Domaine Ramonet Montrachet 2017',
    producer: 'Domaine Ramonet',
    region: 'Côte de Beaune, Burgundy, France',
    appellation: 'Montrachet Grand Cru AOC',
    vintage: 2017,
    category: 'White Wine',
    description: 'From one of Burgundy\'s most traditional producers, this Montrachet showcases the pure expression of the world\'s greatest Chardonnay vineyard.',
    tastingNotes: 'Intense aromas of citrus, honey, minerals, and spice. The palate is rich and concentrated with perfect balance between power and elegance, leading to an incredibly long finish.',
    alcoholContent: 13.0,
    bottleSize: '750ml',
    sku: 'DR-MON-2017-750',
    originalPrice: 3295.00,
    currentPrice: 659.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 6,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Chardonnay 100%'],
      servingTemp: '12-14°C',
      foodPairing: 'Caviar, sea urchin, aged Gruyère, white truffle',
      awards: ['Wine Spectator 96 points', 'Burghound 95 points']
    }
  },

  // More Champagne
  {
    name: 'Pol Roger Sir Winston Churchill 2008',
    producer: 'Pol Roger',
    region: 'Épernay, Champagne, France',
    appellation: 'Champagne AOC',
    vintage: 2008,
    category: 'Champagne',
    description: 'Created in honor of Sir Winston Churchill, this prestige cuvée represents the pinnacle of Pol Roger\'s winemaking. Made only in exceptional years from the finest vineyards.',
    tastingNotes: 'Complex aromas of brioche, honey, citrus, and spice with hints of smoke and minerals. The palate is rich and powerful with fine bubbles and exceptional length.',
    alcoholContent: 12.5,
    bottleSize: '750ml',
    sku: 'PR-SWC-2008-750',
    originalPrice: 1995.00,
    currentPrice: 399.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 24,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Pinot Noir 60%', 'Chardonnay 40%'],
      servingTemp: '8-10°C',
      foodPairing: 'Caviar, lobster, aged Parmesan, foie gras',
      awards: ['Wine Spectator 94 points', 'Decanter 95 points']
    }
  },
  {
    name: 'Louis Roederer Cristal 2013',
    producer: 'Louis Roederer',
    region: 'Reims, Champagne, France',
    appellation: 'Champagne AOC',
    vintage: 2013,
    category: 'Champagne',
    description: 'The legendary prestige cuvée of Louis Roederer, Cristal represents the pinnacle of luxury champagne. Made from the finest vineyards and aged for extended periods.',
    tastingNotes: 'Elegant aromas of white flowers, citrus, brioche, and minerals. The palate is refined and complex with persistent bubbles, vibrant acidity, and a long, sophisticated finish.',
    alcoholContent: 12.0,
    bottleSize: '750ml',
    sku: 'LR-CRI-2013-750',
    originalPrice: 1895.00,
    currentPrice: 379.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 30,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Chardonnay 60%', 'Pinot Noir 40%'],
      servingTemp: '8-10°C',
      foodPairing: 'Oysters, caviar, delicate fish dishes, aged cheeses',
      awards: ['Robert Parker 95 points', 'Wine Spectator 94 points']
    }
  },

  // More Italian Wines
  {
    name: 'Solaia 2017',
    producer: 'Antinori',
    region: 'Chianti Classico, Tuscany, Italy',
    appellation: 'Toscana IGT',
    vintage: 2017,
    category: 'Red Wine',
    description: 'From the legendary Antinori family, Solaia represents one of Italy\'s greatest Super Tuscans. This Cabernet Sauvignon-based blend showcases the excellence of Tuscan winemaking.',
    tastingNotes: 'Intense aromas of cassis, blackberry, cedar, and spices with hints of tobacco and graphite. The palate is powerful and elegant with structured tannins and exceptional length.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'SOL-2017-750',
    originalPrice: 2195.00,
    currentPrice: 439.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 22,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 75%', 'Sangiovese 20%', 'Cabernet Franc 5%'],
      servingTemp: '16-18°C',
      foodPairing: 'Grilled meats, game, aged Pecorino, dark chocolate',
      awards: ['Wine Spectator 95 points', 'James Suckling 96 points']
    }
  },
  {
    name: 'Masseto 2017',
    producer: 'Ornellaia',
    region: 'Bolgheri, Tuscany, Italy',
    appellation: 'Toscana IGT',
    vintage: 2017,
    category: 'Red Wine',
    description: 'A pure Merlot from the prestigious Bolgheri region, Masseto represents the pinnacle of Italian Merlot production. The unique clay soils create wines of extraordinary depth and complexity.',
    tastingNotes: 'Rich aromas of dark plum, blackberry, chocolate, and spices with hints of cedar and tobacco. The palate is opulent and velvety with concentrated fruit and refined tannins.',
    alcoholContent: 14.5,
    bottleSize: '750ml',
    sku: 'MAS-2017-750',
    originalPrice: 2795.00,
    currentPrice: 559.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 15,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Merlot 100%'],
      servingTemp: '16-18°C',
      foodPairing: 'Tuscan beef, wild boar, aged cheeses, chocolate desserts',
      awards: ['Robert Parker 96 points', 'Wine Spectator 95 points']
    }
  },
  {
    name: 'Barolo Monfortino Giacomo Conterno 2013',
    producer: 'Giacomo Conterno',
    region: 'Piedmont, Italy',
    appellation: 'Barolo DOCG',
    vintage: 2013,
    category: 'Red Wine',
    description: 'The legendary Monfortino represents the pinnacle of traditional Barolo winemaking. Made only in exceptional years, this wine showcases the power and elegance of Nebbiolo.',
    tastingNotes: 'Complex aromas of red cherry, rose petals, tar, and earth with hints of leather and spice. The palate is powerful and structured with firm tannins and exceptional aging potential.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'GC-MON-2013-750',
    originalPrice: 2495.00,
    currentPrice: 499.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 12,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Nebbiolo 100%'],
      servingTemp: '16-18°C',
      foodPairing: 'Truffle dishes, braised meats, aged Gorgonzola, game',
      awards: ['Wine Advocate 97 points', 'Vinous 96 points']
    }
  },

  // More German Wines
  {
    name: 'Joh. Jos. Prüm Wehlener Sonnenuhr Riesling TBA 2017',
    producer: 'Joh. Jos. Prüm',
    region: 'Mosel, Germany',
    appellation: 'Mosel VDP.Grosse Lage',
    vintage: 2017,
    category: 'White Wine',
    description: 'From one of Germany\'s most prestigious producers, this Trockenbeerenauslese represents the pinnacle of sweet Riesling. Made from botrytis-affected grapes in exceptional years.',
    tastingNotes: 'Intense aromas of honey, apricot, citrus, and minerals with incredible complexity. The palate is rich and concentrated with perfect balance between sweetness and acidity.',
    alcoholContent: 7.0,
    bottleSize: '375ml',
    sku: 'JJP-WS-TBA-2017-375',
    originalPrice: 2295.00,
    currentPrice: 459.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 10,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Riesling 100%'],
      servingTemp: '8-10°C',
      foodPairing: 'Foie gras, blue cheese, fruit desserts, alone as dessert',
      awards: ['Wine Advocate 96 points', 'Wine Spectator 95 points']
    }
  },

  // More Spanish Wines
  {
    name: 'Pingus 2016',
    producer: 'Dominio de Pingus',
    region: 'Ribera del Duero, Spain',
    appellation: 'Ribera del Duero DO',
    vintage: 2016,
    category: 'Red Wine',
    description: 'From Danish winemaker Peter Sisseck, Pingus represents the modern face of Spanish winemaking. Made from old-vine Tempranillo, this wine showcases incredible concentration and elegance.',
    tastingNotes: 'Intense aromas of dark berries, violets, minerals, and spices. The palate is powerful and concentrated with velvety tannins, vibrant acidity, and exceptional length.',
    alcoholContent: 14.5,
    bottleSize: '750ml',
    sku: 'PIN-2016-750',
    originalPrice: 2695.00,
    currentPrice: 539.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 8,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Tempranillo 100%'],
      servingTemp: '16-18°C',
      foodPairing: 'Iberico ham, lamb, aged Manchego, chocolate',
      awards: ['Robert Parker 97 points', 'Wine Spectator 96 points']
    }
  },
  {
    name: 'L\'Ermita Álvaro Palacios 2016',
    producer: 'Álvaro Palacios',
    region: 'Priorat, Spain',
    appellation: 'Priorat DOQ',
    vintage: 2016,
    category: 'Red Wine',
    description: 'From the legendary Álvaro Palacios, L\'Ermita represents the pinnacle of Priorat winemaking. Made from old-vine Garnacha, this wine showcases the unique terroir of the region.',
    tastingNotes: 'Complex aromas of dark berries, herbs, minerals, and spices with hints of earth and smoke. The palate is powerful and elegant with concentrated fruit and refined tannins.',
    alcoholContent: 15.0,
    bottleSize: '750ml',
    sku: 'AP-ERM-2016-750',
    originalPrice: 2395.00,
    currentPrice: 479.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 12,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Garnacha 100%'],
      servingTemp: '16-18°C',
      foodPairing: 'Grilled meats, game, aged cheeses, Mediterranean cuisine',
      awards: ['Wine Advocate 95 points', 'Wine Spectator 94 points']
    }
  },

  // More California Wines
  {
    name: 'Colgin IX Estate Red Wine 2017',
    producer: 'Colgin Cellars',
    region: 'Napa Valley, California, USA',
    appellation: 'Napa Valley AVA',
    vintage: 2017,
    category: 'Red Wine',
    description: 'From the prestigious Colgin Cellars, this IX Estate wine represents the pinnacle of Napa Valley winemaking. Made from estate-grown grapes in the heart of Napa Valley.',
    tastingNotes: 'Intense aromas of cassis, blackberry, cedar, and graphite with hints of violet and exotic spices. The palate is powerful and refined with concentrated fruit and velvety tannins.',
    alcoholContent: 14.8,
    bottleSize: '750ml',
    sku: 'COL-IX-2017-750',
    originalPrice: 2595.00,
    currentPrice: 519.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 15,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 85%', 'Merlot 10%', 'Cabernet Franc 5%'],
      servingTemp: '16-18°C',
      foodPairing: 'Prime ribeye, lamb rack, aged cheddar, dark chocolate',
      awards: ['Robert Parker 96 points', 'Wine Spectator 95 points']
    }
  },
  {
    name: 'Bryant Family Vineyard Cabernet Sauvignon 2017',
    producer: 'Bryant Family Vineyard',
    region: 'Napa Valley, California, USA',
    appellation: 'Napa Valley AVA',
    vintage: 2017,
    category: 'Red Wine',
    description: 'From the cult producer Bryant Family Vineyard, this Cabernet Sauvignon represents the ultimate expression of Napa Valley terroir. Made in tiny quantities from a single vineyard.',
    tastingNotes: 'Rich aromas of dark berries, cassis, cedar, and spices with hints of chocolate and coffee. The palate is opulent and powerful with concentrated fruit and refined structure.',
    alcoholContent: 15.2,
    bottleSize: '750ml',
    sku: 'BFV-CS-2017-750',
    originalPrice: 2795.00,
    currentPrice: 559.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 10,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 100%'],
      servingTemp: '16-18°C',
      foodPairing: 'Wagyu beef, venison, aged Stilton, chocolate truffles',
      awards: ['Wine Advocate 97 points', 'James Suckling 98 points']
    }
  },

  // More Australian Wines
  {
    name: 'Henschke Hill of Grace 2016',
    producer: 'Henschke',
    region: 'Eden Valley, South Australia',
    appellation: 'Eden Valley',
    vintage: 2016,
    category: 'Red Wine',
    description: 'From Australia\'s most prestigious Shiraz vineyard, Hill of Grace represents the pinnacle of Australian winemaking. Made from vines planted in the 1860s, this wine showcases incredible depth and complexity.',
    tastingNotes: 'Complex aromas of dark berries, violets, spices, and earth with hints of chocolate and cedar. The palate is powerful and elegant with concentrated fruit and refined tannins.',
    alcoholContent: 14.5,
    bottleSize: '750ml',
    sku: 'HEN-HOG-2016-750',
    originalPrice: 2195.00,
    currentPrice: 439.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 18,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Shiraz 100%'],
      servingTemp: '16-18°C',
      foodPairing: 'Kangaroo, lamb, aged cheddar, dark chocolate',
      awards: ['Wine Advocate 96 points', 'James Suckling 97 points']
    }
  },

  // More Oregon Wines
  {
    name: 'Beaux Frères Pinot Noir The Beaux Frères Vineyard 2017',
    producer: 'Beaux Frères',
    region: 'Willamette Valley, Oregon, USA',
    appellation: 'Ribbon Ridge AVA',
    vintage: 2017,
    category: 'Red Wine',
    description: 'From the pioneering Oregon producer co-founded by Robert Parker Jr., this Pinot Noir represents the excellence of Oregon winemaking. Made from estate-grown grapes using biodynamic practices.',
    tastingNotes: 'Elegant aromas of red cherry, raspberry, earth, and spice with hints of forest floor and minerals. The palate is silky and complex with bright acidity and a long, refined finish.',
    alcoholContent: 13.8,
    bottleSize: '750ml',
    sku: 'BF-PN-BFV-2017-750',
    originalPrice: 1795.00,
    currentPrice: 359.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 20,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Pinot Noir 100%'],
      servingTemp: '14-16°C',
      foodPairing: 'Duck, salmon, mushroom dishes, aged Gruyère',
      awards: ['Wine Spectator 93 points', 'Wine Advocate 92 points']
    }
  }
]

async function addMorePremiumWines() {
  console.log('🍷 Adding more premium wines to reach 50+ total...')
  
  try {
    let createdCount = 0
    
    for (const wineData of additionalPremiumWines) {
      const { specifications, ...wineInfo } = wineData
      
      // Generate unique SKU if not provided or check for duplicates
      if (!wineInfo.sku) {
        wineInfo.sku = `WINE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      
      // Check if SKU already exists and make it unique
      const existingWine = await prisma.wine.findUnique({
        where: { sku: wineInfo.sku }
      })
      
      if (existingWine) {
        wineInfo.sku = `${wineInfo.sku}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      }
      
      // Create wine with all related data
      const wine = await prisma.wine.create({
        data: {
          ...wineInfo,
          // Create wine specification if provided
          ...(specifications && {
            specification: {
              create: {
                grapeVariety: JSON.stringify(specifications.grapeVariety),
                alcoholContent: specifications.alcoholContent || wineInfo.alcoholContent,
                servingTemp: specifications.servingTemp,
                tastingNotes: wineInfo.tastingNotes,
                foodPairing: specifications.foodPairing,
                awards: JSON.stringify(specifications.awards || [])
              }
            }
          }),
          // Create wine inventory
          inventory: {
            create: {
              quantity: wineInfo.stock || 0,
              availableQty: wineInfo.stock || 0,
              location: 'premium_warehouse',
              lowStockThreshold: 5,
              reorderPoint: 2
            }
          },
          // Create wine pricing
          prices: {
            create: {
              currency: wineInfo.currency || 'EUR',
              originalPrice: wineInfo.originalPrice,
              currentPrice: wineInfo.currentPrice,
              discountType: 'PERCENTAGE',
              discountValue: wineInfo.discountPercent,
              tier: 'STANDARD',
              isActive: true,
              isPromotion: true
            }
          },
          // Create default wine image
          images: {
            create: {
              url: `/images/wines/${wineInfo.sku.toLowerCase()}.jpg`,
              altText: `${wineInfo.name} bottle`,
              isPrimary: true,
              sortOrder: 0,
              type: 'PRODUCT',
              isActive: true
            }
          }
        }
      })
      
      createdCount++
      console.log(`✅ Created wine ${createdCount}: ${wine.name}`)
    }
    
    console.log(`🎉 Successfully created ${createdCount} additional premium wines!`)
    
    // Display updated summary
    const totalWines = await prisma.wine.count()
    const totalValue = await prisma.wine.aggregate({
      _sum: { originalPrice: true, currentPrice: true }
    })
    
    console.log(`📊 Updated Database Summary:`)
    console.log(`   Total wines: ${totalWines}`)
    console.log(`   Total original value: €${totalValue._sum.originalPrice?.toFixed(2) || '0.00'}`)
    console.log(`   Total current value: €${totalValue._sum.currentPrice?.toFixed(2) || '0.00'}`)
    console.log(`   Average discount: 80%`)
    
  } catch (error) {
    console.error('❌ Error adding more premium wines:', error)
    throw error
  }
}

// Run the population script
addMorePremiumWines()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })