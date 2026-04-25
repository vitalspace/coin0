"use client";

import { Buffer } from "buffer";
if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

import {
  initiaPrivyWalletConnector,
  injectStyles,
  InterwovenKitProvider, 
  TESTNET,
} from "@initia/interwovenkit-react";
import InterwovenKitStyles from "@initia/interwovenkit-react/styles.js"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { createConfig, http, WagmiProvider } from "wagmi";

const evmChainId = 3599095684429094;

const coin0xyz = {
  id: evmChainId,
  name: "coin0xyz",
  nativeCurrency: { name: "GAS", symbol: "GAS", decimals: 18 },
  rpcUrls: {
    default: { http: ["http://localhost:8545"] },
  },
} as const;

const queryClient = new QueryClient();

const getWagmiConfig = () =>
  createConfig({
    chains: [coin0xyz],
    connectors: [initiaPrivyWalletConnector],
    transports: {
      [evmChainId]: http("http://localhost:8545"),
    },
  });

const customChain = {
 chain_id: "coin0xyz",
 chain_name: "coin0xyz",
 pretty_name: "Coin0",
 logo_URIs: {},
 network_type: "testnet",
 bech32_prefix: "init",
 fees: {
 fee_tokens: [{
 denom: "GAS",
 fixed_min_gas_price: 0,
 low_gas_price: 0,
 average_gas_price: 0,
 high_gas_price: 0,
 }]
 },
 staking: { staking_tokens: [{ denom: "GAS" }] },
 native_assets: [{ denom: "GAS", name: "Gas Token", symbol: "GAS", decimals: 18 }],
 apis: {
 rpc: [{ address: "http://localhost:26657" }],
 rest: [{ address: "http://localhost:1317" }],
 "json-rpc": [{ address: "http://localhost:8545" }],
 indexer: [{ address: "http://localhost:8080" }],
 },
 metadata: {
 is_l1: false,
 minitia: { type: "minievm" }
 },
 message_types: ["/minievm.evm.v1.MsgCall", "/cosmos.authz.v1beta1.MsgExec"],
};

export default function Providers({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);

  const wagmiConfig = useMemo(getWagmiConfig, []);

  useEffect(() => {
    injectStyles(InterwovenKitStyles);
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-[#6fc7ba]">Loading...</div>
      </div>
    );
  }

  return (
  <QueryClientProvider client={queryClient}>
    <WagmiProvider config={wagmiConfig}>
<InterwovenKitProvider
 {...TESTNET}
 defaultChainId="coin0xyz"
 customChain={customChain}
 customChains={[customChain]}
 enableAutoSign={{
  "coin0xyz": ["/minievm.evm.v1.MsgCall", "/cosmos.authz.v1beta1.MsgExec"],
 }}
>
          {children}
        </InterwovenKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
