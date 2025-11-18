import { PredefinedResponse } from '../types/chatbot';

export const CHATBOT_RESPONSES: PredefinedResponse[] = [
  // Authenticity Questions
  {
    id: 'auth-1',
    keywords: ['authenticity', 'verify', 'bottle', 'real', 'authentic', 'genuine'],
    response: 'Each bottle includes a blockchain-secured digital certificate accessible through a unique QR code.',
    category: 'authenticity',
    question: 'How can I verify bottle authenticity?'
  },
  {
    id: 'auth-2',
    keywords: ['digital', 'certificate', 'nft', 'blockchain', 'record'],
    response: "It's a tamper-proof NFT-based record verifying the wine's origin, age, and ownership history.",
    category: 'authenticity',
    question: 'What is a digital certificate?'
  },
  {
    id: 'auth-3',
    keywords: ['qr', 'code', 'scan', 'mobile', 'phone'],
    response: 'Simply scan the QR code on your bottle with any smartphone camera to access the digital certificate and verify authenticity.',
    category: 'authenticity',
    question: 'How do I scan the QR code?'
  },
  {
    id: 'auth-4',
    keywords: ['fake', 'counterfeit', 'fraud', 'protection'],
    response: 'Our blockchain certificates make counterfeiting impossible. Each bottle has a unique, unalterable digital fingerprint.',
    category: 'authenticity',
    question: 'How are you protected from counterfeits?'
  },

  // Payment Questions
  {
    id: 'pay-1',
    keywords: ['payment', 'crypto', 'cryptocurrency', 'bitcoin', 'ethereum', 'usdt'],
    response: 'We accept Bitcoin (BTC), Ethereum (ETH), and USDT TRC20. Simply select your preferred cryptocurrency at checkout.',
    category: 'payments',
    question: 'What cryptocurrencies do you accept?'
  },
  {
    id: 'pay-2',
    keywords: ['wallet', 'address', 'send', 'transfer'],
    response: 'After selecting cryptocurrency, you\'ll receive our wallet address and QR code for easy mobile payments.',
    category: 'payments',
    question: 'How do I send cryptocurrency payment?'
  },
  {
    id: 'pay-3',
    keywords: ['confirmation', 'verify', 'payment', 'received'],
    response: 'Payment confirmation typically takes 10-30 minutes depending on network congestion. You\'ll receive email confirmation once verified.',
    category: 'payments',
    question: 'How long does payment confirmation take?'
  },
  {
    id: 'pay-4',
    keywords: ['fees', 'transaction', 'cost', 'charges'],
    response: 'We don\'t charge additional fees for cryptocurrency payments. You only pay standard network transaction fees.',
    category: 'payments',
    question: 'Are there any payment fees?'
  },
  {
    id: 'pay-5',
    keywords: ['refund', 'return', 'cancel', 'money back'],
    response: 'Cryptocurrency payments are final. Please contact support within 24 hours if you need to cancel an order.',
    category: 'payments',
    question: 'Can I get a refund for crypto payments?'
  },

  // Storage Questions
  {
    id: 'stor-1',
    keywords: ['storage', 'temperature', 'cellar', 'conditions'],
    response: 'Store wines at 12-15°C (54-59°F) in a dark place with 70% humidity and minimal vibration.',
    category: 'storage',
    question: 'How should I store my wines?'
  },
  {
    id: 'stor-2',
    keywords: ['aging', 'cellaring', 'maturation', 'years'],
    response: 'Most of our premium wines can be cellared for 10-25 years. Check individual product pages for specific aging recommendations.',
    category: 'storage',
    question: 'How long can I age these wines?'
  },
  {
    id: 'stor-3',
    keywords: ['shipping', 'delivery', 'packaging', 'protection'],
    response: 'All wines are shipped in temperature-controlled packaging with insurance. VIP delivery options include white-glove service.',
    category: 'storage',
    question: 'How are wines protected during shipping?'
  },

  // Product Questions
  {
    id: 'prod-1',
    keywords: ['vintage', 'year', 'harvest', 'production'],
    response: 'Each wine listing shows the vintage year, harvest details, and production notes. All wines are from exceptional vintage years.',
    category: 'product',
    question: 'How do I know the vintage year?'
  },
  {
    id: 'prod-2',
    keywords: ['region', 'origin', 'terroir', 'location'],
    response: 'Our wines come from prestigious regions including Bordeaux, Burgundy, Champagne, Tuscany, and Napa Valley.',
    category: 'product',
    question: 'What wine regions do you offer?'
  },
  {
    id: 'prod-3',
    keywords: ['tasting', 'notes', 'flavor', 'profile'],
    response: 'Detailed tasting notes, flavor profiles, and food pairing suggestions are available on each product page.',
    category: 'product',
    question: 'Where can I find tasting notes?'
  },
  {
    id: 'prod-4',
    keywords: ['rare', 'exclusive', 'limited', 'collection'],
    response: 'We offer exclusive access to rare vintages and limited collections. Join our VIP program for early access to special releases.',
    category: 'product',
    question: 'Do you have rare or exclusive wines?'
  },
  {
    id: 'prod-5',
    keywords: ['investment', 'value', 'appreciation', 'collectible'],
    response: 'Many of our wines are excellent investments. We provide market analysis and appreciation potential for collectible bottles.',
    category: 'product',
    question: 'Are these wines good investments?'
  },

  // General Questions
  {
    id: 'gen-1',
    keywords: ['support', 'help', 'contact', 'assistance'],
    response: 'Our wine experts are available 24/7 via chat, email, or phone. We\'re here to help with any questions about our collection.',
    category: 'general',
    question: 'How can I contact support?'
  },
  {
    id: 'gen-2',
    keywords: ['shipping', 'worldwide', 'international', 'global'],
    response: 'We ship worldwide with full insurance and tracking. Delivery times vary by location, typically 3-14 business days.',
    category: 'general',
    question: 'Do you ship internationally?'
  },
  {
    id: 'gen-3',
    keywords: ['membership', 'vip', 'loyalty', 'program'],
    response: 'Join our VIP program for exclusive access to rare wines, priority shipping, and special member pricing.',
    category: 'general',
    question: 'Do you have a loyalty program?'
  },
  {
    id: 'gen-4',
    keywords: ['age', 'verification', 'legal', 'requirements'],
    response: 'You must be 25 or older to purchase wine. Age verification is required and helps us comply with international regulations.',
    category: 'general',
    question: 'What are the age requirements?'
  }
];

// Default fallback response
export const DEFAULT_RESPONSE = "I'd be happy to help! Our wine experts are available 24/7 for personalized assistance. You can also browse our FAQ section or contact support directly.";