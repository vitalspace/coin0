# Coin0 - Initia Token Platform

Platform para crear, stakear y分发 airdrops de tokens en el ecosistema Initia.

## Stack

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: Node.js + MongoDB + ElysiaJS
- **Smart Contracts**: MoveVM (Initia)
- **3D**: React Three Fiber

## Estructura

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

- Create tokens en Initia
- Staking de tokens
- Airdrops
- Interfaz 3D interactiva via React Three Fiber