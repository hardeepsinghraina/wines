# Technology Stack

## Frontend
- **Next.js 14** with App Router for SSR and SEO optimization
- **React 18** with TypeScript for type safety
- **Tailwind CSS** with custom luxury theme
- **Framer Motion** for animations and micro-interactions
- **React Query** for data fetching and caching

## Backend
- **Node.js** with Express.js for RESTful API
- **TypeScript** across the entire stack
- **PostgreSQL** for primary data storage
- **Redis** for session management and caching
- **JWT** with refresh token rotation for authentication

## Infrastructure
- **Docker** containers for deployment
- **AWS/Vercel** for hosting and CDN
- **Cloudflare** for security and performance

## Payment Processing
- Cryptocurrency payment processors (BitPay, CoinGate)
- Real-time crypto rate fetching APIs

## Development Tools
- **ESLint** and **Prettier** for code quality
- **Husky** for git hooks
- **Jest** and **React Testing Library** for unit tests
- **Playwright** for E2E testing
- **Supertest** for API testing

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run unit tests
npm run test:e2e     # Run E2E tests
```

### Database
```bash
npx prisma migrate dev    # Run database migrations
npx prisma generate       # Generate Prisma client
npx prisma studio        # Open database GUI
```

### Docker
```bash
docker-compose up -d     # Start development environment
docker-compose down      # Stop containers
docker-compose logs      # View logs
```

## Code Quality Standards
- TypeScript strict mode enabled
- ESLint with luxury e-commerce specific rules
- Prettier for consistent formatting
- Pre-commit hooks for code validation
- 80%+ test coverage requirement