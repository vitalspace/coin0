"use client";

import { createPublicClient, encodeFunctionData, http, getAddress, isAddress } from "viem";
import { AccAddress } from "@initia/initia.js";
import memecoinFactoryABI from "../abi/memecoinFactory.json";
import memecoinABI from "../abi/memecoin.json";

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_MEMECOIN_FACTORY_ADDRESS as `0x${string}`;
const RPC_URL = process.env.NEXT_PUBLIC_EVM_RPC_URL || "http://localhost:8545";

export function toEvmAddress(bech32Address: string): `0x${string}` {
  try {
    // Accept EVM addresses even without checksum (lowercase)
    if (bech32Address.startsWith("0x") && bech32Address.length === 42) {
      return bech32Address.toLowerCase() as `0x${string}`;
    }
    if (isAddress(bech32Address)) {
      return bech32Address.toLowerCase() as `0x${string}`;
    }
    const hex = AccAddress.toHex(bech32Address);
    return getAddress(hex.toLowerCase());
  } catch {
    throw new Error(`Invalid address: ${bech32Address}`);
  }
}

export function toInitiaAddress(evmOrBech32: string): string {
  try {
    // If already bech32, return as-is
    if (evmOrBech32.startsWith("init")) {
      return evmOrBech32;
    }
    // Convert EVM address to bech32
    const hex = evmOrBech32.startsWith("0x") ? evmOrBech32 : `0x${evmOrBech32}`;
    const accAddress = AccAddress.fromHex(hex);
    return accAddress.toString();
  } catch {
    throw new Error(`Invalid address for Initia conversion: ${evmOrBech32}`);
  }
}

const EVM_CHAIN_ID = 3599095684429094;

export const publicClient = createPublicClient({
  chain: {
    id: EVM_CHAIN_ID,
    name: "Coin0",
    nativeCurrency: { name: "Gas", symbol: "GAS", decimals: 18 },
    rpcUrls: { default: { http: [RPC_URL] } },
  },
  transport: http(RPC_URL),
});

export interface CreateMemecoinParams {
  name: string;
  symbol: string;
  initialAddress: string;
  initialSupply: bigint;
}

export async function createMemecoinTx(params: CreateMemecoinParams) {
  const evmAddress = toEvmAddress(params.initialAddress);
  const calldata = encodeFunctionData({
    abi: memecoinFactoryABI,
    functionName: "createMemecoin",
    args: [
      params.name,
      params.symbol,
      evmAddress,
      params.initialSupply,
    ],
  });
  return calldata;
}

export async function getDeployedCoins() {
  const events = await publicClient.getLogs({
    address: FACTORY_ADDRESS,
    event: {
      type: "event",
      name: "MemecoinCreated",
      inputs: [
        { name: "contractAddress", type: "address", indexed: true },
        { name: "name", type: "string", indexed: false },
        { name: "symbol", type: "string", indexed: false },
        { name: "initialAddress", type: "address", indexed: false },
        { name: "initialSupply", type: "uint256", indexed: false },
      ],
    },
    fromBlock: BigInt(1),
  });

  return events.map((log) => ({
    address: log.args.contractAddress,
    name: log.args.name,
    symbol: log.args.symbol,
    initialAddress: toEvmAddress(log.args.initialAddress as string),
    initialSupply: log.args.initialSupply,
  }));
}

export async function getTokenCount(): Promise<bigint> {
  return (await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: memecoinFactoryABI,
    functionName: "getTokenCount",
    args: [],
  })) as unknown as bigint;
}

export async function getToken(index: bigint): Promise<string> {
  return (await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: memecoinFactoryABI,
    functionName: "getToken",
    args: [index],
  })) as unknown as string;
}

export async function getAllTokens(): Promise<string[]> {
  return (await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: memecoinFactoryABI,
    functionName: "getAllTokens",
    args: [],
  })) as unknown as string[];
}

export async function isToken(address: string): Promise<boolean> {
  const evmAddress = toEvmAddress(address);
  return (await publicClient.readContract({
    address: FACTORY_ADDRESS,
    abi: memecoinFactoryABI,
    functionName: "isToken",
    args: [evmAddress as `0x${string}`],
  })) as unknown as boolean;
}

export async function getTokenBalance(tokenAddress: string, ownerAddress: string) {
  const ownerEvm = toEvmAddress(ownerAddress);
  const data = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: memecoinABI,
    functionName: "balanceOf",
    args: [ownerEvm],
  });
  return data;
}

export async function getTokenDecimals(tokenAddress: string) {
  const data = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: memecoinABI,
    functionName: "decimals",
    args: [],
  });
  return Number(data);
}

export async function getTokenSymbol(tokenAddress: string) {
  const data = await publicClient.readContract({
    address: tokenAddress as `0x${string}`,
    abi: memecoinABI,
    functionName: "symbol",
    args: [],
  });
  return data;
}

// Function to fund a wallet with tokens from another wallet
export async function fundWalletWithTokens(
  tokenAddress: string,
  fromAddress: string,
  toAddress: string,
  amount: string,
  initiaAddress: string,
  executeTx: any
) {
  if (!initiaAddress) {
    throw new Error("Wallet not connected");
  }
  try {
    console.log("[fundWalletWithTokens] tokenAddress:", tokenAddress);
    console.log("[fundWalletWithTokens] fromAddress:", fromAddress);
    console.log("[fundWalletWithTokens] toAddress:", toAddress);
    console.log("[fundWalletWithTokens] initiaAddress:", initiaAddress);
    console.log("[fundWalletWithTokens] amount:", amount);
    
    // Get token decimals
    const decimals = await getTokenDecimals(tokenAddress);
    console.log("[fundWalletWithTokens] token decimals:", decimals);

    // Convert amount to raw units
    const rawAmount = BigInt(Math.round(parseFloat(amount) * Math.pow(10, decimals)));
    console.log("[fundWalletWithTokens] rawAmount:", rawAmount.toString());

    // Convert to Initia address format for MsgCall
    const tokenInitiaAddr = toInitiaAddress(tokenAddress);
    console.log("[fundWalletWithTokens] tokenInitiaAddr:", tokenInitiaAddr);
    
    // Create transferFrom calldata (transfer from faucet address to user)
    const transferCalldata = encodeFunctionData({
      abi: [
        {
          name: 'transferFrom',
          type: 'function',
          inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'amount', type: 'uint256' },
          ],
          outputs: [{ name: '', type: 'bool' }],
        },
      ],
      functionName: 'transferFrom',
      args: [getAddress(fromAddress), getAddress(toAddress), rawAmount],
    });
    console.log("[fundWalletWithTokens] transferCalldata:", transferCalldata);

    // Execute transfer
    const txHash = await executeTx({
      messages: [
        {
          typeUrl: "/minievm.evm.v1.MsgCall",
          value: {
            sender: initiaAddress,
            contract_addr: tokenAddress.toLowerCase() as `0x${string}`,
            input: transferCalldata,
            value: "0",
            access_list: [],
            auth_list: [],
          },
        },
      ],
    });

    return { success: true, hash: txHash };
  } catch (error: any) {
    console.error("[fundWalletWithTokens] Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getNewTokenAddress(): Promise<string | null> {
  try {
    console.log("=== getNewTokenAddress ===");
    
    const initialCount = await getTokenCount();
    console.log("Initial token count:", initialCount);
    
    await new Promise(r => setTimeout(r, 3000));
    
    const newCount = await getTokenCount();
    console.log("New token count:", newCount);
    
    if (newCount > initialCount) {
      const tokensAdded = Number(newCount - initialCount);
      console.log("Tokens added:", tokensAdded);
      
      for (let i = 0; i < tokensAdded; i++) {
        const index = initialCount + BigInt(i);
        const tokenAddr = await getToken(index);
        console.log(`Token at index ${index}:`, tokenAddr);
        if (tokenAddr && tokenAddr !== '0x0000000000000000000000000000000000000000') {
          return tokenAddr as `0x${string}`;
        }
      }
    }
    
    if (newCount > 0n) {
      const latestToken = await getToken(newCount - 1n);
      console.log("Latest token fallback:", latestToken);
      if (latestToken && latestToken !== '0x0000000000000000000000000000000000000000') {
        return latestToken as `0x${string}`;
      }
    }

    return null;
  } catch (err) {
    console.error("Error:", err);
    return null;
  }
}

export async function getTokenInfo(tokenAddress: string) {
  const [name, symbol, decimals, totalSupply] = await Promise.all([
    publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: memecoinABI,
      functionName: "name",
      args: [],
    }),
    publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: memecoinABI,
      functionName: "symbol",
      args: [],
    }),
    publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: memecoinABI,
      functionName: "decimals",
      args: [],
    }),
    publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: memecoinABI,
      functionName: "totalSupply",
      args: [],
    }),
  ]);

  return { name, symbol, decimals, totalSupply };
}

export { FACTORY_ADDRESS, memecoinFactoryABI, memecoinABI };