const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Luxury Gift Sets and Collections with 80% discount structure
const luxuryGiftSets = [
  // Wine and Spirits Pairing Collections
  {
    name: 'Bordeaux & Cognac Prestige Collection',
    producer: 'Luxury Wine Collections',
    region: 'Bordeaux & Cognac, France',
    appellation: 'Multi-Regional Collection',
    vintage: 2018,
    category: 'Gift Set',
    description: 'An exquisite pairing of premier Bordeaux wines with aged Cognac, presented in a handcrafted wooden case. This collection features a 2018 Château Margaux paired with a 25-year-old Hennessy Paradis, creating the perfect harmony between two of France\'s greatest liquid treasures.',
    tastingNotes: 'The Bordeaux offers elegant notes of cassis, cedar, and graphite, while the Cognac provides rich aromas of dried fruits, vanilla, and exotic spices. Together they create a symphony of French terroir and craftsmanship.',
    alcoholContent: 14.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-BOR-COG-001',
    originalPrice: 3995.00,
    currentPrice: 799.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 15,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Bordeaux Left Bank & Grande Champagne Cognac',
    winemaker: 'Master Blenders Collection',
    estate: 'Multi-Estate Curation',
    classification: 'Luxury Gift Collection',
    servingTemp: '16-18°C / Room Temperature',
    agingPotential: '20-30 years',
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 60%', 'Merlot 30%', 'Cabernet Franc 10%', 'Ugni Blanc (Cognac)'],
      ph: 3.62,
      residualSugar: 2.1,
      tannins: 'Medium+',
      acidity: 'Medium+',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Heavy',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Wagyu beef, foie gras, aged Roquefort, dark chocolate truffles',
      awards: ['Luxury Gift Collection Award 2023', 'Wine & Spirits Pairing Excellence']
    },
    giftSetContents: [
      '1x Château Margaux 2018 (750ml)',
      '1x Hennessy Paradis 25 Year (700ml)',
      '2x Crystal Bordeaux glasses',
      '2x Cognac snifters',
      '1x Handcrafted wooden presentation case',
      '1x Tasting notes booklet',
      '1x Certificate of authenticity'
    ],
    packaging: 'Handcrafted walnut wood case with velvet interior'
  },
  {
    name: 'Burgundy & Champagne Celebration Set',
    producer: 'Luxury Wine Collections',
    region: 'Burgundy & Champagne, France',
    appellation: 'Multi-Regional Collection',
    vintage: 2017,
    category: 'Gift Set',
    description: 'A magnificent celebration collection featuring Grand Cru Burgundy paired with vintage Champagne. This set includes a 2017 Domaine de la Romanée-Conti Échézeaux and Dom Pérignon P2 2004, presented in an elegant leather case.',
    tastingNotes: 'The Burgundy displays ethereal notes of red cherry, rose petals, and forest floor, while the Champagne offers complex brioche, honey, and mineral notes with persistent bubbles.',
    alcoholContent: 13.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-BUR-CHAM-002',
    originalPrice: 3795.00,
    currentPrice: 759.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 12,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Pinot Noir 100%', 'Chardonnay 50%', 'Pinot Noir 50%'],
      servingTemp: '14-16°C / 8-10°C',
      foodPairing: 'Caviar, lobster, truffle dishes, aged Époisses cheese',
      awards: ['Celebration Collection Excellence 2023']
    },
    giftSetContents: [
      '1x Domaine de la Romanée-Conti Échézeaux 2017 (750ml)',
      '1x Dom Pérignon P2 2004 (750ml)',
      '2x Burgundy glasses',
      '2x Champagne flutes',
      '1x Luxury leather presentation case',
      '1x Sommelier\'s tasting guide',
      '1x Numbered certificate'
    ],
    packaging: 'Premium leather case with gold embossing'
  },
  {
    name: 'Napa Valley & Scottish Whisky Prestige Duo',
    producer: 'Luxury Wine Collections',
    region: 'Napa Valley & Scotland',
    appellation: 'Multi-Regional Collection',
    vintage: 2016,
    category: 'Gift Set',
    description: 'An exceptional pairing of cult Napa Cabernet with rare Scottish single malt. Features Screaming Eagle 2016 paired with Macallan 25 Year Fine Oak, representing the pinnacle of New World wine and Old World whisky craftsmanship.',
    tastingNotes: 'The Cabernet offers intense cassis, cedar, and graphite notes, while the whisky provides rich honey, dried fruits, and oak spices with incredible depth and complexity.',
    alcoholContent: 15.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-NAP-SCOT-003',
    originalPrice: 3695.00,
    currentPrice: 739.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 8,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 76%', 'Merlot 20%', 'Cabernet Franc 4%'],
      servingTemp: '16-18°C / Room Temperature',
      foodPairing: 'Prime ribeye, aged cheddar, dark chocolate, smoked salmon',
      awards: ['International Spirits & Wine Pairing Award']
    },
    giftSetContents: [
      '1x Screaming Eagle Cabernet Sauvignon 2016 (750ml)',
      '1x Macallan 25 Year Fine Oak (700ml)',
      '2x Cabernet glasses',
      '2x Whisky tumblers',
      '1x Ebony wood presentation box',
      '1x Tasting wheel guide',
      '1x Provenance documentation'
    ],
    packaging: 'Ebony wood box with brass hardware'
  },

  // Premium Accessories and Glassware Bundles
  {
    name: 'Sommelier\'s Ultimate Wine Experience',
    producer: 'Luxury Wine Collections',
    region: 'Multi-Regional Selection',
    appellation: 'Curated Collection',
    vintage: 2017,
    category: 'Gift Set',
    description: 'The ultimate wine lover\'s collection featuring three exceptional wines from different regions, paired with professional sommelier tools and Riedel crystal glasses. Includes Barolo, Sancerre, and vintage Port.',
    tastingNotes: 'A journey through terroir: powerful Nebbiolo with tar and roses, crisp Sauvignon Blanc with minerals and citrus, and rich Port with dried fruits and spices.',
    alcoholContent: 13.5,
    bottleSize: 'Multi-Format',
    sku: 'LGS-SOM-ULT-004',
    originalPrice: 2995.00,
    currentPrice: 599.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 20,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Nebbiolo', 'Sauvignon Blanc', 'Port Blend'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Truffle dishes, goat cheese, chocolate desserts',
      awards: ['Sommelier\'s Choice Award 2023']
    },
    giftSetContents: [
      '1x Barolo Brunate 2017 (750ml)',
      '1x Sancerre Les Monts Damnés 2019 (750ml)',
      '1x Taylor Fladgate Vintage Port 2016 (750ml)',
      '3x Riedel Vinum glasses (specific to each wine)',
      '1x Professional sommelier corkscrew',
      '1x Wine aerator',
      '1x Digital thermometer',
      '1x Tasting journal',
      '1x Luxury presentation case'
    ],
    packaging: 'Professional sommelier case with foam inserts'
  },
  {
    name: 'Crystal & Wine Luxury Collection',
    producer: 'Luxury Wine Collections',
    region: 'Champagne & Bordeaux, France',
    appellation: 'Premier Cru Collection',
    vintage: 2015,
    category: 'Gift Set',
    description: 'An opulent collection featuring vintage Champagne and premier Bordeaux presented with handcrafted Baccarat crystal glasses. The ultimate expression of French luxury and craftsmanship.',
    tastingNotes: 'Elegant Champagne with brioche and citrus notes paired with structured Bordeaux showing cassis, cedar, and graphite complexity.',
    alcoholContent: 13.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-CRY-LUX-005',
    originalPrice: 3495.00,
    currentPrice: 699.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 10,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Chardonnay', 'Pinot Noir', 'Cabernet Sauvignon', 'Merlot'],
      servingTemp: '8-10°C / 16-18°C',
      foodPairing: 'Caviar, foie gras, aged cheeses, fine dining',
      awards: ['Luxury Crystal & Wine Award']
    },
    giftSetContents: [
      '1x Krug Grande Cuvée (750ml)',
      '1x Château Pichon Baron 2015 (750ml)',
      '2x Baccarat crystal Champagne flutes',
      '2x Baccarat crystal Bordeaux glasses',
      '1x Crystal decanter',
      '1x Velvet-lined presentation case',
      '1x Certificate of authenticity'
    ],
    packaging: 'Velvet-lined mahogany case with crystal compartments'
  },

  // Vintage Collection Sets from Specific Years
  {
    name: '2005 Vintage Millennium Collection',
    producer: 'Luxury Wine Collections',
    region: 'Multi-Regional Selection',
    appellation: 'Vintage Collection',
    vintage: 2005,
    category: 'Gift Set',
    description: 'A historic collection celebrating the exceptional 2005 vintage across multiple regions. Features wines from Bordeaux, Burgundy, and Champagne, all from this legendary year.',
    tastingNotes: 'The 2005 vintage is renowned for its perfect balance of power and elegance across regions, with exceptional aging potential and remarkable consistency.',
    alcoholContent: 13.5,
    bottleSize: 'Multi-Format',
    sku: 'LGS-2005-MIL-006',
    originalPrice: 3895.00,
    currentPrice: 779.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 6,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Multi-varietal vintage collection'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Fine dining, aged cheeses, luxury cuisine',
      awards: ['Vintage Collection Excellence 2005']
    },
    giftSetContents: [
      '1x Château Haut-Brion 2005 (750ml)',
      '1x Domaine de la Romanée-Conti Richebourg 2005 (750ml)',
      '1x Dom Pérignon 2005 (750ml)',
      '3x Vintage-specific glasses',
      '1x Vintage chart and tasting notes',
      '1x Collector\'s wooden case',
      '1x Vintage certificate'
    ],
    packaging: 'Collector\'s wooden case with vintage branding'
  },
  {
    name: '1996 Birth Year Celebration Collection',
    producer: 'Luxury Wine Collections',
    region: 'Multi-Regional Selection',
    appellation: 'Birth Year Collection',
    vintage: 1996,
    category: 'Gift Set',
    description: 'A special collection for those born in 1996, featuring perfectly aged wines from this exceptional vintage year. Each wine has been carefully cellared and is now at its peak drinking window.',
    tastingNotes: 'Mature wines showing secondary and tertiary characteristics with incredible complexity, depth, and the wisdom that comes with proper aging.',
    alcoholContent: 13.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-1996-BIRTH-007',
    originalPrice: 2795.00,
    currentPrice: 559.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 12,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Vintage collection varietals'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Celebration meals, special occasions',
      awards: ['Birth Year Collection Award']
    },
    giftSetContents: [
      '1x Château Margaux 1996 (750ml)',
      '1x Barolo Monfortino 1996 (750ml)',
      '1x Vintage Port 1996 (750ml)',
      '1x Birth year certificate',
      '1x Aging timeline documentation',
      '1x Personalized wooden case',
      '1x Celebration guide'
    ],
    packaging: 'Personalized wooden case with birth year engraving'
  },

  // Regional Exploration Sets
  {
    name: 'Bordeaux Left Bank Explorer Collection',
    producer: 'Luxury Wine Collections',
    region: 'Left Bank Bordeaux, France',
    appellation: 'Multi-Appellation Collection',
    vintage: 2016,
    category: 'Gift Set',
    description: 'A comprehensive exploration of Bordeaux\'s Left Bank, featuring wines from Pauillac, Saint-Estèphe, and Saint-Julien. Each wine represents the unique terroir characteristics of its appellation.',
    tastingNotes: 'A journey through Left Bank terroir: powerful Pauillac with cassis and cedar, structured Saint-Estèphe with earth and minerals, elegant Saint-Julien with finesse and balance.',
    alcoholContent: 13.5,
    bottleSize: 'Multi-Format',
    sku: 'LGS-BOR-LB-008',
    originalPrice: 2695.00,
    currentPrice: 539.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 18,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon dominant blends'],
      servingTemp: '16-18°C',
      foodPairing: 'Red meats, game, aged cheeses',
      awards: ['Regional Exploration Excellence']
    },
    giftSetContents: [
      '1x Château Latour 2016 (750ml) - Pauillac',
      '1x Château Cos d\'Estournel 2016 (750ml) - Saint-Estèphe',
      '1x Château Ducru-Beaucaillou 2016 (750ml) - Saint-Julien',
      '1x Left Bank terroir map',
      '1x Appellation guide',
      '3x Bordeaux glasses',
      '1x Regional presentation case'
    ],
    packaging: 'Regional map-themed presentation case'
  },
  {
    name: 'Tuscany Super Tuscan Discovery Set',
    producer: 'Luxury Wine Collections',
    region: 'Tuscany, Italy',
    appellation: 'Multi-Zone Collection',
    vintage: 2017,
    category: 'Gift Set',
    description: 'Discover the revolutionary Super Tuscan movement with wines from Bolgheri, Maremma, and Chianti Classico. Features the pioneers that changed Italian winemaking forever.',
    tastingNotes: 'Bold expressions of international varietals in Tuscan terroir: structured Bordeaux blends with Mediterranean herbs, elegant Sangiovese expressions, and innovative blends.',
    alcoholContent: 14.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-TUS-ST-009',
    originalPrice: 2495.00,
    currentPrice: 499.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 22,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon', 'Merlot', 'Sangiovese', 'Cabernet Franc'],
      servingTemp: '16-18°C',
      foodPairing: 'Tuscan cuisine, grilled meats, aged Pecorino',
      awards: ['Super Tuscan Discovery Award']
    },
    giftSetContents: [
      '1x Sassicaia 2017 (750ml)',
      '1x Ornellaia 2017 (750ml)',
      '1x Tignanello 2017 (750ml)',
      '1x Tuscany wine region map',
      '1x Super Tuscan history booklet',
      '3x Italian wine glasses',
      '1x Tuscan-themed case'
    ],
    packaging: 'Tuscan countryside-themed wooden case'
  },

  // Limited Edition and Collector's Sets
  {
    name: 'Master Distiller\'s Whisky Trilogy',
    producer: 'Luxury Wine Collections',
    region: 'Scotland & Japan',
    appellation: 'Master Distiller Collection',
    vintage: 0, // Multi-vintage
    category: 'Gift Set',
    description: 'An exclusive collection featuring three exceptional whiskies from master distillers: Scottish single malt, Japanese whisky, and American bourbon. Each represents the pinnacle of its style.',
    tastingNotes: 'A global whisky journey: peated Islay with smoke and sea salt, elegant Japanese with mizunara oak, and rich bourbon with vanilla and caramel.',
    alcoholContent: 43.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-WHI-TRI-010',
    originalPrice: 3295.00,
    currentPrice: 659.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 14,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['N/A - Whisky Collection'],
      servingTemp: 'Room Temperature',
      foodPairing: 'Cigars, dark chocolate, aged cheeses, smoked meats',
      awards: ['Master Distiller Collection Award']
    },
    giftSetContents: [
      '1x Ardbeg 25 Year (700ml)',
      '1x Yamazaki 18 Year (700ml)',
      '1x Pappy Van Winkle 20 Year (750ml)',
      '3x Glencairn whisky glasses',
      '1x Whisky stones set',
      '1x Master distiller profiles',
      '1x Luxury presentation case'
    ],
    packaging: 'Luxury leather case with whisky-themed interior'
  },
  {
    name: 'Champagne House Heritage Collection',
    producer: 'Luxury Wine Collections',
    region: 'Champagne, France',
    appellation: 'Multi-House Collection',
    vintage: 2008,
    category: 'Gift Set',
    description: 'A prestigious collection featuring vintage Champagnes from the most legendary houses: Dom Pérignon, Krug, and Louis Roederer Cristal. Each represents centuries of Champagne-making tradition.',
    tastingNotes: 'Three expressions of Champagne excellence: Dom Pérignon\'s elegance and precision, Krug\'s power and complexity, Cristal\'s finesse and minerality.',
    alcoholContent: 12.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-CHAM-HER-011',
    originalPrice: 3595.00,
    currentPrice: 719.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 9,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Chardonnay', 'Pinot Noir', 'Pinot Meunier'],
      servingTemp: '8-10°C',
      foodPairing: 'Caviar, oysters, fine dining, celebrations',
      awards: ['Champagne Heritage Excellence']
    },
    giftSetContents: [
      '1x Dom Pérignon 2008 (750ml)',
      '1x Krug Vintage 2008 (750ml)',
      '1x Louis Roederer Cristal 2008 (750ml)',
      '3x Champagne flutes',
      '1x Champagne sabre',
      '1x House history booklet',
      '1x Prestige presentation case'
    ],
    packaging: 'Prestige case with Champagne house emblems'
  },

  // Corporate and Executive Gift Collections
  {
    name: 'Executive Achievement Collection',
    producer: 'Luxury Wine Collections',
    region: 'Multi-Regional Selection',
    appellation: 'Executive Collection',
    vintage: 2016,
    category: 'Gift Set',
    description: 'The ultimate corporate gift featuring wines that represent achievement and success. Includes cult Napa Cabernet, premier Champagne, and aged single malt whisky in executive presentation.',
    tastingNotes: 'Wines and spirits that embody success: powerful Cabernet with authority, celebratory Champagne with elegance, and wise whisky with depth and character.',
    alcoholContent: 14.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-EXEC-ACH-012',
    originalPrice: 3795.00,
    currentPrice: 759.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 16,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon', 'Chardonnay', 'Pinot Noir'],
      servingTemp: 'Varies by beverage',
      foodPairing: 'Business dinners, celebrations, executive events',
      awards: ['Executive Gift Collection Award']
    },
    giftSetContents: [
      '1x Opus One 2016 (750ml)',
      '1x Dom Pérignon P2 2004 (750ml)',
      '1x Macallan 18 Year (700ml)',
      '1x Executive leather portfolio',
      '1x Crystal decanter set',
      '1x Personalization options',
      '1x Executive presentation case'
    ],
    packaging: 'Executive leather case with gold embossing'
  },
  {
    name: 'Board Room Prestige Collection',
    producer: 'Luxury Wine Collections',
    region: 'Multi-Regional Selection',
    appellation: 'Prestige Collection',
    vintage: 2015,
    category: 'Gift Set',
    description: 'Designed for the highest levels of corporate gifting, this collection features the most prestigious wines and spirits. Perfect for board members, major clients, and milestone celebrations.',
    tastingNotes: 'The pinnacle of luxury beverages: legendary Bordeaux with gravitas, iconic Champagne with celebration, and rare whisky with distinction.',
    alcoholContent: 13.5,
    bottleSize: 'Multi-Format',
    sku: 'LGS-BOARD-PRES-013',
    originalPrice: 3995.00,
    currentPrice: 799.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 8,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Premier collection varietals'],
      servingTemp: 'Varies by beverage',
      foodPairing: 'Executive dining, milestone celebrations',
      awards: ['Prestige Corporate Collection Award']
    },
    giftSetContents: [
      '1x Château Pétrus 2015 (750ml)',
      '1x Krug Clos du Mesnil 2006 (750ml)',
      '1x Hennessy Paradis (700ml)',
      '1x Baccarat crystal service',
      '1x Leather-bound provenance book',
      '1x Corporate customization',
      '1x Prestige presentation case'
    ],
    packaging: 'Prestige mahogany case with brass fittings'
  },

  // Holiday and Seasonal Gift Packages
  {
    name: 'Christmas Celebration Grand Collection',
    producer: 'Luxury Wine Collections',
    region: 'Multi-Regional Selection',
    appellation: 'Holiday Collection',
    vintage: 2017,
    category: 'Gift Set',
    description: 'The ultimate Christmas gift collection featuring festive wines and spirits perfect for holiday celebrations. Includes vintage Port, aged Champagne, and holiday spiced wine.',
    tastingNotes: 'Holiday flavors and aromas: rich Port with dried fruits and spices, celebratory Champagne with brioche and citrus, spiced wine with cinnamon and cloves.',
    alcoholContent: 13.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-XMAS-GRAND-014',
    originalPrice: 2595.00,
    currentPrice: 519.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 25,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Port blend', 'Chardonnay', 'Pinot Noir', 'Spiced wine blend'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Holiday meals, Christmas desserts, festive celebrations',
      awards: ['Holiday Collection Excellence']
    },
    giftSetContents: [
      '1x Taylor Fladgate Vintage Port 2017 (750ml)',
      '1x Pol Roger Winston Churchill (750ml)',
      '1x Mulled Wine Luxury Blend (750ml)',
      '1x Holiday-themed glasses set',
      '1x Festive serving accessories',
      '1x Holiday recipe booklet',
      '1x Christmas presentation case'
    ],
    packaging: 'Festive Christmas-themed presentation case'
  },
  {
    name: 'New Year\'s Eve Midnight Collection',
    producer: 'Luxury Wine Collections',
    region: 'Champagne & Multi-Regional',
    appellation: 'Celebration Collection',
    vintage: 2012,
    category: 'Gift Set',
    description: 'Ring in the New Year with this spectacular collection of celebration wines. Features vintage Champagnes and sparkling wines from around the world, perfect for midnight toasts.',
    tastingNotes: 'Celebration bubbles from around the world: French Champagne with elegance, Italian Franciacorta with finesse, and California sparkling with fruit-forward charm.',
    alcoholContent: 12.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-NYE-MID-015',
    originalPrice: 2295.00,
    currentPrice: 459.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 30,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Chardonnay', 'Pinot Noir', 'Pinot Meunier'],
      servingTemp: '6-8°C',
      foodPairing: 'New Year\'s appetizers, caviar, celebration foods',
      awards: ['Celebration Collection Award']
    },
    giftSetContents: [
      '1x Dom Pérignon 2012 (750ml)',
      '1x Ca\' del Bosco Franciacorta (750ml)',
      '1x Schramsberg J. Schram (750ml)',
      '3x Celebration flutes',
      '1x Champagne stopper set',
      '1x Midnight countdown accessories',
      '1x Celebration presentation case'
    ],
    packaging: 'Celebration case with midnight theme'
  }
]

// Additional gift sets to reach comprehensive collection
const additionalGiftSets = [
  // Personalization and Custom Engraving Options
  {
    name: 'Personalized Anniversary Collection',
    producer: 'Luxury Wine Collections',
    region: 'Multi-Regional Selection',
    appellation: 'Anniversary Collection',
    vintage: 2018,
    category: 'Gift Set',
    description: 'A romantic collection perfect for anniversaries, featuring wines from the couple\'s wedding year or special vintage. Includes custom engraving and personalization options.',
    tastingNotes: 'Romantic wines with elegance and grace: smooth Burgundy with silky texture, elegant Champagne with fine bubbles, and sweet dessert wine with honeyed notes.',
    alcoholContent: 12.5,
    bottleSize: 'Multi-Format',
    sku: 'LGS-ANNIV-PERS-016',
    originalPrice: 2795.00,
    currentPrice: 559.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 20,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Pinot Noir', 'Chardonnay', 'Dessert wine blend'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Romantic dinners, anniversary celebrations',
      awards: ['Personalized Collection Award']
    },
    giftSetContents: [
      '1x Burgundy Rouge 2018 (750ml)',
      '1x Champagne Blanc de Blancs (750ml)',
      '1x Sauternes Dessert Wine (375ml)',
      '1x Custom engraved glasses',
      '1x Personalized wine box',
      '1x Anniversary certificate',
      '1x Romantic presentation case'
    ],
    packaging: 'Romantic presentation case with custom engraving'
  },
  {
    name: 'Wedding Celebration Luxury Set',
    producer: 'Luxury Wine Collections',
    region: 'Multi-Regional Selection',
    appellation: 'Wedding Collection',
    vintage: 2019,
    category: 'Gift Set',
    description: 'The perfect wedding gift featuring wines for the ceremony, reception, and future anniversaries. Includes bottles to be opened on the 1st, 5th, and 10th anniversaries.',
    tastingNotes: 'Wines for a lifetime of celebration: fresh Champagne for immediate joy, structured red for medium-term aging, and exceptional vintage for long-term cellaring.',
    alcoholContent: 13.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-WED-LUX-017',
    originalPrice: 2995.00,
    currentPrice: 599.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 15,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Chardonnay', 'Pinot Noir', 'Cabernet Sauvignon'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Wedding celebrations, anniversary dinners',
      awards: ['Wedding Collection Excellence']
    },
    giftSetContents: [
      '1x Wedding Champagne 2019 (750ml) - Open immediately',
      '1x Bordeaux 2019 (750ml) - Open 5th anniversary',
      '1x Vintage Port 2019 (750ml) - Open 10th anniversary',
      '1x Wedding certificate holder',
      '1x Anniversary timeline guide',
      '1x Personalized wedding box',
      '1x Wedding presentation case'
    ],
    packaging: 'Wedding-themed presentation case with timeline'
  },

  // Luxury Packaging and Presentation Materials
  {
    name: 'Connoisseur\'s Tasting Journey',
    producer: 'Luxury Wine Collections',
    region: 'Global Selection',
    appellation: 'Connoisseur Collection',
    vintage: 2016,
    category: 'Gift Set',
    description: 'A comprehensive tasting journey featuring wines from six different regions, each representing a unique style and terroir. Perfect for the serious wine enthusiast.',
    tastingNotes: 'A global wine journey: Bordeaux power, Burgundy elegance, Rhône intensity, Tuscany innovation, Napa boldness, and German precision.',
    alcoholContent: 13.5,
    bottleSize: 'Multi-Format',
    sku: 'LGS-CONN-JOUR-018',
    originalPrice: 3195.00,
    currentPrice: 639.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 12,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Global varietal selection'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Tasting menus, educational tastings',
      awards: ['Connoisseur Collection Award']
    },
    giftSetContents: [
      '6x Regional wines (750ml each)',
      '6x Region-specific glasses',
      '1x Comprehensive tasting guide',
      '1x World wine map',
      '1x Tasting journal',
      '1x Professional presentation case',
      '1x Connoisseur certificate'
    ],
    packaging: 'Professional tasting case with educational materials'
  },
  {
    name: 'Collector\'s Investment Portfolio',
    producer: 'Luxury Wine Collections',
    region: 'Investment Grade Selection',
    appellation: 'Investment Collection',
    vintage: 2015,
    category: 'Gift Set',
    description: 'A carefully curated collection of investment-grade wines with proven track records of appreciation. Each wine comes with provenance documentation and storage recommendations.',
    tastingNotes: 'Investment-grade wines with exceptional aging potential: First Growth Bordeaux, Grand Cru Burgundy, and cult Napa Cabernet, all with decades of cellaring potential.',
    alcoholContent: 13.5,
    bottleSize: 'Multi-Format',
    sku: 'LGS-COLL-INV-019',
    originalPrice: 3895.00,
    currentPrice: 779.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 6,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Investment grade varietals'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Future special occasions, investment cellaring',
      awards: ['Investment Collection Excellence']
    },
    giftSetContents: [
      '1x Château Latour 2015 (750ml)',
      '1x Domaine de la Romanée-Conti 2015 (750ml)',
      '1x Screaming Eagle 2015 (750ml)',
      '1x Investment tracking portfolio',
      '1x Provenance documentation',
      '1x Storage recommendations',
      '1x Collector\'s presentation case'
    ],
    packaging: 'Collector\'s case with investment documentation'
  },
  {
    name: 'Master Sommelier Selection',
    producer: 'Luxury Wine Collections',
    region: 'Master Sommelier Curated',
    appellation: 'Professional Collection',
    vintage: 2017,
    category: 'Gift Set',
    description: 'Curated by Master Sommeliers, this collection features wines that showcase classic examples of their respective styles. Perfect for wine education and professional development.',
    tastingNotes: 'Textbook examples of classic wine styles: mineral-driven Chablis, elegant Barolo, structured Bordeaux, and precise German Riesling.',
    alcoholContent: 13.0,
    bottleSize: 'Multi-Format',
    sku: 'LGS-MS-SEL-020',
    originalPrice: 2695.00,
    currentPrice: 539.00,
    discountPercent: 80,
    currency: 'USD',
    stock: 18,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Classic varietal examples'],
      servingTemp: 'Varies by wine',
      foodPairing: 'Educational tastings, professional development',
      awards: ['Master Sommelier Approved']
    },
    giftSetContents: [
      '4x Classic style wines (750ml each)',
      '1x Master Sommelier tasting notes',
      '1x Professional tasting sheets',
      '1x Wine service tools',
      '1x Educational materials',
      '1x Professional presentation case',
      '1x Sommelier certificate'
    ],
    packaging: 'Professional sommelier case with educational materials'
  }
]

// Combine all gift sets
const allGiftSets = [...luxuryGiftSets, ...additionalGiftSets]

async function populateLuxuryGiftSets() {
  console.log('🎁 Starting luxury gift sets population...')
  
  try {
    let createdCount = 0
    
    for (const giftSetData of allGiftSets) {
      const { specifications, giftSetContents, packaging, ...giftSetInfo } = giftSetData
      
      // Generate unique SKU if not provided
      if (!giftSetInfo.sku) {
        giftSetInfo.sku = `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      
      // Create gift set with all related data
      const giftSet = await prisma.wine.create({
        data: {
          ...giftSetInfo,
          // Create wine specification if provided
          ...(specifications && {
            specification: {
              create: {
                grapeVariety: JSON.stringify(specifications.grapeVariety),
                alcoholContent: specifications.alcoholContent || giftSetInfo.alcoholContent,
                servingTemp: specifications.servingTemp,
                tastingNotes: giftSetInfo.tastingNotes,
                foodPairing: specifications.foodPairing,
                awards: JSON.stringify(specifications.awards || []),
                ph: specifications.ph,
                residualSugar: specifications.residualSugar,
                tannins: specifications.tannins,
                acidity: specifications.acidity,
                body: specifications.body,
                finish: specifications.finish,
                oakTreatment: specifications.oakTreatment,
                malolacticFermentation: specifications.malolacticFermentation
              }
            }
          }),
          // Create gift set inventory
          inventory: {
            create: {
              quantity: giftSetInfo.stock || 0,
              availableQty: giftSetInfo.stock || 0,
              location: 'gift_set_warehouse',
              lowStockThreshold: 3,
              reorderPoint: 1
            }
          },
          // Create gift set pricing
          prices: {
            create: {
              currency: giftSetInfo.currency || 'USD',
              originalPrice: giftSetInfo.originalPrice,
              currentPrice: giftSetInfo.currentPrice,
              discountType: 'PERCENTAGE',
              discountValue: giftSetInfo.discountPercent,
              tier: 'LUXURY',
              isActive: true,
              isPromotion: true
            }
          },
          // Create gift set images
          images: {
            create: [
              {
                url: `/images/gift-sets/${giftSetInfo.sku.toLowerCase()}.jpg`,
                altText: `${giftSetInfo.name} luxury gift set`,
                isPrimary: true,
                sortOrder: 0,
                type: 'PRODUCT',
                isActive: true
              },
              {
                url: `/images/gift-sets/${giftSetInfo.sku.toLowerCase()}-contents.jpg`,
                altText: `${giftSetInfo.name} contents display`,
                isPrimary: false,
                sortOrder: 1,
                type: 'PRODUCT',
                isActive: true
              }
            ]
          },
          // Create gift set variants
          variants: {
            create: [
              {
                name: `${giftSetInfo.name} - Standard`,
                sku: `${giftSetInfo.sku}-STD`,
                bottleSize: giftSetInfo.bottleSize,
                packaging: 'Standard Gift Set',
                originalPrice: giftSetInfo.originalPrice,
                currentPrice: giftSetInfo.currentPrice,
                stockQuantity: giftSetInfo.stock,
                isDefault: true,
                isActive: true,
                attributes: JSON.stringify({ 
                  contents: giftSetContents,
                  packaging: packaging,
                  type: 'gift_set'
                })
              }
            ]
          }
        }
      })
      
      createdCount++
      console.log(`✅ Created gift set ${createdCount}: ${giftSet.name}`)
    }
    
    console.log(`🎉 Successfully created ${createdCount} luxury gift sets!`)
    
    // Display summary
    const totalGiftSets = await prisma.wine.count({
      where: { category: 'Gift Set' }
    })
    const totalValue = await prisma.wine.aggregate({
      where: { category: 'Gift Set' },
      _sum: { originalPrice: true, currentPrice: true }
    })
    
    console.log(`📊 Gift Sets Summary:`)
    console.log(`   Total gift sets: ${totalGiftSets}`)
    console.log(`   Total original value: $${totalValue._sum.originalPrice?.toFixed(2) || '0.00'}`)
    console.log(`   Total current value: $${totalValue._sum.currentPrice?.toFixed(2) || '0.00'}`)
    console.log(`   Average discount: 80%`)
    console.log(`   Price range: $499 - $799`)
    
  } catch (error) {
    console.error('❌ Error populating luxury gift sets:', error)
    throw error
  }
}

// Run the population script
populateLuxuryGiftSets()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })