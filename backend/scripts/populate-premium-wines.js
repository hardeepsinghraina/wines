const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Premium wine data with 80% discount structure
const premiumWines = [
  // Bordeaux Collection
  {
    name: 'Château Pétrus 2016',
    producer: 'Château Pétrus',
    region: 'Pomerol, Bordeaux, France',
    appellation: 'Pomerol AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'One of the most prestigious and sought-after wines in the world, Château Pétrus represents the pinnacle of Bordeaux excellence. This legendary estate produces wines of extraordinary depth, complexity, and aging potential from its unique terroir of blue clay soils.',
    tastingNotes: 'Intense aromas of dark plum, blackberry, and truffle with hints of violet and exotic spices. The palate reveals layers of concentrated fruit, velvety tannins, and a mineral backbone that leads to an exceptionally long, elegant finish.',
    alcoholContent: 14.5,
    bottleSize: '750ml',
    sku: 'CP-2016-750',
    originalPrice: 3995.00,
    currentPrice: 799.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 12,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Blue clay soils with iron oxide deposits',
    winemaker: 'Olivier Berrouet',
    estate: 'Château Pétrus',
    classification: 'Pomerol AOC',
    servingTemp: '16-18°C',
    agingPotential: '30-50 years',
    harvestDate: new Date('2016-09-15'),
    bottlingDate: new Date('2018-06-20'),
    releaseDate: new Date('2019-03-15'),
    specifications: {
      grapeVariety: ['Merlot 95%', 'Cabernet Franc 5%'],
      ph: 3.65,
      residualSugar: 2.1,
      tannins: 'High',
      acidity: 'Medium+',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Heavy',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Wagyu beef, truffle dishes, aged Roquefort cheese, dark chocolate desserts',
      awards: ['Robert Parker 100 points', 'Wine Spectator 99 points', 'Jancis Robinson 20/20']
    },
    images: [
      {
        url: '/images/wines/chateau-petrus-2016.jpg',
        altText: 'Château Pétrus 2016 bottle with estate label',
        isPrimary: true,
        sortOrder: 0,
        type: 'PRODUCT'
      }
    ],
    variants: [
      { bottleSize: '750ml', originalPrice: 3995.00, currentPrice: 799.00, stockQuantity: 12, isDefault: true },
      { bottleSize: '1.5L', originalPrice: 7990.00, currentPrice: 1598.00, stockQuantity: 3, isDefault: false }
    ],
    awards: [
      {
        name: 'Robert Parker Wine Advocate',
        title: 'Perfect Score',
        score: 100,
        maxScore: 100,
        year: 2019,
        level: 'Perfect',
        awardingBody: 'Robert Parker Wine Advocate'
      }
    ]
  },
  {
    name: 'Château Le Pin 2015',
    producer: 'Château Le Pin',
    region: 'Pomerol, Bordeaux, France',
    appellation: 'Pomerol AOC',
    vintage: 2015,
    category: 'Red Wine',
    description: 'From one of the smallest and most exclusive estates in Bordeaux, Château Le Pin produces wines of extraordinary elegance and refinement. This boutique winery crafts wines that combine power with finesse, representing the ultimate expression of Pomerol terroir.',
    tastingNotes: 'Captivating bouquet of ripe blackcurrant, cherry liqueur, and rose petals with subtle oak spices. The palate is silky and voluptuous, displaying remarkable concentration and purity with a seamless integration of fruit, tannins, and acidity.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'CLP-2015-750',
    originalPrice: 3495.00,
    currentPrice: 699.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 8,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Gravel and clay soils with iron deposits',
    winemaker: 'Jacques Thienpont',
    estate: 'Château Le Pin',
    classification: 'Pomerol AOC',
    servingTemp: '16-18°C',
    agingPotential: '25-40 years',
    specifications: {
      grapeVariety: ['Merlot 92%', 'Cabernet Franc 8%'],
      ph: 3.58,
      residualSugar: 1.8,
      tannins: 'Medium+',
      acidity: 'Medium',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Medium',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Lamb with herbs, duck confit, mature cheeses, chocolate tart',
      awards: ['Wine Spectator 98 points', 'Decanter 97 points', 'James Suckling 99 points']
    }
  },
  {
    name: 'Château Lafleur 2016',
    producer: 'Château Lafleur',
    region: 'Pomerol, Bordeaux, France',
    appellation: 'Pomerol AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'A legendary estate producing some of the most sought-after wines in Pomerol. Château Lafleur combines traditional winemaking with meticulous attention to detail, creating wines of exceptional complexity and longevity that showcase the unique terroir of this prestigious appellation.',
    tastingNotes: 'Complex aromatics of dark berries, violets, graphite, and exotic spices. The palate reveals extraordinary depth with layers of concentrated fruit, refined tannins, and a mineral precision that builds to an incredibly long, sophisticated finish.',
    alcoholContent: 14.5,
    bottleSize: '750ml',
    sku: 'CLF-2016-750',
    originalPrice: 2995.00,
    currentPrice: 599.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 15,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Gravel plateau with clay subsoil',
    winemaker: 'Baptiste Guinaudeau',
    estate: 'Château Lafleur',
    classification: 'Pomerol AOC',
    servingTemp: '16-18°C',
    agingPotential: '30-45 years',
    specifications: {
      grapeVariety: ['Merlot 50%', 'Cabernet Franc 50%'],
      ph: 3.62,
      residualSugar: 2.0,
      tannins: 'High',
      acidity: 'Medium+',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Medium+',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Grilled red meats, game birds, aged cheeses, dark chocolate',
      awards: ['Robert Parker 98 points', 'Wine Advocate 97 points', 'Vinous 98 points']
    }
  },
  {
    name: 'Château Cheval Blanc 2016',
    producer: 'Château Cheval Blanc',
    region: 'Saint-Émilion, Bordeaux, France',
    appellation: 'Saint-Émilion Grand Cru AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'A Premier Grand Cru Classé A estate that represents the pinnacle of Saint-Émilion excellence. Château Cheval Blanc produces wines of extraordinary elegance and complexity, combining power with finesse in a style that is uniquely its own.',
    tastingNotes: 'Magnificent bouquet of cassis, blueberry, violet, and cedar with hints of tobacco and graphite. The palate is beautifully structured with silky tannins, vibrant acidity, and layers of concentrated fruit leading to an exceptionally long, refined finish.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'CCB-2016-750',
    originalPrice: 2795.00,
    currentPrice: 559.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 20,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Gravel and sand soils with clay subsoil',
    winemaker: 'Pierre-Olivier Clouet',
    estate: 'Château Cheval Blanc',
    classification: 'Saint-Émilion Premier Grand Cru Classé A',
    servingTemp: '16-18°C',
    agingPotential: '25-40 years',
    specifications: {
      grapeVariety: ['Cabernet Franc 52%', 'Merlot 43%', 'Cabernet Sauvignon 5%'],
      ph: 3.60,
      residualSugar: 1.9,
      tannins: 'Medium+',
      acidity: 'Medium+',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Medium',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Roasted lamb, beef tenderloin, mushroom dishes, aged Comté cheese',
      awards: ['Wine Spectator 97 points', 'Robert Parker 96 points', 'Decanter 98 points']
    }
  },
  {
    name: 'Château Ausone 2015',
    producer: 'Château Ausone',
    region: 'Saint-Émilion, Bordeaux, France',
    appellation: 'Saint-Émilion Grand Cru AOC',
    vintage: 2015,
    category: 'Red Wine',
    description: 'One of only four Premier Grand Cru Classé A estates in Saint-Émilion, Château Ausone produces wines of legendary status. Located on the limestone plateau, this historic estate crafts wines of extraordinary finesse and aging potential.',
    tastingNotes: 'Ethereal aromas of red and black fruits, violets, minerals, and subtle spices. The palate reveals incredible precision and elegance with fine-grained tannins, vibrant acidity, and a mineral backbone that extends through the exceptionally long finish.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'CA-2015-750',
    originalPrice: 2695.00,
    currentPrice: 539.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 18,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Limestone plateau with clay-limestone soils',
    winemaker: 'Pauline Vauthier',
    estate: 'Château Ausone',
    classification: 'Saint-Émilion Premier Grand Cru Classé A',
    servingTemp: '16-18°C',
    agingPotential: '30-50 years',
    specifications: {
      grapeVariety: ['Cabernet Franc 55%', 'Merlot 45%'],
      ph: 3.55,
      residualSugar: 1.7,
      tannins: 'Medium+',
      acidity: 'High',
      body: 'Medium+',
      finish: 'Very Long',
      oakTreatment: 'Light',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Venison, duck breast, truffle dishes, aged Gruyère',
      awards: ['Jancis Robinson 19/20', 'Wine Advocate 97 points', 'Vinous 96 points']
    }
  },

  // Burgundy Collection
  {
    name: 'Domaine de la Romanée-Conti La Tâche 2017',
    producer: 'Domaine de la Romanée-Conti',
    region: 'Côte de Nuits, Burgundy, France',
    appellation: 'La Tâche Grand Cru AOC',
    vintage: 2017,
    category: 'Red Wine',
    description: 'From the most prestigious domaine in Burgundy, La Tâche represents the pinnacle of Pinot Noir expression. This monopole vineyard produces wines of extraordinary complexity and elegance that are considered among the greatest wines in the world.',
    tastingNotes: 'Sublime aromatics of red cherry, rose petals, forest floor, and exotic spices with hints of tea and incense. The palate is ethereal yet powerful, displaying remarkable depth and precision with silky tannins and a finish that seems to last forever.',
    alcoholContent: 13.0,
    bottleSize: '750ml',
    sku: 'DRC-LT-2017-750',
    originalPrice: 3895.00,
    currentPrice: 779.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 6,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Limestone and clay soils with perfect south-east exposure',
    winemaker: 'Bertrand de Villaine & Aubert de Villaine',
    estate: 'Domaine de la Romanée-Conti',
    classification: 'Grand Cru',
    servingTemp: '14-16°C',
    agingPotential: '25-40 years',
    specifications: {
      grapeVariety: ['Pinot Noir 100%'],
      ph: 3.45,
      residualSugar: 1.2,
      tannins: 'Medium',
      acidity: 'High',
      body: 'Medium+',
      finish: 'Exceptional',
      oakTreatment: 'Light',
      malolacticFermentation: true,
      servingTemp: '14-16°C',
      foodPairing: 'Roasted duck, wild mushrooms, aged Époisses cheese, truffle dishes',
      awards: ['Robert Parker 97 points', 'Burghound 95 points', 'Wine Spectator 96 points']
    }
  },
  {
    name: 'Domaine Leroy Musigny Grand Cru 2016',
    producer: 'Domaine Leroy',
    region: 'Côte de Nuits, Burgundy, France',
    appellation: 'Musigny Grand Cru AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'From the legendary Lalou Bize-Leroy, this Musigny represents biodynamic winemaking at its finest. Known for producing some of the most concentrated and age-worthy Burgundies, Domaine Leroy crafts wines of extraordinary purity and terroir expression.',
    tastingNotes: 'Intensely perfumed with aromas of red berries, violets, rose petals, and exotic spices. The palate reveals incredible concentration and elegance with fine-grained tannins, vibrant acidity, and layers of complexity that unfold beautifully.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'DL-MUS-2016-750',
    originalPrice: 3695.00,
    currentPrice: 739.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 4,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Limestone and marl soils with optimal exposure',
    winemaker: 'Lalou Bize-Leroy',
    estate: 'Domaine Leroy',
    classification: 'Grand Cru',
    servingTemp: '14-16°C',
    agingPotential: '30-45 years',
    specifications: {
      grapeVariety: ['Pinot Noir 100%'],
      ph: 3.42,
      residualSugar: 1.1,
      tannins: 'Medium+',
      acidity: 'High',
      body: 'Medium+',
      finish: 'Very Long',
      oakTreatment: 'Light',
      malolacticFermentation: true,
      servingTemp: '14-16°C',
      foodPairing: 'Game birds, wild boar, aged Burgundy cheeses, mushroom risotto',
      awards: ['Burghound 96 points', 'Wine Advocate 95 points', 'Decanter 97 points']
    }
  },
  {
    name: 'Domaine Armand Rousseau Chambertin 2017',
    producer: 'Domaine Armand Rousseau',
    region: 'Côte de Nuits, Burgundy, France',
    appellation: 'Chambertin Grand Cru AOC',
    vintage: 2017,
    category: 'Red Wine',
    description: 'From one of Burgundy\'s most respected producers, this Chambertin represents the "King of Wines" at its finest. The Rousseau family has been crafting exceptional Burgundies for generations, producing wines of remarkable consistency and terroir expression.',
    tastingNotes: 'Magnificent bouquet of dark cherries, blackberries, earth, and spices with hints of leather and game. The palate is powerful yet elegant, displaying remarkable depth and structure with velvety tannins and a long, complex finish.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'DAR-CHAM-2017-750',
    originalPrice: 2995.00,
    currentPrice: 599.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 12,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Limestone and clay soils with perfect south-east exposure',
    winemaker: 'Eric Rousseau',
    estate: 'Domaine Armand Rousseau',
    classification: 'Grand Cru',
    servingTemp: '14-16°C',
    agingPotential: '25-35 years',
    specifications: {
      grapeVariety: ['Pinot Noir 100%'],
      ph: 3.48,
      residualSugar: 1.3,
      tannins: 'Medium+',
      acidity: 'Medium+',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Medium',
      malolacticFermentation: true,
      servingTemp: '14-16°C',
      foodPairing: 'Beef bourguignon, roasted lamb, aged Comté, dark chocolate',
      awards: ['Wine Spectator 95 points', 'Robert Parker 94 points', 'Burghound 94 points']
    }
  },

  // Champagne Collection
  {
    name: 'Dom Pérignon P3 2002',
    producer: 'Moët & Chandon',
    region: 'Épernay, Champagne, France',
    appellation: 'Champagne AOC',
    vintage: 2002,
    category: 'Champagne',
    description: 'The third plénitude of Dom Pérignon 2002, representing the ultimate expression of this legendary vintage. After extended aging on lees, this champagne has reached its third peak of maturity, displaying extraordinary complexity and depth.',
    tastingNotes: 'Complex aromas of brioche, honey, dried fruits, and toasted nuts with hints of smoke and minerals. The palate is rich and creamy with fine bubbles, displaying remarkable depth and a long, sophisticated finish with notes of citrus and spice.',
    alcoholContent: 12.5,
    bottleSize: '750ml',
    sku: 'DP-P3-2002-750',
    originalPrice: 2495.00,
    currentPrice: 499.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 24,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Chalk soils from premier and grand cru vineyards',
    winemaker: 'Vincent Chaperon',
    estate: 'Dom Pérignon',
    classification: 'Champagne AOC',
    servingTemp: '8-10°C',
    agingPotential: '10-15 years',
    specifications: {
      grapeVariety: ['Chardonnay 50%', 'Pinot Noir 50%'],
      ph: 3.10,
      residualSugar: 6.0,
      tannins: 'N/A',
      acidity: 'High',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'None',
      malolacticFermentation: false,
      servingTemp: '8-10°C',
      foodPairing: 'Caviar, lobster, foie gras, aged Parmesan, white truffle dishes',
      awards: ['Wine Spectator 97 points', 'Robert Parker 95 points', 'Decanter 96 points']
    }
  },
  {
    name: 'Krug Clos du Mesnil 2008',
    producer: 'Krug',
    region: 'Reims, Champagne, France',
    appellation: 'Champagne AOC',
    vintage: 2008,
    category: 'Champagne',
    description: 'From Krug\'s legendary walled vineyard, Clos du Mesnil represents the pinnacle of Chardonnay expression in Champagne. This single-vineyard champagne showcases the unique terroir of Le Mesnil-sur-Oger with extraordinary precision and elegance.',
    tastingNotes: 'Sublime aromatics of citrus zest, white flowers, brioche, and minerals with hints of honey and spice. The palate is incredibly refined with persistent bubbles, vibrant acidity, and layers of complexity that build to an exceptionally long, pure finish.',
    alcoholContent: 12.0,
    bottleSize: '750ml',
    sku: 'KRUG-CDM-2008-750',
    originalPrice: 2795.00,
    currentPrice: 559.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 18,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Pure chalk soils in walled vineyard',
    winemaker: 'Julie Cavil',
    estate: 'Krug',
    classification: 'Champagne AOC',
    servingTemp: '8-10°C',
    agingPotential: '15-20 years',
    specifications: {
      grapeVariety: ['Chardonnay 100%'],
      ph: 3.05,
      residualSugar: 5.5,
      tannins: 'N/A',
      acidity: 'Very High',
      body: 'Medium+',
      finish: 'Exceptional',
      oakTreatment: 'Light',
      malolacticFermentation: false,
      servingTemp: '8-10°C',
      foodPairing: 'Oysters, sea urchin, aged Comté, delicate fish dishes',
      awards: ['Wine Advocate 96 points', 'Wine Spectator 95 points', 'Jancis Robinson 18.5/20']
    }
  },

  // Rhône Valley Collection
  {
    name: 'E. Guigal La Mouline 2016',
    producer: 'E. Guigal',
    region: 'Côte-Rôtie, Northern Rhône, France',
    appellation: 'Côte-Rôtie AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'From the legendary La-La-La trilogy, La Mouline represents the epitome of Côte-Rôtie excellence. This single-vineyard Syrah showcases the unique terroir of the steep slopes with extraordinary elegance and complexity.',
    tastingNotes: 'Captivating aromas of blackberry, violet, bacon fat, and exotic spices with hints of olive tapenade and roasted herbs. The palate is rich and voluptuous with silky tannins, vibrant acidity, and a long, complex finish.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'EG-LM-2016-750',
    originalPrice: 2595.00,
    currentPrice: 519.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 15,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Steep schist slopes with south-facing exposure',
    winemaker: 'Philippe Guigal',
    estate: 'E. Guigal',
    classification: 'Côte-Rôtie AOC',
    servingTemp: '16-18°C',
    agingPotential: '20-30 years',
    specifications: {
      grapeVariety: ['Syrah 89%', 'Viognier 11%'],
      ph: 3.55,
      residualSugar: 2.2,
      tannins: 'Medium+',
      acidity: 'Medium+',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Heavy',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Grilled lamb, wild boar, aged cheeses, dark chocolate',
      awards: ['Robert Parker 98 points', 'Wine Spectator 96 points', 'Decanter 97 points']
    }
  },

  // World Wines Collection
  {
    name: 'Screaming Eagle Cabernet Sauvignon 2017',
    producer: 'Screaming Eagle',
    region: 'Napa Valley, California, USA',
    appellation: 'Napa Valley AVA',
    vintage: 2017,
    category: 'Red Wine',
    description: 'One of California\'s most iconic and sought-after wines, Screaming Eagle represents the pinnacle of Napa Valley Cabernet Sauvignon. This cult wine combines power with elegance, showcasing the unique terroir of the Oakville AVA.',
    tastingNotes: 'Intense aromas of cassis, blackberry, cedar, and graphite with hints of violet and exotic spices. The palate is powerful yet refined, displaying remarkable concentration and structure with velvety tannins and a long, sophisticated finish.',
    alcoholContent: 15.0,
    bottleSize: '750ml',
    sku: 'SE-CS-2017-750',
    originalPrice: 3295.00,
    currentPrice: 659.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 10,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Gravelly loam soils with excellent drainage',
    winemaker: 'Nick Gislason',
    estate: 'Screaming Eagle',
    classification: 'Napa Valley AVA',
    servingTemp: '16-18°C',
    agingPotential: '20-30 years',
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 76%', 'Merlot 20%', 'Cabernet Franc 4%'],
      ph: 3.68,
      residualSugar: 2.5,
      tannins: 'High',
      acidity: 'Medium+',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Heavy',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Prime ribeye, lamb rack, aged cheddar, dark chocolate truffles',
      awards: ['Robert Parker 97 points', 'Wine Spectator 95 points', 'James Suckling 98 points']
    }
  },
  {
    name: 'Harlan Estate 2016',
    producer: 'Harlan Estate',
    region: 'Napa Valley, California, USA',
    appellation: 'Napa Valley AVA',
    vintage: 2016,
    category: 'Red Wine',
    description: 'From the visionary Bill Harlan, this estate represents the American pursuit of creating a First Growth equivalent. Located in the hills west of Oakville, Harlan Estate produces wines of extraordinary depth and complexity.',
    tastingNotes: 'Complex aromatics of dark berries, cassis, cedar, tobacco, and graphite with hints of violet and exotic spices. The palate reveals incredible depth and structure with concentrated fruit, refined tannins, and a finish that seems to last forever.',
    alcoholContent: 14.8,
    bottleSize: '750ml',
    sku: 'HE-2016-750',
    originalPrice: 2895.00,
    currentPrice: 579.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 14,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    terroir: 'Hillside vineyards with diverse soil types',
    winemaker: 'Cory Empting',
    estate: 'Harlan Estate',
    classification: 'Napa Valley AVA',
    servingTemp: '16-18°C',
    agingPotential: '25-35 years',
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 70%', 'Merlot 20%', 'Cabernet Franc 8%', 'Petit Verdot 2%'],
      ph: 3.65,
      residualSugar: 2.3,
      tannins: 'High',
      acidity: 'Medium+',
      body: 'Full',
      finish: 'Very Long',
      oakTreatment: 'Heavy',
      malolacticFermentation: true,
      servingTemp: '16-18°C',
      foodPairing: 'Wagyu beef, venison, aged Stilton, dark chocolate desserts',
      awards: ['Wine Advocate 96 points', 'Wine Spectator 94 points', 'Vinous 97 points']
    }
  }
]

// Additional wines to reach 50+ total
const additionalWines = [
  // More Bordeaux
  {
    name: 'Château Margaux 2016',
    producer: 'Château Margaux',
    region: 'Margaux, Bordeaux, France',
    appellation: 'Margaux AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'The epitome of elegance and finesse in Bordeaux, Château Margaux produces wines of extraordinary grace and complexity. This First Growth estate combines power with elegance in a style that is uniquely Margaux.',
    tastingNotes: 'Sublime aromas of blackcurrant, violet, cedar, and graphite with hints of tobacco and spice. The palate is elegant and refined with silky tannins, vibrant acidity, and a long, sophisticated finish.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'CM-2016-750',
    originalPrice: 2695.00,
    currentPrice: 539.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 25,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 85%', 'Merlot 10%', 'Petit Verdot 3%', 'Cabernet Franc 2%'],
      servingTemp: '16-18°C',
      foodPairing: 'Lamb, beef, aged cheeses, dark chocolate',
      awards: ['Robert Parker 96 points', 'Wine Spectator 95 points']
    }
  },
  {
    name: 'Château Latour 2015',
    producer: 'Château Latour',
    region: 'Pauillac, Bordeaux, France',
    appellation: 'Pauillac AOC',
    vintage: 2015,
    category: 'Red Wine',
    description: 'The most powerful and long-lived of the First Growths, Château Latour produces wines of legendary status and aging potential. This iconic estate represents the pinnacle of Pauillac expression.',
    tastingNotes: 'Intense aromas of cassis, cedar, graphite, and tobacco with hints of violet and exotic spices. The palate is powerful and structured with concentrated fruit, firm tannins, and exceptional length.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'CLT-2015-750',
    originalPrice: 2795.00,
    currentPrice: 559.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 22,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 97%', 'Merlot 2.5%', 'Petit Verdot 0.5%'],
      servingTemp: '16-18°C',
      foodPairing: 'Red meat, game, aged cheeses',
      awards: ['Wine Advocate 97 points', 'Wine Spectator 96 points']
    }
  },
  {
    name: 'Château Haut-Brion 2016',
    producer: 'Château Haut-Brion',
    region: 'Pessac-Léognan, Bordeaux, France',
    appellation: 'Pessac-Léognan AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'The oldest of the First Growths and the only one outside the Médoc, Château Haut-Brion produces wines of unique character and exceptional elegance from its urban vineyard in Pessac.',
    tastingNotes: 'Complex aromas of dark berries, tobacco, cedar, and earth with hints of smoke and minerals. The palate is elegant and refined with silky tannins and a long, sophisticated finish.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'CHB-2016-750',
    originalPrice: 2595.00,
    currentPrice: 519.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 28,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Merlot 50%', 'Cabernet Sauvignon 44%', 'Cabernet Franc 6%'],
      servingTemp: '16-18°C',
      foodPairing: 'Roasted meats, mushroom dishes, aged cheeses',
      awards: ['Robert Parker 95 points', 'Wine Spectator 94 points']
    }
  },
  {
    name: 'Château Mouton Rothschild 2016',
    producer: 'Château Mouton Rothschild',
    region: 'Pauillac, Bordeaux, France',
    appellation: 'Pauillac AOC',
    vintage: 2016,
    category: 'Red Wine',
    description: 'Famous for its artistic labels and exceptional wines, Château Mouton Rothschild represents the artistic side of Bordeaux. This First Growth estate produces wines of power and elegance.',
    tastingNotes: 'Rich aromas of cassis, blackberry, cedar, and graphite with hints of violet and spice. The palate is powerful yet elegant with concentrated fruit and refined tannins.',
    alcoholContent: 13.0,
    bottleSize: '750ml',
    sku: 'CMR-2016-750',
    originalPrice: 2495.00,
    currentPrice: 499.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 30,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 83%', 'Merlot 15%', 'Cabernet Franc 2%'],
      servingTemp: '16-18°C',
      foodPairing: 'Lamb, beef, game, aged cheeses',
      awards: ['Wine Advocate 94 points', 'Wine Spectator 93 points']
    }
  }
]

// Combine all wines
const allWines = [...premiumWines, ...additionalWines]

async function populatePremiumWines() {
  console.log('🍷 Starting premium wine population...')
  
  try {
    let createdCount = 0
    
    for (const wineData of allWines) {
      const { specifications, images, variants, awards, ...wineInfo } = wineData
      
      // Generate unique SKU if not provided
      if (!wineInfo.sku) {
        wineInfo.sku = `WINE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
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
          // Create wine images if provided
          ...(images && {
            images: {
              create: images.map((img, index) => ({
                url: img.url,
                altText: img.altText || `${wineInfo.name} image`,
                isPrimary: img.isPrimary || index === 0,
                sortOrder: img.sortOrder || index,
                type: img.type || 'PRODUCT',
                isActive: true
              }))
            }
          }),
          // Create wine variants if provided
          ...(variants && {
            variants: {
              create: variants.map((variant, index) => ({
                name: `${wineInfo.name} - ${variant.bottleSize}`,
                sku: `${wineInfo.sku}-${variant.bottleSize.replace(/[^a-zA-Z0-9]/g, '')}`,
                bottleSize: variant.bottleSize,
                originalPrice: variant.originalPrice,
                currentPrice: variant.currentPrice,
                stockQuantity: variant.stockQuantity,
                isDefault: variant.isDefault || index === 0,
                isActive: true,
                attributes: JSON.stringify({ size: variant.bottleSize })
              }))
            }
          })
        }
      })
      
      // Create awards separately if provided
      if (awards && awards.length > 0) {
        for (const award of awards) {
          await prisma.productAward.create({
            data: {
              wineId: wine.id,
              name: award.name,
              title: award.title,
              awardingBody: award.awardingBody,
              year: award.year,
              score: award.score,
              maxScore: award.maxScore,
              level: award.level,
              isActive: true,
              isVerified: true
            }
          })
        }
      }
      
      createdCount++
      console.log(`✅ Created wine ${createdCount}: ${wine.name}`)
    }
    
    console.log(`🎉 Successfully created ${createdCount} premium wines!`)
    
    // Display summary
    const totalWines = await prisma.wine.count()
    const totalValue = await prisma.wine.aggregate({
      _sum: { originalPrice: true, currentPrice: true }
    })
    
    console.log(`📊 Database Summary:`)
    console.log(`   Total wines: ${totalWines}`)
    console.log(`   Total original value: €${totalValue._sum.originalPrice?.toFixed(2) || '0.00'}`)
    console.log(`   Total current value: €${totalValue._sum.currentPrice?.toFixed(2) || '0.00'}`)
    console.log(`   Average discount: 80%`)
    
  } catch (error) {
    console.error('❌ Error populating premium wines:', error)
    throw error
  }
}

// Run the population script
populatePremiumWines()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Additional premium wines to reach 50+ total (continuing from line 400+)
const moreWines = [
  // More Burgundy
  {
    name: 'Domaine Henri Jayer Vosne-Romanée Cros Parantoux 2015',
    producer: 'Domaine Henri Jayer',
    region: 'Côte de Nuits, Burgundy, France',
    appellation: 'Vosne-Romanée Premier Cru AOC',
    vintage: 2015,
    category: 'Red Wine',
    description: 'From the legendary Henri Jayer estate, this Cros Parantoux represents one of the most sought-after Burgundies in the world. The vineyard was planted by Henri Jayer himself and produces wines of extraordinary depth and complexity.',
    tastingNotes: 'Ethereal aromas of red cherry, rose petals, forest floor, and exotic spices. The palate is silky and profound with incredible depth, fine-grained tannins, and a finish that seems to last forever.',
    alcoholContent: 13.0,
    bottleSize: '750ml',
    sku: 'DHJ-VR-CP-2015-750',
    originalPrice: 3795.00,
    currentPrice: 759.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 3,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Pinot Noir 100%'],
      servingTemp: '14-16°C',
      foodPairing: 'Duck breast, wild mushrooms, aged Burgundy cheeses',
      awards: ['Burghound 97 points', 'Wine Advocate 96 points']
    }
  },
  {
    name: 'Domaine Georges Roumier Musigny 2017',
    producer: 'Domaine Georges Roumier',
    region: 'Côte de Nuits, Burgundy, France',
    appellation: 'Musigny Grand Cru AOC',
    vintage: 2017,
    category: 'Red Wine',
    description: 'From one of Burgundy\'s most respected producers, this Musigny showcases the elegance and finesse that makes this Grand Cru so special. The Roumier family has been crafting exceptional Burgundies for generations.',
    tastingNotes: 'Sublime aromatics of red berries, violets, and spices with hints of earth and minerals. The palate is elegant and refined with silky tannins, vibrant acidity, and exceptional length.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'DGR-MUS-2017-750',
    originalPrice: 3295.00,
    currentPrice: 659.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 6,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Pinot Noir 100%'],
      servingTemp: '14-16°C',
      foodPairing: 'Game birds, truffle dishes, aged cheeses',
      awards: ['Wine Spectator 96 points', 'Burghound 95 points']
    }
  },
  {
    name: 'Domaine Coche-Dury Corton-Charlemagne 2017',
    producer: 'Domaine Coche-Dury',
    region: 'Côte de Beaune, Burgundy, France',
    appellation: 'Corton-Charlemagne Grand Cru AOC',
    vintage: 2017,
    category: 'White Wine',
    description: 'From the legendary Jean-François Coche-Dury, this Corton-Charlemagne represents the pinnacle of white Burgundy. Known for producing some of the most sought-after Chardonnays in the world.',
    tastingNotes: 'Complex aromas of citrus, white flowers, minerals, and subtle oak. The palate is rich and concentrated with vibrant acidity, layers of complexity, and an incredibly long, pure finish.',
    alcoholContent: 13.0,
    bottleSize: '750ml',
    sku: 'DCD-CC-2017-750',
    originalPrice: 2995.00,
    currentPrice: 599.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 8,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Chardonnay 100%'],
      servingTemp: '12-14°C',
      foodPairing: 'Lobster, foie gras, aged Comté cheese, white truffle dishes',
      awards: ['Burghound 96 points', 'Wine Advocate 95 points']
    }
  },

  // More Champagne
  {
    name: 'Salon Le Mesnil Blanc de Blancs 2008',
    producer: 'Salon',
    region: 'Le Mesnil-sur-Oger, Champagne, France',
    appellation: 'Champagne AOC',
    vintage: 2008,
    category: 'Champagne',
    description: 'From the legendary single-vineyard Champagne house, Salon produces only in exceptional years. This Blanc de Blancs represents the ultimate expression of Chardonnay from Le Mesnil-sur-Oger.',
    tastingNotes: 'Intense aromas of citrus, white flowers, brioche, and minerals. The palate is incredibly pure and precise with fine bubbles, vibrant acidity, and an exceptionally long, mineral finish.',
    alcoholContent: 12.0,
    bottleSize: '750ml',
    sku: 'SALON-2008-750',
    originalPrice: 2695.00,
    currentPrice: 539.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 15,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Chardonnay 100%'],
      servingTemp: '8-10°C',
      foodPairing: 'Caviar, oysters, sea urchin, aged Parmesan',
      awards: ['Wine Spectator 97 points', 'Robert Parker 96 points']
    }
  },
  {
    name: 'Jacques Selosse Substance Blanc de Blancs NV',
    producer: 'Jacques Selosse',
    region: 'Avize, Champagne, France',
    appellation: 'Champagne AOC',
    vintage: 0, // NV
    category: 'Champagne',
    description: 'From the revolutionary Anselme Selosse, this Substance represents a new approach to Champagne making. Using a solera system, this wine showcases incredible complexity and depth.',
    tastingNotes: 'Complex aromas of nuts, honey, brioche, and oxidative notes. The palate is rich and textured with fine bubbles, incredible depth, and a long, complex finish.',
    alcoholContent: 12.5,
    bottleSize: '750ml',
    sku: 'JS-SUB-NV-750',
    originalPrice: 2495.00,
    currentPrice: 499.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 20,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Chardonnay 100%'],
      servingTemp: '10-12°C',
      foodPairing: 'Aged cheeses, nuts, foie gras, rich fish dishes',
      awards: ['Wine Advocate 94 points', 'Decanter 95 points']
    }
  },

  // Italian Wines
  {
    name: 'Ornellaia 2017',
    producer: 'Tenuta dell\'Ornellaia',
    region: 'Bolgheri, Tuscany, Italy',
    appellation: 'Bolgheri Superiore DOC',
    vintage: 2017,
    category: 'Red Wine',
    description: 'One of Italy\'s most prestigious Super Tuscans, Ornellaia represents the pinnacle of Tuscan winemaking. This Bordeaux-style blend showcases the unique terroir of the Bolgheri coast.',
    tastingNotes: 'Elegant aromas of cassis, blackberry, cedar, and Mediterranean herbs. The palate is rich and structured with velvety tannins, vibrant acidity, and a long, sophisticated finish.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'ORN-2017-750',
    originalPrice: 2595.00,
    currentPrice: 519.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 25,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 56%', 'Merlot 27%', 'Petit Verdot 10%', 'Cabernet Franc 7%'],
      servingTemp: '16-18°C',
      foodPairing: 'Tuscan beef, wild boar, aged Pecorino, dark chocolate',
      awards: ['Wine Spectator 95 points', 'James Suckling 96 points']
    }
  },
  {
    name: 'Sassicaia 2017',
    producer: 'Tenuta San Guido',
    region: 'Bolgheri, Tuscany, Italy',
    appellation: 'Bolgheri Sassicaia DOC',
    vintage: 2017,
    category: 'Red Wine',
    description: 'The original Super Tuscan that started the movement, Sassicaia is a legendary wine that combines Bordeaux varieties with Tuscan terroir. This wine has its own DOC designation.',
    tastingNotes: 'Classic aromas of cassis, cedar, tobacco, and graphite with hints of Mediterranean herbs. The palate is elegant and refined with structured tannins and exceptional length.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'SASS-2017-750',
    originalPrice: 2395.00,
    currentPrice: 479.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 30,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 85%', 'Cabernet Franc 15%'],
      servingTemp: '16-18°C',
      foodPairing: 'Grilled meats, game, aged cheeses, truffle dishes',
      awards: ['Wine Advocate 94 points', 'Wine Spectator 93 points']
    }
  },
  {
    name: 'Barolo Brunate Giuseppe Rinaldi 2016',
    producer: 'Giuseppe Rinaldi',
    region: 'Piedmont, Italy',
    appellation: 'Barolo DOCG',
    vintage: 2016,
    category: 'Red Wine',
    description: 'From one of Barolo\'s most traditional producers, this Brunate showcases the elegance and power of Nebbiolo from one of the region\'s greatest vineyards.',
    tastingNotes: 'Complex aromas of red cherry, rose petals, tar, and earth with hints of leather and spice. The palate is powerful yet elegant with firm tannins and exceptional aging potential.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'GR-BAR-BRU-2016-750',
    originalPrice: 2295.00,
    currentPrice: 459.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 18,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Nebbiolo 100%'],
      servingTemp: '16-18°C',
      foodPairing: 'Truffle dishes, braised meats, aged Gorgonzola',
      awards: ['Wine Advocate 95 points', 'Vinous 94 points']
    }
  },

  // German Wines
  {
    name: 'Egon Müller Scharzhofberger Riesling TBA 2017',
    producer: 'Egon Müller',
    region: 'Mosel, Germany',
    appellation: 'Mosel VDP.Grosse Lage',
    vintage: 2017,
    category: 'White Wine',
    description: 'From Germany\'s most prestigious producer, this Trockenbeerenauslese represents the pinnacle of sweet Riesling. Made only in exceptional years from botrytis-affected grapes.',
    tastingNotes: 'Intense aromas of honey, apricot, citrus, and minerals with incredible complexity. The palate is rich and concentrated with perfect balance between sweetness and acidity.',
    alcoholContent: 7.5,
    bottleSize: '375ml',
    sku: 'EM-SCHAR-TBA-2017-375',
    originalPrice: 2795.00,
    currentPrice: 559.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 12,
    isActive: true,
    isFeatured: true,
    isLimitedEdition: true,
    specifications: {
      grapeVariety: ['Riesling 100%'],
      servingTemp: '8-10°C',
      foodPairing: 'Foie gras, blue cheese, fruit desserts, alone as dessert',
      awards: ['Wine Advocate 98 points', 'Wine Spectator 97 points']
    }
  },

  // Spanish Wines
  {
    name: 'Vega Sicilia Único 2010',
    producer: 'Bodegas Vega Sicilia',
    region: 'Ribera del Duero, Spain',
    appellation: 'Ribera del Duero DO',
    vintage: 2010,
    category: 'Red Wine',
    description: 'Spain\'s most legendary wine, Vega Sicilia Único represents the pinnacle of Spanish winemaking. This wine undergoes extended aging and is only released when perfectly mature.',
    tastingNotes: 'Complex aromas of dark berries, cedar, tobacco, and spices with hints of leather and earth. The palate is powerful and elegant with refined tannins and exceptional length.',
    alcoholContent: 14.0,
    bottleSize: '750ml',
    sku: 'VS-UN-2010-750',
    originalPrice: 2495.00,
    currentPrice: 499.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 22,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Tempranillo 94%', 'Cabernet Sauvignon 6%'],
      servingTemp: '16-18°C',
      foodPairing: 'Iberico ham, lamb, aged Manchego, game dishes',
      awards: ['Wine Advocate 96 points', 'Wine Spectator 95 points']
    }
  },

  // Australian Wines
  {
    name: 'Penfolds Grange 2016',
    producer: 'Penfolds',
    region: 'South Australia, Australia',
    appellation: 'South Australia',
    vintage: 2016,
    category: 'Red Wine',
    description: 'Australia\'s most iconic wine, Penfolds Grange represents the pinnacle of Australian winemaking. This multi-regional blend showcases the power and elegance of Australian Shiraz.',
    tastingNotes: 'Intense aromas of blackberry, plum, chocolate, and spice with hints of vanilla and oak. The palate is rich and powerful with velvety tannins and exceptional concentration.',
    alcoholContent: 14.5,
    bottleSize: '750ml',
    sku: 'PEN-GRA-2016-750',
    originalPrice: 2295.00,
    currentPrice: 459.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 35,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Shiraz 98%', 'Cabernet Sauvignon 2%'],
      servingTemp: '16-18°C',
      foodPairing: 'Grilled meats, kangaroo, aged cheddar, dark chocolate',
      awards: ['Wine Advocate 97 points', 'James Suckling 96 points']
    }
  },

  // More Napa Valley
  {
    name: 'Inglenook Rubicon 2016',
    producer: 'Inglenook',
    region: 'Napa Valley, California, USA',
    appellation: 'Rutherford AVA',
    vintage: 2016,
    category: 'Red Wine',
    description: 'From the historic Inglenook estate, now owned by Francis Ford Coppola, this Rubicon represents the estate\'s flagship wine. Made from estate-grown grapes in the heart of Rutherford.',
    tastingNotes: 'Elegant aromas of cassis, cedar, tobacco, and earth with hints of violet and spice. The palate is structured and refined with integrated tannins and a long, complex finish.',
    alcoholContent: 14.5,
    bottleSize: '750ml',
    sku: 'ING-RUB-2016-750',
    originalPrice: 2195.00,
    currentPrice: 439.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 28,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 91%', 'Cabernet Franc 6%', 'Merlot 3%'],
      servingTemp: '16-18°C',
      foodPairing: 'Prime rib, lamb, aged cheeses, dark chocolate',
      awards: ['Wine Spectator 94 points', 'Robert Parker 93 points']
    }
  },
  {
    name: 'Caymus Special Selection Cabernet Sauvignon 2017',
    producer: 'Caymus Vineyards',
    region: 'Napa Valley, California, USA',
    appellation: 'Napa Valley AVA',
    vintage: 2017,
    category: 'Red Wine',
    description: 'The flagship wine from Caymus Vineyards, Special Selection represents the best barrels from the estate. This wine showcases the power and elegance of Napa Valley Cabernet.',
    tastingNotes: 'Rich aromas of blackberry, cassis, vanilla, and spice with hints of chocolate and coffee. The palate is full-bodied with velvety tannins and a long, luxurious finish.',
    alcoholContent: 14.8,
    bottleSize: '750ml',
    sku: 'CAY-SS-2017-750',
    originalPrice: 2095.00,
    currentPrice: 419.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 32,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Cabernet Sauvignon 100%'],
      servingTemp: '16-18°C',
      foodPairing: 'Grilled steaks, barbecue, aged cheddar, chocolate desserts',
      awards: ['Wine Spectator 93 points', 'Wine Advocate 92 points']
    }
  },

  // Oregon Pinot Noir
  {
    name: 'Domaine Drouhin Oregon Pinot Noir Laurène 2017',
    producer: 'Domaine Drouhin Oregon',
    region: 'Willamette Valley, Oregon, USA',
    appellation: 'Dundee Hills AVA',
    vintage: 2017,
    category: 'Red Wine',
    description: 'From the Oregon outpost of Burgundy\'s Maison Joseph Drouhin, this Laurène represents the pinnacle of Oregon Pinot Noir. Made in the Burgundian style with Oregon terroir.',
    tastingNotes: 'Elegant aromas of red cherry, raspberry, earth, and spice with hints of forest floor and minerals. The palate is silky and refined with bright acidity and a long, elegant finish.',
    alcoholContent: 13.5,
    bottleSize: '750ml',
    sku: 'DDO-LAU-2017-750',
    originalPrice: 1995.00,
    currentPrice: 399.00,
    discountPercent: 80,
    currency: 'EUR',
    stock: 25,
    isActive: true,
    isFeatured: true,
    specifications: {
      grapeVariety: ['Pinot Noir 100%'],
      servingTemp: '14-16°C',
      foodPairing: 'Duck, salmon, mushroom dishes, aged Gruyère',
      awards: ['Wine Spectator 92 points', 'Wine Advocate 91 points']
    }
  }
]

// Update the allWines array to include all wines
allWines.push(...moreWines)