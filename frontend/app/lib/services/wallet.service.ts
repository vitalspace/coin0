"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useInterwovenKit } from "@initia/interwovenkit-react";
import { loginWithWallet } from "./api.service";
import { toast } from "../stores/toastStore";
import { useAutoSignStore } from "../stores/autoSignStore";

export const MY_ROLLUP = {
  chain_id: "coin0xyz",
  chain_name: "coin0xyz",
  pretty_name: "Coin0",
  network_type: "testnet" as const,
  bech32_prefix: "init",
  fees: {
    fee_tokens: [
      {
        denom: "GAS",
        fixed_min_gas_price: 0,
        low_gas_price: 0,
        average_gas_price: 0,
        high_gas_price: 0,
      },
    ],
  },
  apis: {
    rpc: [{ address: "http://localhost:26657" }],
    rest: [{ address: "http://localhost:1317" }],
    indexer: [{ address: "http://localhost:8080" }],
    "json-rpc": [{ address: "http://localhost:8545" }],
  },
  staking: { staking_tokens: [{ denom: "GAS" }] },
  native_assets: [
    { denom: "GAS", name: "Gas Token", symbol: "GAS", decimals: 18 },
  ],
  metadata: {
    is_l1: false,
    minitia: { type: "minievm" as const },
  },
  logo_URIs: {
    png: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/initia.png",
    svg: "https://raw.githubusercontent.com/initia-labs/initia-registry/main/testnets/initia/images/initia.svg",
  },
};

export const CHAIN_ID = MY_ROLLUP.chain_id;
export const REST_URL = MY_ROLLUP.apis.rest[0].address;

function truncateAddress(str: string, maxLength = 12): string {
  return str.length > maxLength
    ? `${str.slice(0, 6)}...${str.slice(-4)}`
    : str;
}

export function useWallet() {
  const {
    address,
    initiaAddress,
    requestTxSync,
    requestTxBlock,
    submitTxBlock,
    estimateGas,
    openConnect,
    openWallet,
    autoSign,
  } = useInterwovenKit();
  const [loading, setLoading] = useState(false);
  const { enabled: autoSignEnabled, setEnabled: setAutoSignEnabled, syncFromSDK } = useAutoSignStore();
  const hasLoggedInRef = useRef(false);

  useEffect(() => {
  if (address && !hasLoggedInRef.current) {
   const hasLoggedInBefore = localStorage.getItem("wallet_logged_in");
   if (hasLoggedInBefore) {
    hasLoggedInRef.current = true;
    return;
   }
   hasLoggedInRef.current = true;
   localStorage.setItem("wallet_logged_in", "true");
   loginWithWallet(address)
   .then((response) => {
    if (response.token) {
     localStorage.setItem("auth_token", response.token);
     toast.success("Wallet connected successfully!");
    }
   })
   .catch((err) => {
    console.error("Login failed:", err);
   });
  }
  }, [address]);

  // Efecto 1: Sincroniza el estado del SDK al montar el componente
  useEffect(() => {
    if (typeof window === "undefined" || !autoSign) return;
    
    // Sincroniza el estado inicial del SDK con nuestro store
    syncFromSDK(autoSign, CHAIN_ID);
  }, []);

  // Efecto 2: Sincroniza cuando cambia el estado del SDK (para mantener consistencia)
  useEffect(() => {
    if (typeof window === "undefined" || !autoSign) return;

    const sdkIsEnabled = !!autoSign.isEnabledByChain?.[CHAIN_ID];
    const storeIsEnabled = autoSignEnabled;
    
    if (sdkIsEnabled !== storeIsEnabled) {
      console.log("[useWallet] Corrigiendo desincronización del estado:", {
        sdk: sdkIsEnabled,
        store: storeIsEnabled
      });
      setAutoSignEnabled(sdkIsEnabled);
      localStorage.setItem("autosign_enabled", String(sdkIsEnabled));
    }
  }, [autoSign.isEnabledByChain?.[CHAIN_ID]]);
  
  // Efecto 3: Detecta el estado al cambiar de ruta/actualizar
  useEffect(() => {
    if (typeof window === "undefined" || !autoSign || !address) return;
    
    // Verifica periódicamente el estado para detectar cambios
    const interval = setInterval(() => {
      const sdkIsEnabled = !!autoSign.isEnabledByChain?.[CHAIN_ID];
      const storedState = localStorage.getItem("autosign_enabled") === "true";
      
      if (sdkIsEnabled !== storedState || sdkIsEnabled !== autoSignEnabled) {
        console.log("[useWallet] Restaurando estado perdido del SDK:", sdkIsEnabled);
        setAutoSignEnabled(sdkIsEnabled);
        localStorage.setItem("autosign_enabled", String(sdkIsEnabled));
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoSign.isEnabledByChain, address, autoSignEnabled]);

  const connect = useCallback(() => {
    openConnect();
  }, [openConnect]);

const executeTx = useCallback(async (txMsg: Parameters<typeof requestTxSync>[0]) => {
  if (!initiaAddress) {
   throw new Error("Wallet not connected");
  }
  if (!txMsg.messages?.length) {
   throw new Error("No messages provided");
  }

  const normalizedMessages = txMsg.messages.map((msg, idx) => {
   if (msg.typeUrl === "/minievm.evm.v1.MsgCall") {
    const v = msg.value as any;
    const sender = v.sender || initiaAddress;
    const contractAddr = v.contract_addr || v.contractAddr || "";
    const input = v.input || "";
    const value = v.value ?? "0";
    const accessList = v.access_list || v.accessList || [];
    const authList = v.auth_list || v.authList || [];

    if (!sender || sender.trim() === "") {
     throw new Error(`[executeTx] Message ${idx}: sender is empty`);
    }
    if (!contractAddr || contractAddr.trim() === "") {
     throw new Error(`[executeTx] Message ${idx}: contract_addr is empty`);
    }
    if (!input || input.trim() === "") {
     throw new Error(`[executeTx] Message ${idx}: input calldata is empty`);
    }

    return {
     typeUrl: msg.typeUrl,
     value: { sender, contract_addr: contractAddr, contractAddr, input, value, access_list: accessList, accessList, auth_list: authList, authList },
    };
   }
   return msg;
  });

const hasAutoSignGrant = !!(autoSign.granteeByChain && autoSign.granteeByChain[CHAIN_ID]);
  const sdkIsEnabled = !!autoSign.isEnabledByChain[CHAIN_ID];
  const canUseAutoSign = autoSignEnabled && hasAutoSignGrant && sdkIsEnabled;
  console.log("[executeTx] autoSign status:", {
   autoSignEnabled,
   hasAutoSignGrant,
   sdkIsEnabled,
   canUseAutoSign,
   granteeByChain: autoSign.granteeByChain[CHAIN_ID],
  });

  setLoading(true);
  try {
    let result: unknown;

    if (canUseAutoSign) {
      console.log("[executeTx] All conditions met, attempting submitTxBlock...");
      try {
        console.log("[executeTx] Estimating gas...");
        const gasEstimate = await estimateGas({ chainId: CHAIN_ID, messages: normalizedMessages });
        console.log("[executeTx] Gas estimate:", gasEstimate);
        const fee = { gas: Math.ceil(gasEstimate * 1.4), amount: "0", denom: "GAS" };
        console.log("[executeTx] Calling submitTxBlock...");
        result = await submitTxBlock({ chainId: CHAIN_ID, messages: normalizedMessages, fee });
        console.log("[executeTx] submitTxBlock succeeded!");
      } catch (autoSignErr: unknown) {
        const errStr = String(autoSignErr);
        console.warn("[executeTx] submitTxBlock failed:", errStr);
        console.log("[executeTx] Falling back to requestTxBlock...");
        result = await requestTxBlock({ chainId: CHAIN_ID, messages: normalizedMessages });
      }
    } else {
      console.log("[executeTx] AutoSign not fully ready, using requestTxBlock...");
      result = await requestTxBlock({ chainId: txMsg.chainId || CHAIN_ID, messages: normalizedMessages });
    }

   console.log("[executeTx] Tx result:", result);

   let txHash: string;
   if (typeof result === 'string') {
    txHash = result;
   } else if (result && typeof result === 'object') {
    txHash = (result as any).txHash || (result as any).hash || (result as any).transactionHash || '';
    if (!txHash) {
     console.warn('[executeTx] Unknown result shape:', JSON.stringify(result));
     txHash = `tx-${Date.now()}`;
    }
   } else {
    txHash = `tx-${Date.now()}`;
   }

   console.log("[executeTx] Tx hash:", txHash, "| type:", typeof result);
   await new Promise((r) => setTimeout(r, 2000));
   return txHash;
  } catch (err) {
   console.error("[executeTx] Tx failed:", err);
   throw err;
  } finally {
   setLoading(false);
  }
}, [initiaAddress, requestTxBlock, autoSign, autoSignEnabled]);

 return {
    address,
    initiaAddress,
    connected: !!address,
    loading,
    truncatedAddress: address ? truncateAddress(address) : null,
    connect,
    openWallet,
    executeTx,
    autoSign,
    autoSignEnabled,
    setAutoSignEnabled,
  };
}