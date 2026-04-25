# Coin 0 - Initia Token Platform

Platform for creating, staking, and distributing token airdrops in the Initia ecosystem.

## Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: Node.js + MongoDB + ElysiaJS
- **Blockchain**: EVM (Coin0 Rollup)
- **3D**: React Three Fiber

## Structure

```
coin0/
├── frontend/          # Next.js 16 App
│   ├── app/
│   │   ├── page.tsx                    # Landing page
│   │   ├── layout.tsx                   # Root layout
│   │   ├── create-coin/                 # Create token page
│   │   ├── tokens/                      # Browse tokens
│   │   ├── stakes/                     # Browse staking pools
│   │   ├── stake/[id]/                  # Single stake pool
│   │   ├── airdrops/                    # Browse airdrops
│   │   ├── airdrop/[id]/                # Single airdrop
│   │   ├── profile/                     # User profile
│   │   ├── mytoken/[id]/                # Token management
│   │   ├── agent/                       # AI Agent chat
│   │   └── lib/
│   │       └── components/               # Shared components
│   │           ├── layout/              # Navbar, Footer, etc.
│   │           ├── landing/            # Landing page sections
│   │           ├── create-coin/         # Token creation forms
│   │           ├── mytoken/            # Token dashboard tabs
│   │           ├── profile/             # Profile components
│   │           └── agent/              # AI chat components
├── backend/           # ElysiaJS API
│   ├── src/
│   │   ├── index.ts                    # Entry point
│   │   ├── routes/                    # API routes
│   │   ├── models/                   # MongoDB models
│   │   └── utils/                   # Utilities
├── contracts/         # Solidity contracts
│   ├── factory/                     # Token factory
│   ├── stake/                     # Staking contract
│   └── airdrop/                   # Airdrop contract
└── docker/            # Docker config
```

## Quick Start

```bash
# Frontend
cd frontend && npm run dev

# Backend
cd backend && npm run dev

# Docker (MongoDB)
docker-compose up -d
```

## Features

- **Token Creation**: Create custom tokens on Coin0 Rollup (EVM)
- **Staking**: Stake tokens and earn rewards
- **Airdrops**: Distribute tokens to multiple addresses
- **3D Interface**: Interactive 3D visuals via React Three Fiber
- **AI Agent**: Natural language token management
- **User Profiles**: Track tokens, stakes, and airdrops

## Tech Stack Details

### Frontend
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- React Three Fiber for 3D visuals
- InterwovenKit React for Initia integration

### Backend
- ElysiaJS (高性能 TypeScript framework)
- MongoDB for data persistence

### Contracts
- Solidity smart contracts
- Deployed on Coin0 Rollup (EVM)