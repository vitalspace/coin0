# Coin 0 - Initia Token Platform

Platform for creating, staking, and distributing token airdrops in the Initia ecosystem.

## Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: Node.js + MongoDB + ElysiaJS
- **Smart Contracts**: MoveVM (Initia)
- **3D**: React Three Fiber

## Structure

```
coin0/
├── frontend/      # Next.js app
├── backend/      # API + MongoDB
├── contracts/    # Move smart contracts
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

- Create tokens on Initia
- Token staking
- Airdrops distribution
- Interactive 3D interface via React Three Fiber