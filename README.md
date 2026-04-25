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
├── frontend/      # Next.js app
├── backend/      # API + MongoDB
├── contracts/    # Solidity smart contracts
└── docker/      # Docker config
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

- Create tokens on Coin0 Rollup (EVM)
- Token staking
- Airdrops distribution
- Interactive 3D interface via React Three Fiber
- Built on Initia with custom EVM rollup

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