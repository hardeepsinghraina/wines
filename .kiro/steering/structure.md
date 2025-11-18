# Project Structure

## Root Directory Organization
```
/
├── frontend/           # Next.js application
├── backend/           # Node.js API server
├── shared/            # Shared TypeScript types and utilities
├── docker/            # Docker configuration files
├── docs/              # Project documentation
└── scripts/           # Build and deployment scripts
```

## Frontend Structure (`/frontend`)
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Auth route group
│   │   ├── products/          # Product pages
│   │   ├── checkout/          # Checkout flow
│   │   └── account/           # User account pages
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components (Button, Card, etc.)
│   │   ├── layout/           # Layout components (Header, Footer)
│   │   ├── product/          # Product-specific components
│   │   ├── payment/          # Payment components
│   │   └── forms/            # Form components
│   ├── lib/                  # Utilities and configurations
│   │   ├── api.ts           # API client configuration
│   │   ├── auth.ts          # Authentication utilities
│   │   └── utils.ts         # General utilities
│   ├── hooks/               # Custom React hooks
│   ├── store/               # State management (Zustand/Redux)
│   ├── styles/              # Global styles and Tailwind config
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── tests/                   # Frontend tests
```

## Backend Structure (`/backend`)
```
backend/
├── src/
│   ├── controllers/         # Route handlers
│   │   ├── auth.ts         # Authentication endpoints
│   │   ├── products.ts     # Product management
│   │   ├── orders.ts       # Order processing
│   │   └── payments.ts     # Payment processing
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts         # Authentication middleware
│   │   ├── validation.ts   # Request validation
│   │   └── error.ts        # Error handling
│   ├── models/             # Database models (Prisma)
│   ├── services/           # Business logic
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── payment.service.ts
│   │   └── crypto.service.ts
│   ├── utils/              # Utility functions
│   ├── config/             # Configuration files
│   └── types/              # TypeScript interfaces
├── prisma/                 # Database schema and migrations
├── tests/                  # Backend tests
└── uploads/                # File upload directory
```

## Shared Directory (`/shared`)
```
shared/
├── types/                  # Common TypeScript interfaces
│   ├── user.ts            # User-related types
│   ├── product.ts         # Product types
│   ├── order.ts           # Order types
│   └── payment.ts         # Payment types
├── constants/             # Shared constants
└── utils/                 # Shared utility functions
```

## Naming Conventions

### Files and Directories
- Use kebab-case for directories: `user-profile/`, `payment-methods/`
- Use PascalCase for React components: `ProductCard.tsx`, `PaymentForm.tsx`
- Use camelCase for utilities and services: `authService.ts`, `cryptoUtils.ts`
- Use lowercase for configuration files: `tailwind.config.js`, `next.config.js`

### Components
- Component files should match component name: `ProductCard.tsx` exports `ProductCard`
- Use descriptive, specific names: `WineProductCard` vs `Card`
- Group related components in directories with index files

### API Routes
- Use RESTful conventions: `/api/products`, `/api/orders/:id`
- Use plural nouns for collections: `/products` not `/product`
- Use clear, descriptive endpoint names

## Import Organization
```typescript
// 1. External libraries
import React from 'react'
import { NextPage } from 'next'

// 2. Internal utilities and services
import { api } from '@/lib/api'
import { formatPrice } from '@/utils/currency'

// 3. Components (UI first, then feature-specific)
import { Button } from '@/components/ui/Button'
import { ProductCard } from '@/components/product/ProductCard'

// 4. Types
import type { Wine, User } from '@/types'
```

## Component Architecture
- Use composition over inheritance
- Keep components small and focused (< 200 lines)
- Separate business logic into custom hooks
- Use TypeScript interfaces for all props
- Implement proper error boundaries

## State Management
- Use React Query for server state
- Use Zustand for client state
- Keep state as close to usage as possible
- Avoid prop drilling with context when appropriate