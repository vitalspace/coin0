# Coin 0 - Initia Token Platform

Platform for creating, staking, and distributing token airdrops in the Initia ecosystem.

## Vision

Coin 0 aims to democratize token creation by making it accessible to everyone. We believe anyone should be able to create, stake, and distribute tokens without deep technical knowledge. Our platform provides intuitive tools for token creation, staking mechanisms, and airdrop distribution - all powered by the Coin0 Rollup on Initia.

## Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: Node.js + MongoDB + ElysiaJS
- **Blockchain**: EVM (Coin0 Rollup)
- **3D**: React Three Fiber

## Why Coin 0?

- **Simple**: Create tokens in minutes, not days
- **Affordable**: Low fees thanks to Coin0 Rollup
- **Powerful**: Staking and airdrops built-in
- **Beautiful**: Immersive 3D interface
- **AI-Powered**: Natural language token management

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

### Token Creation
- Custom token name and symbol
- Initial supply and decimals
- Token metadata and image
- Automatic contract deployment

### Staking
- Create staking pools
- Set rewards and duration
- Track staker positions
- Claim rewards

### Airdrops
- Distribute to multiple addresses
- Set claim periods
- Verification options
- Track distribution progress

### 3D Interface
- Immersive token visuals
- Interactive 3D elements
- Smooth animations via React Three Fiber

### AI Agent
- Natural language commands
- Token management via chat
- Automated tasks

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

## Contributing

Pull requests are welcome! Feel free to open an issue or submit a PR.