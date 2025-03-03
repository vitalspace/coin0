Coin0 Whitepaper
About Coin0
Coin0 is an innovative platform that enables users to create memecoins effortlessly with the power of AI. By simply connecting their MetaMask wallet, users can generate and deploy their own memecoin without requiring technical knowledge. Coin0 automates the entire process, making token creation accessible to everyone.

How It Works
1. Connect Wallet: Users connect their MetaMask wallet to the platform.
2. AI or Manual Token Creation: Users can either manually input details or let AI generate them automatically.
3. Blockchain Selection: Choose the desired blockchain.
4. Token Name & Symbol: Define the identity of the memecoin.
5. Total Supply: Set the number of tokens to be created.
6. AI-Generated Logo: Coin0 uses Cloudflare's AI model (Flux-1-Schnell) to create a unique token logo.
7. Validation Process: The system ensures all required parameters are set correctly.
8. Deploy on Blockchain: The user finalizes the creation process by paying the gas fee, and the token is deployed.
Smart Contract & Supported Chains
Memecoins are deployed using the MemecoinFactory contract on the following networks:

VitalSpace Mainnet / Aurora Virtual Chain: 0x15ff23Ab56f157bC9Dd460D6E6d686A0A0664E08
Electroneum Testnet: 0xA8317d7A1eD51c4C4e52bD0DF39ba0fD84BE1275
Decentralization & Responsibility
Coin0 does not manage or control the tokens created. The ownership and full responsibility of the memecoins remain with the user. Once deployed, the user must handle liquidity, marketing, and utility independently.

Future Plans
Integration of additional AI agents to enhance automation.
Expansion to more EVM-compatible chains.
Improved user experience with advanced customization options.

Vitalspace / Aurota Virtual Chain ID: 1313161674

RPC https://0x4e4541ca.rpc.aurora-cloud.dev

Explorer https://0x4e4541ca.explorer.aurora-cloud.dev


# Coin0 Project Documentation

![Coin0 Logo](https://via.placeholder.com/100x30?text=Coin0+Logo) <!-- Add actual logo URL if available -->

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Running the Project](#running-the-project)
5. [Deployment Notes](#deployment-notes)
6. [Demo](#demo)

---

## Prerequisites

### Core Requirements
- [Bun.js Runtime](https://bun.sh) (v1.0 or newer)
- [MongoDB](https://www.mongodb.com) (v7.0 or newer)

### Optional Tools
- Ethereum Testnet Provider:
  - [Ganache](https://trufflesuite.com/ganache/) (Recommended)
  - Infura/Alchemy/Thirdweb testnet

### API Accounts
- [Google AI Studio](https://ai.google.dev)
- [Cloudflare AI](https://cloudflare.com/ai)

---

## Installation

1. **Clone Repository**

git clone https://github.com/vitalspace/coin0.git
cd coin0


## Project Structure

coin0/
├── contracts/
├── frontend/
├── backend/

## Frontend Setup

cd frontend

Update contract address (if deployed):
frontend/src/lib/constants.ts

export const CONTRACT_ADDRESS = {
  1313161674: "0x15ff23Ab56f157bC9Dd460D6E6d686A0A0664E08", // VitalSpace Mainnet / Aurora Virtual Chain
  5201420: "0xA8317d7A1eD51c4C4e52bD0DF39ba0fD84BE1275", // Electroneum Testnet
  1337: "0x0792B7cB21aA6C3d12E7441244716b256AA9F4b1", // Ganache Testnet
};

## Backend Setup

cd ../backend
cp .env.example .env

# CORS
ALLOWED_ORIGIN_1="http://localhost:5173" // cha
ALLOWED_ORIGIN_2="https://your-production-domain.com"

# Database
DB_NAME="coin0"
MONGODB_URI="mongodb://localhost:27017"

# Cloudflare AI
CLOUD_FLARE_API_KEY="your_api_key_here"
CLOUD_FLARE_ACCOUNT_ID="your_account_id"
CLOUD_FLARE_IA_MODEL_ID="@cf/black-forest-labs/flux-1-schnell"

# Google AI
GOOGLE_API_KEY="your_google_key"
GOOGLE_IA_MODEL_ID="gemini-2.0-flash"

## Running the Project

## Frontend Development

cd frontend
bun install
bun run dev

Access http://localhost:5173

Backend Server

cd backend
bun install
bun run dev

Access http://localhost:3000

Smart Contracts
Deploy using preferred tool (Hardhat/Thirdweb/Remix)
Update contract address in frontend/src/lib/constants.ts

Demo: https://www.youtube.com/watch?v=t8Ccd3O9Lsk

```bash
