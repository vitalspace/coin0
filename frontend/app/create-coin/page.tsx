'use client';

import { useState, useCallback } from "react";
import { useWallet, CHAIN_ID } from "../lib/services/wallet.service";
import {
  createMemecoinTx,
  FACTORY_ADDRESS,
  getNewTokenAddress,
} from "../lib/services/coin.factory.service";
import { parseUnits } from "viem";
import { createToken, generateMemecoinNames } from "../lib/services/api.service";
import type { MemecoinNameSuggestion } from "../lib/services/api.service";
import { toast } from "../lib/stores/toastStore";

import Background from "../lib/components/create-coin/Background";
import CreateCoinHeader from "../lib/components/create-coin/CreateCoinHeader";
import CoinForm from "../lib/components/create-coin/CoinForm";
import Guardian from "../lib/components/layout/Guardian";

export default function CreateCoinPage() {
  const { address, initiaAddress, connected, connect, executeTx, openWallet, loading: walletLoading } = useWallet();
  
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [supply, setSupply] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [generatorTheme, setGeneratorTheme] = useState("");
  const [generatorKeywords, setGeneratorKeywords] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorLoading, setGeneratorLoading] = useState(false);
  const [generatedSuggestions, setGeneratedSuggestions] = useState<MemecoinNameSuggestion[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const explorerUrl = txHash ? `https://explorer.initia.com/tx/${txHash}` : null;
  const creationFee = "0.02";

  const handleGenerateNames = useCallback(async () => {
    setGeneratorLoading(true);
    try {
      const response = await generateMemecoinNames({
        theme: generatorTheme || undefined,
        keywords: generatorKeywords || undefined,
        count: 5,
      });
      if (response.success && response.suggestions) {
        setGeneratedSuggestions(response.suggestions);
        toast.success(`Generated ${response.suggestions.length} suggestions!`);
      }
    } catch (err) {
      console.error("Failed to generate names:", err);
      toast.error("Failed to generate names");
    } finally {
      setGeneratorLoading(false);
    }
  }, [generatorTheme, generatorKeywords]);

  const handleSelectSuggestion = useCallback((suggestion: MemecoinNameSuggestion) => {
    setName(suggestion.name);
    setSymbol(suggestion.symbol);
    setShowGenerator(false);
    setGeneratedSuggestions([]);
    toast.success(`Selected: ${suggestion.name}`);
  }, []);

const handleCreate = useCallback(async () => {
  const missingFields: string[] = [];
  if (!name.trim()) missingFields.push("Name");
  if (!symbol.trim()) missingFields.push("Symbol");
  if (!supply.trim()) missingFields.push("Supply");

  if (missingFields.length > 0) {
    setError(`Missing required fields: ${missingFields.join(", ")}`);
    return;
  }

    setLoading(true);
    setCreating(true);
    setError(null);
    setSuccess(false);
    setTxHash(null);
    try {
      const supplyNum = parseFloat(supply);
      if (isNaN(supplyNum) || supplyNum <= 0) {
        throw new Error("Invalid supply amount");
      }

      const supplyInWei = parseUnits(supply, 18);
      const calldata = await createMemecoinTx({
        name,
        symbol,
        initialAddress: initiaAddress,
        initialSupply: supplyInWei,
      });

      const txHashResult = await executeTx({
        chainId: CHAIN_ID,
        messages: [
          {
            typeUrl: "/minievm.evm.v1.MsgCall",
             value: {
               sender: initiaAddress,
               contract_addr: FACTORY_ADDRESS,
               input: calldata,
               value: "0",
               access_list: [],
               auth_list: [],
             },
          },
        ],
      });

      if (!txHashResult) {
        throw new Error("Transaction was not completed");
      }

      setTxHash(txHashResult);

      const ownerAddress = address ?? "";

      const deployedAddress = await getNewTokenAddress();
      
      await createToken({
        txHash: String(txHashResult),
        name: String(name),
        symbol: String(symbol),
        owner: ownerAddress,
        supply: parseFloat(supply).toString(),
        contractAddress: deployedAddress || String(txHashResult),
        chainName: "initia",
        logo: imagePreview || undefined,
      });

      setContractAddress(deployedAddress || String(txHashResult));
      setSuccess(true);
      toast.success(`Token "${name}" created successfully!`);
    } catch (err) {
      console.error("Create token error:", err);
      const errorMessage = err instanceof Error ? err.message : "Transaction failed";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setCreating(false);
    }
  }, [initiaAddress, name, symbol, supply, executeTx, address, imagePreview]);

  return (
    <Guardian 
      title="Create Your Token" 
      subtitle="Deploy your token on the Initia Blockchain"
      networkLabel="Initia Network"
    >
      <div className="min-h-screen bg-black text-white pt-24 px-4 relative overflow-hidden">
        <Background />
        
        <div className="max-w-xl mx-auto relative">
          <CreateCoinHeader creationFee={creationFee} />
          
          <CoinForm
            tokenName={name}
            onTokenNameChange={setName}
            tokenSymbol={symbol}
            onTokenSymbolChange={(v) => setSymbol(v.toUpperCase())}
            tokenSupply={supply}
            onTokenSupplyChange={setSupply}
            imagePreview={imagePreview}
            onImagePreviewChange={setImagePreview}
            imageFile={imageFile}
            onImageFileChange={setImageFile}
            walletAddress={address || ""}
            loading={loading}
            creating={creating}
            error={error}
            success={success}
            contractAddress={contractAddress}
            explorerUrl={explorerUrl}
            creationFee={creationFee}
            tokenLogo={imagePreview}
            generatorTheme={generatorTheme}
            onGeneratorThemeChange={setGeneratorTheme}
            generatorKeywords={generatorKeywords}
            onGeneratorKeywordsChange={setGeneratorKeywords}
            showGenerator={showGenerator}
            onShowGeneratorChange={setShowGenerator}
            generatorLoading={generatorLoading}
            generatedSuggestions={generatedSuggestions}
            onGenerateNames={handleGenerateNames}
            onSelectSuggestion={handleSelectSuggestion}
            onSubmit={handleCreate}
          />
        </div>
      </div>
    </Guardian>
  );
}