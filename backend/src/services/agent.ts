import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import { createMcpServer } from "./mcp-server";

// Direct tool execution (bypasses MCP transport since we're in the same process)
import Airdrop from "../models/airdrop.model";
import Token from "../models/coin.model";
import StakingPool from "../models/staking.model";

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "";
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "";
const BACKEND_URL = process.env.BACKEND_URL || "https://coin0.bolta.world";
const IMAGES_DIR = join(process.cwd(), "public", "images");

async function generateTokenLogo(
  tokenName: string,
  tokenSymbol: string,
): Promise<string | undefined> {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) return undefined;

  try {
    const prompt = `A sleek, modern logo icon for a cryptocurrency token called "${tokenName}" (${tokenSymbol}), minimalist design, vibrant colors, 512x512, no text, crypto art style`;

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      },
    );

    if (!response.ok) return undefined;

    const data = (await response.json()) as any;
    if (!data.success || !data.result?.image) return undefined;

    const imageBuffer = Buffer.from(data.result.image, "base64");
    await mkdir(IMAGES_DIR, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    const filepath = join(IMAGES_DIR, filename);

    const webpBuffer = await sharp(imageBuffer)
      .resize(512, 512, { fit: "cover" })
      .webp({ quality: 85 })
      .toBuffer();

    await writeFile(filepath, webpBuffer);
    return `${BACKEND_URL}/public/images/${filename}`;
  } catch (err) {
    console.error("[MCP] Logo generation failed:", err);
    return undefined;
  }
}

// Build tool definitions from MCP schemas for the system prompt
function buildToolDescriptions(
  server: ReturnType<typeof createMcpServer>,
): string {
  // We'll define them statically since the MCP server tools are defined in mcp-server.ts
  // and getting runtime schemas is complex. This matches the actual tools.
  return `AVAILABLE TOOLS (call one when appropriate, respond JSON):

1. list_tokens(userAddress: string) - List tokens created by user
2. list_pools() - List available staking pools
3. list_airdrops() - List available airdrops
4. get_user_airdrops(userAddress: string) - Get airdrops user registered for
5. get_user_stakes(userAddress: string) - Get user's staking positions
6. create_airdrop(userAddress, tokenSymbol?, mintAddress?, amount, maxUsers, distributionTimeUnix, description?) - Create an airdrop
7. create_staking_pool(userAddress, tokenSymbol?, mintAddress?, rewardAmount, lockDays, multiplier, description?) - Create staking pool
8. stake_init(poolAddress, amount) - Stake INIT in a pool
9. register_airdrop(airdropAddress) - Register for an airdrop
10. claim_airdrop(airdropAddress, mintAddress?) - Claim airdrop tokens
11. claim_staking_rewards(poolAddress) - Claim staking rewards
12. create_token(name, symbol, supply, description?) - Create a new Initia token
13. search_pools(tokenSymbol?, minMultiplier?, maxLockDays?) - Search staking pools with filters
14. search_airdrops(tokenSymbol?, activeOnly?) - Search airdrops with filters
15. search_tokens(query) - Search tokens by name or symbol
16. check_airdrop_status(airdropAddress, userAddress) - Check if user is registered and claim time
17. explain_staking() - Explain how staking works
18. explain_airdrops() - Explain how airdrops work
19. calculate_rewards(amount, days, multiplier) - Calculate estimated staking rewards
20. help() - Show help
21. get_current_datetime() - Get current date/time`;
}

// In-memory tool registry for execution
interface ToolDef {
  name: string;
  description: string;
  parameters: Record<
    string,
    { type: string; description: string; required: boolean }
  >;
}

const TOOL_REGISTRY: ToolDef[] = [
  {
    name: "list_tokens",
    description: "List tokens created by user",
    parameters: {
      userAddress: {
        type: "string",
        description: "User wallet address",
        required: true,
      },
    },
  },
  {
    name: "list_pools",
    description: "List available staking pools",
    parameters: {},
  },
  {
    name: "list_airdrops",
    description: "List available airdrops",
    parameters: {},
  },
  {
    name: "get_user_airdrops",
    description: "Get airdrops user registered for",
    parameters: {
      userAddress: {
        type: "string",
        description: "User wallet address",
        required: true,
      },
    },
  },
  {
    name: "get_user_stakes",
    description: "Get user staking positions",
    parameters: {
      userAddress: {
        type: "string",
        description: "User wallet address",
        required: true,
      },
    },
  },
  {
    name: "create_airdrop",
    description: "Create an airdrop for a token",
    parameters: {
      userAddress: {
        type: "string",
        description: "User wallet address",
        required: true,
      },
      tokenSymbol: {
        type: "string",
        description: "Token symbol",
        required: false,
      },
      mintAddress: {
        type: "string",
        description: "Token mint address",
        required: false,
      },
      amount: {
        type: "number",
        description: "Total token amount",
        required: true,
      },
      maxUsers: {
        type: "number",
        description: "Max users who can claim",
        required: true,
      },
      distributionTimeUnix: {
        type: "number",
        description: "Unix timestamp for claim time",
        required: true,
      },
      description: {
        type: "string",
        description: "Airdrop description",
        required: false,
      },
    },
  },
  {
    name: "create_staking_pool",
    description: "Create a staking pool",
    parameters: {
      userAddress: {
        type: "string",
        description: "User wallet address",
        required: true,
      },
      tokenSymbol: {
        type: "string",
        description: "Token symbol",
        required: false,
      },
      mintAddress: {
        type: "string",
        description: "Token mint address",
        required: false,
      },
      rewardAmount: {
        type: "number",
        description: "Reward tokens",
        required: true,
      },
      lockDays: {
        type: "number",
        description: "Lock period days",
        required: true,
      },
      multiplier: {
        type: "number",
        description: "Reward multiplier",
        required: true,
      },
      description: {
        type: "string",
        description: "Pool description",
        required: false,
      },
    },
  },
  {
    name: "stake_init",
    description: "Stake INIT in a pool",
    parameters: {
      poolAddress: {
        type: "string",
        description: "Pool address",
        required: true,
      },
      amount: { type: "number", description: "INIT amount", required: true },
    },
  },
  {
    name: "register_airdrop",
    description: "Register for an airdrop",
    parameters: {
      airdropAddress: {
        type: "string",
        description: "Airdrop address",
        required: true,
      },
    },
  },
  {
    name: "claim_airdrop",
    description: "Claim airdrop tokens",
    parameters: {
      airdropAddress: {
        type: "string",
        description: "Airdrop address",
        required: true,
      },
      mintAddress: {
        type: "string",
        description: "Token mint address",
        required: false,
      },
    },
  },
  {
    name: "claim_staking_rewards",
    description: "Claim staking rewards",
    parameters: {
      poolAddress: {
        type: "string",
        description: "Pool address",
        required: true,
      },
    },
  },
  {
    name: "create_token",
    description: "Create a new Initia token with AI-generated logo",
    parameters: {
      name: {
        type: "string",
        description: "Token name (1-32 chars)",
        required: true,
      },
      symbol: {
        type: "string",
        description: "Token symbol (1-10 chars)",
        required: true,
      },
      supply: { type: "number", description: "Initial supply", required: true },
      description: {
        type: "string",
        description: "Token description",
        required: false,
      },
    },
  },
  { name: "help", description: "Show help", parameters: {} },
  {
    name: "get_current_datetime",
    description: "Get current date/time",
    parameters: {},
  },
  {
    name: "search_pools",
    description: "Search staking pools by token symbol or filter criteria",
    parameters: {
      tokenSymbol: { type: "string", description: "Token symbol to filter by", required: false },
      minMultiplier: { type: "number", description: "Minimum multiplier to filter", required: false },
      maxLockDays: { type: "number", description: "Maximum lock days to filter", required: false },
    },
  },
  {
    name: "search_airdrops",
    description: "Search airdrops by token symbol or active status",
    parameters: {
      tokenSymbol: { type: "string", description: "Token symbol to filter by", required: false },
      activeOnly: { type: "boolean", description: "Show only active airdrops", required: false },
    },
  },
  {
    name: "search_tokens",
    description: "Search tokens by name or symbol",
    parameters: {
      query: { type: "string", description: "Search query for token name or symbol", required: true },
    },
  },
  {
    name: "check_airdrop_status",
    description: "Check if a specific airdrop is claimable by a user and when",
    parameters: {
      airdropAddress: { type: "string", description: "Airdrop pool address", required: true },
      userAddress: { type: "string", description: "User wallet address", required: true },
    },
  },
  { name: "explain_staking", description: "Explain how staking works", parameters: {} },
  { name: "explain_airdrops", description: "Explain how airdrops work", parameters: {} },
  {
    name: "calculate_rewards",
    description: "Calculate estimated staking rewards based on amount, days, and multiplier",
    parameters: {
      amount: { type: "number", description: "Amount of tokens to stake", required: true },
      days: { type: "number", description: "Number of days to stake", required: true },
      multiplier: { type: "number", description: "Reward multiplier (e.g., 1.5, 2.0)", required: true },
    },
  },
];

// Convert tool registry to Cloudflare OpenAI-compatible tools format
function getCloudflareTools() {
  return TOOL_REGISTRY.map((t) => ({
    type: "function",
    function: {
      name: t.name,
      description: t.description,
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(t.parameters).map(([k, v]) => [
            k,
            { type: v.type, description: v.description },
          ]),
        ),
        required: Object.entries(t.parameters)
          .filter(([_, v]) => v.required)
          .map(([k]) => k),
      },
    },
  }));
}

// Call Cloudflare AI with tool support
async function callCloudflare(
  messages: Array<{ role: string; content: string }>,
  tools: any[],
): Promise<{
  response: string;
  toolCalls?: Array<{ name: string; arguments: Record<string, any> }>;
}> {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/zai-org/glm-4.7-flash`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages,
        tools,
        tool_choice: "auto",
        max_tokens: 1024,
        temperature: 0.3,
      }),
    },
  );

  if (!response.ok) {
    const errBody = await response.text();
    console.error("Cloudflare AI error:", response.status, errBody);
    throw new Error(
      `Cloudflare AI failed: ${response.status} - ${errBody.substring(0, 500)}`,
    );
  }

  const data = (await response.json()) as any;
  const result = data.result;

  // Check for native tool calls in OpenAI format
  if (result?.choices?.[0]?.message?.tool_calls?.length > 0) {
    return {
      response: result.choices[0].message.content || "",
      toolCalls: result.choices[0].message.tool_calls.map((tc: any) => ({
        name: tc.function.name,
        arguments:
          typeof tc.function.arguments === "string"
            ? JSON.parse(tc.function.arguments)
            : tc.function.arguments,
      })),
    };
  }

  // Fallback: try to parse JSON tool calls from response text
  const aiResponse =
    result?.response || result?.choices?.[0]?.message?.content || "";
  const toolCalls = parseToolCallsFromText(aiResponse);
  if (toolCalls.length > 0) {
    return { response: "", toolCalls };
  }

  return { response: aiResponse };
}

// Parse tool calls from LLM text response (fallback when native tool calling not supported)
function parseToolCallsFromText(
  text: string,
): Array<{ name: string; arguments: Record<string, any> }> {
  if (!text) return [];

  try {
    // Try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return [];

    const cleaned = jsonMatch[0]
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    // Check if it's a tool call format: { "tool": "name", "args": {...} } or { "tool_name": "name", "parameters": {...} }
    if (parsed.tool && TOOL_REGISTRY.some((t) => t.name === parsed.tool)) {
      return [
        {
          name: parsed.tool,
          arguments: parsed.args || parsed.arguments || parsed.parameters || {},
        },
      ];
    }
    if (
      parsed.tool_name &&
      TOOL_REGISTRY.some((t) => t.name === parsed.tool_name)
    ) {
      return [
        {
          name: parsed.tool_name,
          arguments: parsed.args || parsed.arguments || parsed.parameters || {},
        },
      ];
    }
    if (parsed.action && TOOL_REGISTRY.some((t) => t.name === parsed.action)) {
      return [
        {
          name: parsed.action,
          arguments: parsed.args || parsed.arguments || parsed.parameters || {},
        },
      ];
    }
  } catch {
    // Not valid JSON, no tool call
  }

  return [];
}

const SYSTEM_PROMPT = `You are a DeFi assistant on Initia. You help users with tokens, staking, and airdrops.
Respond in English concisely and friendly.

RULES:
- Use available tools when the user wants to perform an action
- If the user types "/help", "help", or "help", use the "help" tool to show available tools
- Use userAddress from context when the tool requires it
- For airdrop distribution, calculate Unix timestamp: now + desired seconds (1 day = 86400, 2 days = 172800)
- If the user asks for an "attractive description", generate an attractive description in the description field
- When the tool executes, summarize the result and ask the user to sign if needed
- MAINTAIN CONTEXT: if the user just created a pool/airdrop and asks to "improve the description", they mean that one
- If the user says "make it up" or "create it" about a description, generate something attractive and call the tool again with the new description
- DO NOT ask for data you already have. If you just executed a tool and the user wants to change something, re-execute the tool with the new data`;

// Track conversation context per user
const userContexts = new Map<
  string,
  Array<{ role: string; content: string }>
>();

export async function runAgent(
  userMessage: string,
  userAddress: string,
): Promise<{
  response: string;
  intent?: string;
  metadata?: Record<string, any>;
}> {
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
    return { response: "Error: Cloudflare credentials not configured." };
  }

  // Fetch user tokens for context
  const userTokens = await Token.find({ owner: userAddress }).limit(10).lean();
  const tokenContext =
    userTokens.length > 0
      ? `\nYour available tokens:\n${userTokens.map((t) => `- ${t.symbol} (${t.name}) - Mint: ${t.contractAddress}`).join("\n")}`
      : "\nYou have no created tokens.";

  // Get or create conversation history
  let messages = userContexts.get(userAddress) || [];
  if (messages.length === 0) {
    messages.push({ role: "system", content: SYSTEM_PROMPT + tokenContext });
  } else {
    // Update system prompt with fresh token data
    messages[0] = { role: "system", content: SYSTEM_PROMPT + tokenContext };
  }

  // Inject user address into context
  const contextMessage = `[Context: The user is ${userAddress}]`;
  messages.push({ role: "user", content: `${contextMessage}\n${userMessage}` });

  // Keep conversation manageable (last 20 messages)
  if (messages.length > 22) {
    const systemMsg = messages[0];
    messages = [systemMsg, ...messages.slice(-20)];
  }

  const tools = getCloudflareTools();
  let metadata: Record<string, any> | undefined;
  let toolResult = "";

  try {
    // Tool calling loop (max 3 iterations)
    for (let i = 0; i < 3; i++) {
      const result = await callCloudflare(messages, tools);

      if (!result.toolCalls || result.toolCalls.length === 0) {
        // No tool call - this is the final response
        let finalResponse =
          result.response || "Sorry, I couldn't process your request.";

        // If we had a tool result, use the tool text as fallback
        if (toolResult && !result.response) {
          finalResponse = toolResult;
        }

        messages.push({ role: "assistant", content: finalResponse });
        userContexts.set(userAddress, messages);

        return { response: finalResponse, metadata };
      }

      // Execute tool calls
      for (const toolCall of result.toolCalls) {
        const { name, arguments: args } = toolCall;

        // Add userAddress to args if not present
        if (
          name !== "help" &&
          name !== "get_current_datetime" &&
          name !== "list_pools" &&
          name !== "list_airdrops"
        ) {
          if (!args.userAddress && !args.poolAddress && !args.airdropAddress) {
            args.userAddress = userAddress;
          }
        }

        // Execute tool directly (since we're in the same process)
        const toolOutput = await executeTool(name, args, userAddress);
        toolResult = toolOutput.text;

        // Always capture metadata from tool, preserving the action
        if (toolOutput.metadata) {
          metadata = toolOutput.metadata;
        }

        // Add tool result to conversation
        messages.push({ role: "assistant", content: result.response || "" });
        messages.push({
          role: "user",
          content: `[Tool ${name} result]: ${toolOutput.text}`,
        });
      }
    }

    // Max iterations reached
    return { response: toolResult || "Operation completed.", metadata };
  } catch (error: any) {
    console.error("Agent error:", error);
    return {
      response: `Error: ${error.message || "Could not process your request."}`,
    };
  }
}

async function executeTool(
  name: string,
  args: Record<string, any>,
  userAddress: string,
): Promise<{ text: string; metadata?: Record<string, any> }> {
  try {
    switch (name) {
      case "list_tokens": {
        const addr = args.userAddress || userAddress;
        const tokens = await Token.find({ owner: addr }).limit(10).lean();
        if (tokens.length === 0)
          return {
            text: 'You have no created tokens. You can create one in the "Create Coin" section.',
          };
        const text = tokens
          .map(
            (t) =>
              `• ${t.name} (${t.symbol}) - Supply: ${Number(t.supply).toLocaleString()} - Address: ${t.contractAddress}`,
          )
          .join("\n");
        return { text: `Your tokens:\n${text}` };
      }

      case "list_pools": {
        const pools = await StakingPool.find({}).limit(20).lean();
        if (pools.length === 0)
          return { text: "No staking pools available." };
        const text = pools
          .slice(0, 5)
          .map(
            (p, i) =>
              `${i + 1}. ${p.tokenName} (${p.tokenSymbol}) - Rewards: ${p.rewardAmount} - Lock: ${p.lockSeconds / 86400} days - Address: ${p.poolAddress}`,
          )
          .join("\n");
        return { text: `Available staking pools:\n${text}` };
      }

      case "list_airdrops": {
        const airdrops = await Airdrop.find({ isCancelled: { $ne: true } })
          .limit(20)
          .lean();
        if (airdrops.length === 0)
          return { text: "No airdrops available." };
        const now = Date.now();
        const active = airdrops.filter(
          (a) => new Date(a.distributionTime).getTime() > now,
        );
        if (active.length === 0) return { text: "No active airdrops." };
        const text = active
          .slice(0, 5)
          .map(
            (a, i) =>
              `${i + 1}. ${a.tokenName} (${a.tokenSymbol}) - Amount: ${a.totalAmount} - Distribution: ${new Date(a.distributionTime).toLocaleDateString()} - Address: ${a.poolAddress}`,
          )
          .join("\n");
        return { text: `Active airdrops:\n${text}` };
      }

      case "get_user_airdrops":
        return {
          text: "To view your registered airdrops, visit your profile in the Airdrops section.",
        };

      case "get_user_stakes":
        return {
          text: "To view your stakes, visit your profile in the Staking section.",
        };

      case "create_airdrop": {
        let mintAddr = args.mintAddress;
        let symbol = args.tokenSymbol || "TKN";

        // Validate mintAddress is a real EVM address (0x... 42 chars)
        if (
          mintAddr &&
          (!mintAddr.startsWith("0x") || mintAddr.length !== 42)
        ) {
          mintAddr = undefined; // invalid, fall back to lookup
        }

        if (!mintAddr) {
          const token = await Token.findOne({
            owner: userAddress,
            ...(symbol ? { symbol: { $regex: new RegExp(symbol, "i") } } : {}),
          }).lean();
          if (!token) {
            // Try first token
            const firstToken = await Token.findOne({
              owner: userAddress,
            }).lean();
            if (firstToken) {
              mintAddr = firstToken.contractAddress;
              symbol = firstToken.symbol;
            } else {
              return {
                text: "No tokens found. Create a token first.",
              };
            }
          } else {
            mintAddr = token.contractAddress;
          }
        }

        const nowSec = Math.floor(Date.now() / 1000);
        const defaultTime = nowSec + 172800; // 2 days default
        const distributionTime = Math.max(
          args.distributionTimeUnix || 0,
          nowSec + 7200,
        ); // min 2h buffer
        const distributionDate = new Date(distributionTime * 1000);
        const desc =
          args.description ||
          `Don't miss this exclusive airdrop of ${args.amount} ${symbol}! Claim your share of tokens.`;

        const meta = {
          action: "create_airdrop",
          mintAddress: mintAddr,
          tokenSymbol: symbol,
          amount: args.amount,
          maxUsers: args.maxUsers || 10,
          distributionTime: distributionTime,
          description: desc,
          readyToSign: true,
        };

        return {
          text: `Airdrop ready to create:\n• Token: ${symbol}\n• Amount: ${args.amount}\n• Max users: ${args.maxUsers || 10}\n• Distribution: ${distributionDate.toLocaleString()}\n• Description: ${desc}\n\nSign the transaction with your wallet to create the airdrop.`,
          metadata: meta,
        };
      }

      case "create_staking_pool": {
        let mintAddr = args.mintAddress;
        let symbol = args.tokenSymbol || "TKN";

        // Validate mintAddress is a real EVM address (0x... 42 chars)
        if (
          mintAddr &&
          (!mintAddr.startsWith("0x") || mintAddr.length !== 42)
        ) {
          mintAddr = undefined; // invalid, fall back to lookup
        }

        if (!mintAddr) {
          const token = await Token.findOne({
            owner: userAddress,
            ...(symbol ? { symbol: { $regex: new RegExp(symbol, "i") } } : {}),
          }).lean();
          if (!token) {
            const firstToken = await Token.findOne({
              owner: userAddress,
            }).lean();
            if (firstToken) {
              mintAddr = firstToken.contractAddress;
              symbol = firstToken.symbol;
            } else {
              return {
                text: "No tokens found. Create a token first.",
              };
            }
          } else {
            mintAddr = token.contractAddress;
          }
        }

        const lockDays = args.lockDays || 30;
        const multiplier = args.multiplier || 1.5;
        const desc =
          args.description ||
          `Stake and earn up to ${multiplier}x rewards in ${args.rewardAmount} tokens. Grow your holdings!`;

        const meta = {
          action: "create_pool",
          mintAddress: mintAddr,
          tokenSymbol: symbol,
          rewardAmount: args.rewardAmount,
          lockDays,
          multiplier,
          description: desc,
          readyToSign: true,
        };

        return {
          text: `Staking pool ready to create:\n• Token: ${symbol}\n• Rewards: ${args.rewardAmount} tokens\n• Lock: ${lockDays} days\n• Multiplier: ${multiplier}x\n• Description: ${desc}\n\nSign the transaction with your wallet to create the pool.`,
          metadata: meta,
        };
      }

      case "stake_init": {
        const meta = {
          action: "stake",
          poolAddress: args.poolAddress,
          amount: args.amount,
          readyToSign: true,
        };
        return {
          text: `Stake ready to sign:\n• Pool: ${args.poolAddress}\n• Amount: ${args.amount} INIT\n\nSign the transaction with your wallet.`,
          metadata: meta,
        };
      }

      case "register_airdrop": {
        const airdrop = await Airdrop.findOne({
          poolAddress: args.airdropAddress,
        }).lean();
        if (!airdrop) return { text: "Airdrop not found." };
        return {
          text: `Registration ready to sign:\n• Airdrop: ${airdrop.tokenName} (${airdrop.tokenSymbol})\n• Total amount: ${airdrop.totalAmount}\n\nSign the transaction with your wallet to register.`,
          metadata: {
            action: "register_airdrop",
            airdropAddress: args.airdropAddress,
            readyToSign: true,
          },
        };
      }

      case "claim_airdrop": {
        const airdrop = await Airdrop.findOne({
          poolAddress: args.airdropAddress,
        }).lean();
        if (!airdrop) return { text: "Airdrop not found." };
        return {
          text: `Claim ready to sign:\n• Airdrop: ${airdrop.tokenName} (${airdrop.tokenSymbol})\n\nSign the transaction with your wallet to claim your tokens.`,
          metadata: {
            action: "claim_airdrop",
            airdropAddress: args.airdropAddress,
            mintAddress: args.mintAddress || airdrop.mintAddress,
            readyToSign: true,
          },
        };
      }

      case "claim_staking_rewards":
        return {
          text: "Rewards claim ready to sign.\n\nSign the transaction with your wallet to claim your rewards.",
          metadata: {
            action: "claim_staking_rewards",
            poolAddress: args.poolAddress,
            readyToSign: true,
          },
        };

      case "create_token": {
        const name = args.name.substring(0, 32);
        const symbol = args.symbol.toUpperCase().substring(0, 10);
        const supply = args.supply;
        const desc =
          args.description || `${name} (${symbol}) - Token created on Initia`;

        // Generate logo
        let logo: string | undefined;
        try {
          logo = await generateTokenLogo(name, symbol);
        } catch (err) {
          // Logo generation failed, continue without logo
        }

        const logoText = logo ? `\n\n![${name} Logo](${logo})` : "";
        return {
          text: `**${name} (${symbol})** ready to create:\n• Supply: ${supply.toLocaleString()}\n• Description: ${desc}${logoText}\n\nSign the transaction with your wallet to create the token.`,
          metadata: {
            action: "create_token",
            name,
            symbol,
            supply,
            description: desc,
            logo: logo || "",
            readyToSign: true,
          },
        };
      }

      case "help": {
        const toolsList = TOOL_REGISTRY.filter(
          (t) => t.name !== "help" && t.name !== "get_current_datetime",
        )
          .map((t) => {
            const params = Object.entries(t.parameters)
              .map(([k, v]) => (v.required ? k : `${k}?`))
              .join(", ");
            return `• **${t.name}**(${params}) - ${t.description}`;
          })
          .join("\n");

        return {
          text: `**Available tools:**\n\n${toolsList}\n\n**Examples:**\n• "create token Llamacoin, symbol LLMC, supply 1000000"\n• "create airdrop of 100 LLMC tokens, 10 users, in 2 days"\n• "create staking pool, 500 tokens, 30 days, 2x"\n• "stake 5 INIT in pool X"\n• "my tokens"\n• "show pools"\n• "show airdrops"`,
        };
      }

    case "get_current_datetime":
      return {
        text: new Date().toLocaleString("en-US", {
          timeZone: "UTC",
        }),
      };

    case "search_pools": {
      const filter: any = {};
      if (args.tokenSymbol) {
        filter.tokenSymbol = { $regex: new RegExp(args.tokenSymbol, 'i') };
      }
      if (args.minMultiplier || args.maxLockDays) {
        filter.$or = [];
        if (args.minMultiplier) {
          filter.$or.push({ multiplierBps: { $gte: Math.round(args.minMultiplier * 10000) } });
        }
        if (args.maxLockDays) {
          filter.$or.push({ lockSeconds: { $lte: args.maxLockDays * 86400 } });
        }
      }
      const pools = await StakingPool.find(filter).limit(20).lean();
      if (pools.length === 0) {
        return { text: "No staking pools match your search criteria." };
      }
      const text = pools.slice(0, 5).map((p, i) =>
        `${i + 1}. ${p.tokenName} (${p.tokenSymbol}) - Rewards: ${p.rewardAmount} - Lock: ${p.lockSeconds / 86400} days - Multiplier: ${(p.multiplierBps / 10000).toFixed(2)}x - Address: ${p.poolAddress}`
      ).join('\n');
      return { text: `Found ${pools.length} staking pools:\n\n${text}` };
    }

    case "search_airdrops": {
      const filter: any = { isCancelled: { $ne: true } };
      if (args.tokenSymbol) {
        filter.tokenSymbol = { $regex: new RegExp(args.tokenSymbol, 'i') };
      }
      if (args.activeOnly) {
        filter.distributionTime = { $gt: new Date() };
      }
      const airdrops = await Airdrop.find(filter).limit(20).lean();
      if (airdrops.length === 0) {
        return { text: "No airdrops found matching your criteria." };
      }
      const text = airdrops.slice(0, 5).map((a, i) =>
        `${i + 1}. ${a.tokenName} (${a.tokenSymbol}) - Amount: ${a.totalAmount} - Distribution: ${new Date(a.distributionTime).toLocaleString()} - Address: ${a.poolAddress}`
      ).join('\n');
      return { text: `Found ${airdrops.length} airdrops:\n\n${text}` };
    }

    case "search_tokens": {
      const filter = {
        $or: [
          { name: { $regex: new RegExp(args.query, 'i') } },
          { symbol: { $regex: new RegExp(args.query, 'i') } }
        ]
      };
      const tokens = await Token.find(filter).limit(20).lean();
      if (tokens.length === 0) {
        return { text: "No tokens found matching your search." };
      }
      const text = tokens.map((t, i) =>
        `${i + 1}. ${t.name} (${t.symbol}) - Supply: ${Number(t.supply).toLocaleString()} - Owner: ${t.owner.substring(0, 8)}... - Address: ${t.contractAddress}`
      ).join('\n');
      return { text: `Found ${tokens.length} tokens:\n\n${text}` };
    }

    case "check_airdrop_status": {
      const airdrop = await Airdrop.findOne({ poolAddress: args.airdropAddress }).lean();
      if (!airdrop) {
        return { text: `Airdrop not found at address ${args.airdropAddress}.` };
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
        text: `**Airdrop Status**\n\n${airdrop.tokenName} (${airdrop.tokenSymbol})\n- Pool: ${airdrop.poolAddress}\n- Amount: ${airdrop.totalAmount}\n- Max Users: ${airdrop.maxUsers}\n- Status: ${status}`
      };
    }

    case "explain_staking":
      return {
        text: `# Staking Explained\n\n**What is Staking?**\nStaking involves locking your tokens in a smart contract to support network operations and earn rewards.\n\n**Key Concepts:**\n• **Lock Period**: How long tokens are locked (in days)\n• **Reward Multiplier**: Bonus rate for staking (e.g., 1.5x = 50% bonus)\n• **Rewards**: Tokens you earn for staking\n\n**Example:**\nIf you stake 100 tokens with a 2x multiplier for 30 days, you could earn 100 additional tokens as rewards.\n\n**Benefits:**\n✓ Earn passive income\n✓ Support the ecosystem\n✓ Higher returns than holding`
      };

    case "explain_airdrops":
      return {
        text: `# Airdrops Explained\n\n**What is an Airdrop?**\nAirdrops distribute free tokens to community members as rewards or promotions.\n\n**How it Works:**\n1. Creator sets total amount and max users\n2. Users register before distribution time\n3. Creator distributes tokens automatically\n\n**Key Terms:**\n• **Registration**: Signing up to receive tokens\n• **Distribution Time**: When tokens become claimable\n• **Max Users**: Maximum participants allowed\n\n**Tips:**\n✓ Register early - spots fill up!\n✓ Check distribution times\n✓ Read description for eligibility`
      };

    case "calculate_rewards": {
      const rewards = args.amount * (args.multiplier - 1);
      const total = args.amount + rewards;
      const dailyReturn = (rewards / args.amount) * 100 / args.days;
      const annualApy = (rewards / args.amount) * (365 / args.days) * 100;
      
      return {
        text: `# Staking Rewards Calculator\n\n**Input:**\n• Amount Staked: ${args.amount} tokens\n• Lock Period: ${args.days} days\n• Multiplier: ${args.multiplier}x\n\n**Results:**\n• Rewards Earned: ${rewards.toFixed(2)} tokens\n• Total Return: ${total.toFixed(2)} tokens\n• Daily Rate: ${dailyReturn.toFixed(4)}%\n• Annual APY: ${annualApy.toFixed(2)}%`
      };
    }

    default:
      return { text: `Unknown tool: ${name}` };
    }
  } catch (error: any) {
    console.error(`Error executing tool ${name}:`, error);
    return { text: `Error executing ${name}: ${error.message}` };
  }
}

// Clear conversation for a user
export function clearUserConversation(userAddress: string) {
  userContexts.delete(userAddress);
}
