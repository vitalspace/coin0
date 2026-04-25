import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import Token from '../models/coin.model';
import StakingPool from '../models/staking.model';
import Airdrop from '../models/airdrop.model';

export function createMcpServer() {
  const server = new McpServer({ name: 'defi-agent', version: '1.0.0' });

  // ── READ TOOLS ──────────────────────────────────────────

  server.tool(
    'list_tokens',
    'List tokens created by a user. Shows name, symbol, supply.',
    { userAddress: z.string().describe('User wallet address') },
    async ({ userAddress }) => {
      const tokens = await Token.find({ owner: userAddress }).limit(10).lean();
      if (tokens.length === 0) {
        return { content: [{ type: 'text' as const, text: 'You have no created tokens. You can create one in the "Create Coin" section.' }] };
      }
      const text = tokens.map(t => `• ${t.name} (${t.symbol}) - Supply: ${Number(t.supply).toLocaleString()} - Address: ${t.contractAddress}`).join('\n');
      return { content: [{ type: 'text' as const, text: `Your tokens:\n${text}` }] };
    }
  );

  server.tool(
    'list_pools',
    'List available staking pools. Shows token, rewards, lock period.',
    {},
    async () => {
      const pools = await StakingPool.find({}).limit(20).lean();
      if (pools.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No staking pools available.' }] };
      }
      const text = pools.slice(0, 5).map((p, i) =>
        `${i + 1}. ${p.tokenName} (${p.tokenSymbol}) - Rewards: ${p.rewardAmount} - Lock: ${p.lockSeconds / 86400} days - Address: ${p.poolAddress}`
      ).join('\n');
      return { content: [{ type: 'text' as const, text: `Available staking pools:\n${text}` }] };
    }
  );

  server.tool(
    'list_airdrops',
    'List available airdrops. Shows token, amount, distribution time.',
    {},
    async () => {
      const airdrops = await Airdrop.find({ isCancelled: { $ne: true } }).limit(20).lean();
      if (airdrops.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No airdrops available.' }] };
      }
      const now = Date.now();
      const active = airdrops.filter(a => new Date(a.distributionTime).getTime() > now);
      if (active.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No active airdrops. All have expired.' }] };
      }
      const text = active.slice(0, 5).map((a, i) =>
        `${i + 1}. ${a.tokenName} (${a.tokenSymbol}) - Amount: ${a.totalAmount} - Distribution: ${new Date(a.distributionTime).toLocaleDateString()} - Address: ${a.poolAddress}`
      ).join('\n');
      return { content: [{ type: 'text' as const, text: `Active airdrops:\n${text}` }] };
    }
  );

  server.tool(
    'get_user_airdrops',
    'Get airdrops a user has registered for.',
    { userAddress: z.string().describe('User wallet address') },
    async () => {
      return { content: [{ type: 'text' as const, text: 'To view your registered airdrops, visit your profile in the Airdrops section.' }] };
    }
  );

  server.tool(
    'get_user_stakes',
    'Get staking positions for a user.',
    { userAddress: z.string().describe('User wallet address') },
    async () => {
      return { content: [{ type: 'text' as const, text: 'To view your stakes, visit your profile in the Staking section.' }] };
    }
  );

  // ── ACTION TOOLS (return metadata for frontend signing) ──

  server.tool(
    'create_airdrop',
    'Create an airdrop for a token. Asks user for amount, max users, distribution time.',
    {
      userAddress: z.string().describe('User wallet address'),
      tokenSymbol: z.string().optional().describe('Token symbol (e.g. LLMC, INIT)'),
      mintAddress: z.string().optional().describe('Token mint address'),
      amount: z.number().describe('Total token amount for the airdrop'),
      maxUsers: z.number().describe('Maximum number of users who can claim'),
      distributionTimeUnix: z.number().describe('Unix timestamp when tokens become claimable (seconds)'),
      description: z.string().optional().describe('Airdrop description'),
    },
    async ({ userAddress, tokenSymbol, mintAddress, amount, maxUsers, distributionTimeUnix, description }) => {
      if (!mintAddress) {
        const token = await Token.findOne({ owner: userAddress, ...(tokenSymbol ? { symbol: { $regex: new RegExp(tokenSymbol, 'i') } } : {}) }).lean();
        if (!token) {
          return { content: [{ type: 'text' as const, text: `Token ${tokenSymbol || ''} not found. Create a token first.` }] };
        }
        mintAddress = token.contractAddress;
        tokenSymbol = token.symbol;
      }

      const actionData = JSON.stringify({
        action: 'create_airdrop',
        mintAddress,
        tokenSymbol: tokenSymbol || 'TKN',
        amount,
        maxUsers,
        distributionTime: distributionTimeUnix,
        description: description || `Don't miss this exclusive airdrop of ${amount} ${tokenSymbol || 'tokens'}! Claim your share.`,
      });

      return {
        content: [{
          type: 'text' as const,
          text: `Airdrop ready to create:\n• Token: ${tokenSymbol || 'TKN'}\n• Amount: ${amount}\n• Max users: ${maxUsers}\n• Distribution: ${new Date(distributionTimeUnix * 1000).toLocaleString()}\n• Description: ${description || 'Auto-generated'}\n\nSign the transaction with your wallet to create the airdrop.`,
        }],
        metadata: { type: 'transaction_ready', data: actionData },
      };
    }
  );

  server.tool(
    'create_staking_pool',
    'Create a staking pool for a token.',
    {
      userAddress: z.string().describe('User wallet address'),
      tokenSymbol: z.string().optional().describe('Token symbol (e.g. LLMC, INIT)'),
      mintAddress: z.string().optional().describe('Token mint address'),
      rewardAmount: z.number().describe('Number of tokens as rewards'),
      lockDays: z.number().describe('Lock period in days'),
      multiplier: z.number().describe('Reward multiplier (e.g. 1.5)'),
      description: z.string().optional().describe('Pool description'),
    },
    async ({ userAddress, tokenSymbol, mintAddress, rewardAmount, lockDays, multiplier, description }) => {
      if (!mintAddress) {
        const token = await Token.findOne({ owner: userAddress, ...(tokenSymbol ? { symbol: { $regex: new RegExp(tokenSymbol, 'i') } } : {}) }).lean();
        if (!token) {
          return { content: [{ type: 'text' as const, text: `Token ${tokenSymbol || ''} not found. Create a token first.` }] };
        }
        mintAddress = token.contractAddress;
        tokenSymbol = token.symbol;
      }

      const lockSeconds = lockDays * 86400;
      const multiplierBps = Math.round(multiplier * 10000);

      const actionData = JSON.stringify({
        action: 'create_pool',
        mintAddress,
        tokenSymbol: tokenSymbol || 'TKN',
        rewardAmount,
        lockDays,
        multiplier,
        description: description || `Stake and earn up to ${multiplier}x rewards in ${rewardAmount} tokens.`,
      });

      return {
        content: [{
          type: 'text' as const,
          text: `Staking pool ready to create:\n• Token: ${tokenSymbol || 'TKN'}\n• Rewards: ${rewardAmount} tokens\n• Lock: ${lockDays} days\n• Multiplier: ${multiplier}x\n• Description: ${description || 'Auto-generated'}\n\nSign the transaction with your wallet to create the pool.`,
        }],
        metadata: { type: 'transaction_ready', data: actionData },
      };
    }
  );

  server.tool(
    'stake_init',
    'Stake INIT in a staking pool.',
    {
      poolAddress: z.string().describe('Staking pool address'),
      amount: z.number().describe('Amount of INIT to stake'),
    },
    async ({ poolAddress, amount }) => {
      const actionData = JSON.stringify({
        action: 'stake',
        poolAddress,
        amount,
      });

      return {
        content: [{
          type: 'text' as const,
          text: `Stake ready to sign:\n• Pool: ${poolAddress}\n• Amount: ${amount} INIT\n\nSign the transaction with your wallet.`,
        }],
        metadata: { type: 'transaction_ready', data: actionData },
      };
    }
  );

  server.tool(
    'register_airdrop',
    'Register for an airdrop.',
    {
      airdropAddress: z.string().describe('Airdrop pool address'),
    },
    async ({ airdropAddress }) => {
      const airdrop = await Airdrop.findOne({ poolAddress: airdropAddress }).lean();
      if (!airdrop) {
        return { content: [{ type: 'text' as const, text: 'Airdrop not found.' }] };
      }

      const actionData = JSON.stringify({
        action: 'register_airdrop',
        airdropAddress,
      });

      return {
        content: [{
          type: 'text' as const,
          text: `Registration ready to sign:\n• Airdrop: ${airdrop.tokenName} (${airdrop.tokenSymbol})\n• Total amount: ${airdrop.totalAmount}\n\nSign the transaction with your wallet to register.`,
        }],
        metadata: { type: 'transaction_ready', data: actionData },
      };
    }
  );

  server.tool(
    'claim_airdrop',
    'Claim tokens from an airdrop.',
    {
      airdropAddress: z.string().describe('Airdrop pool address'),
      mintAddress: z.string().optional().describe('Token mint address'),
    },
    async ({ airdropAddress, mintAddress }) => {
      const airdrop = await Airdrop.findOne({ poolAddress: airdropAddress }).lean();
      if (!airdrop) {
        return { content: [{ type: 'text' as const, text: 'Airdrop not found.' }] };
      }

      const actionData = JSON.stringify({
        action: 'claim_airdrop',
        airdropAddress,
        mintAddress: mintAddress || airdrop.mintAddress,
      });

      return {
        content: [{
          type: 'text' as const,
          text: `Claim ready to sign:\n• Airdrop: ${airdrop.tokenName} (${airdrop.tokenSymbol})\n\nSign the transaction with your wallet to claim your tokens.`,
        }],
        metadata: { type: 'transaction_ready', data: actionData },
      };
    }
  );

  server.tool(
    'claim_staking_rewards',
    'Claim staking rewards.',
    {
      poolAddress: z.string().describe('Staking pool address'),
    },
    async ({ poolAddress }) => {
      const actionData = JSON.stringify({
        action: 'claim_rewards',
        poolAddress,
      });

      return {
        content: [{
          type: 'text' as const,
          text: `Rewards claim ready to sign.\n\nSign the transaction with your wallet to claim your rewards.`,
        }],
        metadata: { type: 'transaction_ready', data: actionData },
      };
    }
  );

  // ── HELPER TOOLS ──────────────────────────────────────────

  // ── SEARCH TOOLS ──────────────────────────────────────────

  server.tool(
    'search_pools',
    'Search staking pools by token symbol or filter criteria.',
    {
      tokenSymbol: z.string().optional().describe('Token symbol to filter by'),
      minMultiplier: z.number().optional().describe('Minimum multiplier to filter'),
      maxLockDays: z.number().optional().describe('Maximum lock days to filter')
    },
    async ({ tokenSymbol, minMultiplier, maxLockDays }) => {
      const filter: any = {};
      if (tokenSymbol) {
        filter.tokenSymbol = { $regex: new RegExp(tokenSymbol, 'i') };
      }
      if (minMultiplier || maxLockDays) {
        filter.$or = [];
        if (minMultiplier) {
          filter.$or.push({ multiplierBps: { $gte: Math.round(minMultiplier * 10000) } });
        }
        if (maxLockDays) {
          filter.$or.push({ lockSeconds: { $lte: maxLockDays * 86400 } });
        }
      }
      const pools = await StakingPool.find(filter).limit(20).lean();
      if (pools.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No staking pools match your search criteria.' }] };
      }
      const text = pools.slice(0, 5).map((p, i) =>
        `${i + 1}. ${p.tokenName} (${p.tokenSymbol}) - Rewards: ${p.rewardAmount} - Lock: ${p.lockSeconds / 86400} days - Multiplier: ${(p.multiplierBps / 10000).toFixed(2)}x - Address: ${p.poolAddress}`
      ).join('\n');
      return { content: [{ type: 'text' as const, text: `Found ${pools.length} staking pools:\n\n${text}` }] };
    }
  );

  server.tool(
    'search_airdrops',
    'Search airdrops by token symbol or active status.',
    {
      tokenSymbol: z.string().optional().describe('Token symbol to filter by'),
      activeOnly: z.boolean().optional().describe('Show only active airdrops (not yet distributed)')
    },
    async ({ tokenSymbol, activeOnly }) => {
      const filter: any = { isCancelled: { $ne: true } };
      if (tokenSymbol) {
        filter.tokenSymbol = { $regex: new RegExp(tokenSymbol, 'i') };
      }
      if (activeOnly) {
        filter.distributionTime = { $gt: new Date() };
      }
      const airdrops = await Airdrop.find(filter).limit(20).lean();
      if (airdrops.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No airdrops found matching your criteria.' }] };
      }
      const text = airdrops.slice(0, 5).map((a, i) =>
        `${i + 1}. ${a.tokenName} (${a.tokenSymbol}) - Amount: ${a.totalAmount} - Distribution: ${new Date(a.distributionTime).toLocaleString()} - Address: ${a.poolAddress}`
      ).join('\n');
      return { content: [{ type: 'text' as const, text: `Found ${airdrops.length} airdrops:\n\n${text}` }] };
    }
  );

  server.tool(
    'search_tokens',
    'Search tokens by name or symbol query.',
    {
      query: z.string().describe('Search query for token name or symbol')
    },
    async ({ query }) => {
      const filter = {
        $or: [
          { name: { $regex: new RegExp(query, 'i') } },
          { symbol: { $regex: new RegExp(query, 'i') } }
        ]
      };
      const tokens = await Token.find(filter).limit(20).lean();
      if (tokens.length === 0) {
        return { content: [{ type: 'text' as const, text: 'No tokens found matching your search.' }] };
      }
      const text = tokens.map((t, i) =>
        `${i + 1}. ${t.name} (${t.symbol}) - Supply: ${Number(t.supply).toLocaleString()} - Owner: ${t.owner.substring(0, 8)}... - Address: ${t.contractAddress}`
      ).join('\n');
      return { content: [{ type: 'text' as const, text: `Found ${tokens.length} tokens:\n\n${text}` }] };
    }
  );

  server.tool(
    'check_airdrop_status',
    'Check if a specific airdrop is claimable by a user and when.',
    {
      airdropAddress: z.string().describe('Airdrop pool address'),
      userAddress: z.string().describe('User wallet address')
    },
    async ({ airdropAddress, userAddress }) => {
      const airdrop = await Airdrop.findOne({ poolAddress: airdropAddress }).lean();
      if (!airdrop) {
        return { content: [{ type: 'text' as const, text: `Airdrop not found at address ${airdropAddress}.` }] };
      }
      const now = new Date();
      const distributionTime = new Date(airdrop.distributionTime);
      const isActive = distributionTime > now;
      const timeUntil = distributionTime.getTime() - now.getTime();
      const daysUntil = Math.floor(timeUntil / (1000 * 60 * 60 * 24));
      const hoursUntil = Math.floor((timeUntil % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      let status = '';
      if (isActive) {
        if (daysUntil > 0) {
          status = `Not yet claimable. Distribution in ${daysUntil} days and ${hoursUntil} hours (at ${distributionTime.toLocaleString()}).`;
        } else {
          status = `Distribution is very soon! Only ${hoursUntil} hours remaining.`;
        }
      } else {
        status = `Airdrop distribution has passed. You can claim now if you registered.`;
      }
      
      return {
        content: [{
          type: 'text' as const,
          text: `**Airdrop Status**\n\n${airdrop.tokenName} (${airdrop.tokenSymbol})\n- Pool: ${airdrop.poolAddress}\n- Amount: ${airdrop.totalAmount}\n- Max Users: ${airdrop.maxUsers}\n- Status: ${status}`
        }]
      };
    }
  );

  server.tool(
    'explain_staking',
    'Explain how staking works and its benefits.',
    {},
    async () => {
      return {
        content: [{
          type: 'text' as const,
          text: `# Staking Explained\n\n**What is Staking?**\nStaking involves locking your tokens in a smart contract to support network operations and earn rewards.\n\n**Key Concepts:**\n• **Lock Period**: How long tokens are locked (in days)\n• **Reward Multiplier**: Bonus rate for staking (e.g., 1.5x = 50% bonus)\n• **Rewards**: Tokens you earn for staking\n\n**Example:**\nIf you stake 100 tokens with a 2x multiplier for 30 days, you could earn 100 additional tokens as rewards.\n\n**Benefits:**\n✓ Earn passive income\n✓ Support the ecosystem\n✓ Higher returns than holding`
        }]
      };
    }
  );

  server.tool(
    'explain_airdrops',
    'Explain how airdrops work and how to participate.',
    {},
    async () => {
      return {
        content: [{
          type: 'text' as const,
          text: `# Airdrops Explained\n\n**What is an Airdrop?**\nAirdrops distribute free tokens to community members as rewards or promotions.\n\n**How it Works:**\n1. Creator sets total amount and max users\n2. Users register before distribution time\n3. Creator distributes tokens automatically\n\n**Key Terms:**\n• **Registration**: Signing up to receive tokens\n• **Distribution Time**: When tokens become claimable\n• **Max Users**: Maximum participants allowed\n\n**Tips:**\n✓ Register early - spots fill up!\n✓ Check distribution times\n✓ Read description for eligibility`
        }]
      };
    }
  );

  server.tool(
    'calculate_rewards',
    'Calculate estimated staking rewards based on amount, days, and multiplier.',
    {
      amount: z.number().describe('Amount of tokens to stake'),
      days: z.number().describe('Number of days to stake'),
      multiplier: z.number().describe('Reward multiplier (e.g., 1.5, 2.0)')
    },
    async ({ amount, days, multiplier }) => {
      const rewards = amount * (multiplier - 1);
      const total = amount + rewards;
      const dailyReturn = (rewards / amount) * 100 / days;
      const annualApy = (rewards / amount) * (365 / days) * 100;
      
      return {
        content: [{
          type: 'text' as const,
          text: `# Staking Rewards Calculator\n\n**Input:**\n• Amount Staked: ${amount} tokens\n• Lock Period: ${days} days\n• Multiplier: ${multiplier}x\n\n**Results:**\n• Rewards Earned: ${rewards.toFixed(2)} tokens\n• Total Return: ${total.toFixed(2)} tokens\n• Daily Rate: ${dailyReturn.toFixed(4)}%\n• Annual APY: ${annualApy.toFixed(2)}%`
        }]
      };
    }
  );

  server.tool(
    'help',
    'Show available commands and capabilities.',
    {},
    async () => {
      return { content: [{ type: 'text' as const, text: `I can help you with:\n\n🪙 Tokens:\n• "My tokens" - View your tokens\n• "Create token X" - Create token\n• "Search tokens [query]" - Search tokens\n\n🟢 Staking:\n• "Stake X INIT in pool Y" - Stake\n• "Create staking pool" - Create pool\n• "Show pools" - List pools\n• "Search pools [token]" - Search pools\n• "Calculate rewards" - Estimate earnings\n• "Explain staking" - Learn staking\n\n🎁 Airdrops:\n• "Create airdrop of X tokens" - Create airdrop\n• "Show airdrops" - List airdrops\n• "Search airdrops [token]" - Search airdrops\n• "Check airdrop status [address]" - Check claim time\n• "Explain airdrops" - Learn airdrops\n\nWhat can I help you with?`, }] };
    }
  );

  server.tool(
    'get_current_datetime',
    'Get current date and time.',
    {},
    async () => {
      return {
        content: [{
          type: 'text' as const,
          text: new Date().toLocaleString('en-US', { timeZone: 'UTC' }),
        }],
      };
    }
  );

  return server;
}
