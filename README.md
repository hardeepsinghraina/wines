# Luxury Wine Crypto E-commerce Platform

A premium wine e-commerce platform that accepts cryptocurrency payments, targeting crypto investors, wine collectors, and enthusiasts globally.

## Features

- Premium wine catalog with detailed product information
- Cryptocurrency payment processing (BTC, ETH, SOL, DOGE, LTC, USDC, USDT)
- Traditional payment options (Euros)
- Global VIP delivery with insurance options
- Wine NFTs and digital certificates
- Private sales and exclusive collections
- Affiliate and loyalty programs
- Mobile-responsive design

## Tech Stack

### Frontend
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS
- Framer Motion
- React Query

### Backend
- Node.js with Express.js
- TypeScript
- PostgreSQL
- Redis
- JWT Authentication

### Infrastructure
- Docker containers
- AWS/Vercel hosting
- Cloudflare CDN

## Project Structure

```
/
├── frontend/           # Next.js application
├── backend/           # Node.js API server
├── shared/            # Shared TypeScript types and utilities
├── docker/            # Docker configuration files
├── docs/              # Project documentation
└── scripts/           # Build and deployment scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if running locally)
- Redis (if running locally)

### Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Start development environment with Docker:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

4. Or run locally:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

#### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Build TypeScript to JavaScript
- `npm run start` - Start production server

### Environment Variables

Create `.env.local` files in both frontend and backend directories with the required environment variables.

## Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## License

Private - All rights reserved# ecommerce_for_wine
# ecommerce_for_wine
