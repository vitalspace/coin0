# Project Agents

This file tracks custom agents created for this project.

## NextNav Agent

**File:** `.kilo/agent/nextnav-agent.md`

**Purpose:** Fixes navigation performance issues by replacing `div onClick` with Next.js `Link` components.

**Created:** 2025-04-25

**Status:** Ready to use

**Usage:**
```bash
kilo nextnav-agent
```

**Problem Solved:** 
- Fixed "Compiling..." message on every navigation
- Restored SPA (Single Page Application) behavior
- Restored preloading and performance optimizations
- Improved SEO and accessibility

**Files Modified:**
- Navbar.tsx
- airdrop/[id]/page.tsx
- stakes/page.tsx
- stake/[id]/page.tsx
- tokens/page.tsx
- mytoken/StakeTab.tsx
- profile/ProfileStakingPools.tsx
- profile/ProfileAirdrops.tsx
- create-coin/CoinForm.tsx
- layout/Footer.tsx
- landing/CTA.tsx
