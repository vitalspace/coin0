<script lang="ts">
  import { ZodError } from "zod";

  import { Toast } from "flowbite-svelte";
  import {
    ArrowLeft,
    Check,
    CircleAlert,
    CircleCheck,
    Copy,
    ExternalLink,
    Wallet
  } from "lucide-svelte";
  import { createCoin } from "../services/crateCoin.service";
  import web3App from "../web3/App";
  import { generateAILogo } from "./lib/generateAILogo";
  import { generateSuggestion } from "./lib/generateAISuggestion";
  import {
    logoSchema,
    nameSchema,
    networkSchema,
    symbolSupplySchema,
  } from "./schemas/schemas";
  import LogoStep from "./steps/LogoStep.svelte";
  import NameStep from "./steps/NameStep.svelte";
  import NetworkStep from "./steps/NetworkStep.svelte";
  import ReviewStep from "./steps/ReviewStep.svelte";
  import SymbolSupplyStep from "./steps/SymbolSupplyStep.svelte";
  import { type AISuggestions, type CoinResult } from "./types/types";

  const networks = [
    {
      id: 1313161674,
      name: "VitalSpace Mainnet / Aurora Virtual Chain",
      contractAddress: "0x15ff23Ab56f157bC9Dd460D6E6d686A0A0664E08",
    },
    // { id: 1313161554, name: "Aurora Mainnet", contractAddress: "" },
    // { id: 52014, name: "Electroneum Mainnet", contractAddress: "" },
    // { id: 1313161555, name: "Aurora Testnet", contractAddress: "" },
    {
      id: 5201420,
      name: "Electroneum Testnet",
      contractAddress: "0xA8317d7A1eD51c4C4e52bD0DF39ba0fD84BE1275",
    },
    // { id: 1337, name: "Ganache Testnet", contractAddress: "" },
  ];

  let step = $state(1);
  let isCopied = $state(false);
  let successMessage = $state("");
  let sucesssTransaction = $state(false);

  let coinResult: CoinResult | null = $state(null);

  let formData = $state({
    network: networks[0].id,
    name: "",
    symbol: "",
    supply: "",
  });

  let errors = $state({
    errorMessage: "",
    badNetwork: false,
    rejected: false,
    network: "",
    name: "",
    symbol: "",
    supply: "",
    logo: "",
  });

  let isGenerating = $state({
    name: false,
    symbol: false,
    supply: false,
  });

  let aiSuggestions = $state({
    name: "",
    symbol: "",
    supply: "",
  });

  let aiLogo = $state("");
  let isGeneratingLogo = $state(false);

  // Esta función se puede usar para validar antes de pasar al siguiente paso
  function nextStep() {
    errors = {
      errorMessage: "",
      badNetwork: false,
      rejected: false,
      network: "",
      name: "",
      symbol: "",
      supply: "",
      logo: "",
    };

    let isValid = true;

    try {
      if (step === 1) {
        networkSchema.parse({
          network: formData.network,
        });
      } else if (step === 2) {
        nameSchema.parse({
          name: formData.name,
        });
      } else if (step === 3) {
        symbolSupplySchema.parse({
          symbol: formData.symbol,
          supply: formData.supply,
        });
      } else if (step === 4) {
        logoSchema.parse({
          logo: aiLogo,
        });
      }
    } catch (error) {
      isValid = false;
      if (error instanceof ZodError) {
        //@ts-ignore
        errors = error.flatten().fieldErrors;
      } else if (error instanceof Error) {
        //@ts-ignore
        errors = [error.message];
      }
    }

    if (isValid) {
      step++;
    }
  }

  const handleGenerate = async (field: keyof AISuggestions) => {
    isGenerating[field] = true;
    aiSuggestions[field] = await generateSuggestion(field, formData);
    isGenerating[field] = false;
  };

  const handleApply = (field: keyof AISuggestions) => {
    formData[field] = aiSuggestions[field];
  };

  const handleLogoGenerate = async () => {
    isGeneratingLogo = true;
    aiLogo = await generateAILogo(formData.name);
    isGeneratingLogo = false;
  };

  const handleCreateCoin = async () => {
    const isConn = await web3App.isConnected();

    if (!isConn) {
      return;
    }

    const chainId = await web3App.getCurrentNetwork();

    if (chainId !== Number(formData.network)) {
      errors.badNetwork = true;
      errors.errorMessage = `
        Your are not connected to the selected network: ${
          networks.find((network) => network.id === formData.network)?.name
        } 
      `;
      return;
    }

    if (isConn && formData.name && formData.symbol && formData.supply) {
      try {
        const result = await web3App.createMemeCoin(
          formData.name,
          formData.symbol,
          formData.supply
        );

        if (result) {
          coinResult = {
            ...result,
            image: aiLogo,
            contractAddress: result.tokenAddress,
            chainId: Number(formData.network),
            chainName:
              networks.find((network) => network.id === formData.network)
                ?.name || "",
          };
        }

        if (!coinResult) {
          return;
        }

        console.log(coinResult);

        if (coinResult && aiLogo) {
          // @ts-ignore
          const chainName = networks.find(
            (network) => network.id === formData.network
          ).name;
          // @ts-ignore
          const chainId = networks.find(
            (network) => network.id === formData.network
          ).id;
          const response = await createCoin(
            coinResult.hash,
            coinResult.tokenName,
            coinResult.tokenSymbol,
            coinResult.initialAddress,
            coinResult.tokenSuply,
            coinResult.tokenAddress,
            chainId,
            chainName,
            aiLogo
          );

          coinResult.chainName = chainName;
          coinResult.chainId = chainId;

          if (response.data) {
            successMessage = "Memecoin created successfully";
            sucesssTransaction = true;
          }
        }
      } catch (err) {
        //@ts-ignore
        if (err.code === "ACTION_REJECTED" || err?.info?.error?.code === 4001) {
          errors.rejected = true;
          errors.errorMessage =
            "Transaction rejected! Please approve the transaction to create your coin";
        } else {
          errors.errorMessage =
            //@ts-ignore
            "Error creating coin: " + (err.message || "Unknown error");
        }
      }
    }
  };

  const handleCopy = (text: string) => {
    isCopied = true;
    navigator.clipboard.writeText(text);
  };

  const handleAddToken = async () => {
    if (!coinResult) return;

    await web3App.addTokenToMetaMask(
      coinResult.tokenAddress,
      coinResult.tokenSymbol,
      coinResult.tokenName,
      aiLogo
    );
  };
</script>

<div
  class="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.07),transparent)] flex items-center justify-center p-4"
>
  <div
    class="w-full max-w-md border border-neutral-800 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden"
  >
    {#if !sucesssTransaction}
      <div class="p-6">
        <h2 class="text-2xl font-bold text-white mb-2">Create Your Memecoin</h2>
        <p class="text-neutral-400 mb-6">
          Step {step} of 5: {step === 1
            ? "Select Network"
            : step === 2
              ? "Name"
              : step === 3
                ? "Symbol & Supply"
                : step === 4
                  ? "Logo"
                  : "Review"}
        </p>

        {#if step === 1}
          <NetworkStep
            {networks}
            bind:selectedNetwork={formData.network}
            errors={errors.network}
          />
        {:else if step === 2}
          <NameStep
            bind:name={formData.name}
            errors={errors.name}
            onGenerate={handleGenerate}
            aiSuggestion={aiSuggestions}
            onApply={handleApply}
          />
        {:else if step === 3}
          <SymbolSupplyStep
            bind:symbol={formData.symbol}
            bind:supply={formData.supply}
            {errors}
            onGenerate={handleGenerate}
            aiSuggestion={aiSuggestions}
            onApply={handleApply}
          />
        {:else if step === 4}
          <LogoStep
            onGenerate={handleLogoGenerate}
            {isGeneratingLogo}
            {aiLogo}
            errors={errors.logo}
          />
        {:else if step === 5}
          <ReviewStep {formData} {networks} {aiLogo} />
        {/if}

        <div class="flex justify-between mt-6">
          <button
            onclick={() => step--}
            disabled={step === 1}
            class="bg-transparent border flex place-items-center border-neutral-700 text-neutral-300 hover:bg-neutral-800 py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />

            Previous
          </button>
          <button
            onclick={step === 5 ? handleCreateCoin : nextStep}
            class="bg-[#00ffff] hover:bg-[#00ffff]/90 text-black font-medium py-2 px-4 rounded cursor-pointer transition-colors"
          >
            {step === 5 ? "Create Memecoin" : "Next"}
          </button>
        </div>
      </div>
    {:else}
      <div class="text-center pb-2 p-6">
        <div
          class="mx-auto bg-green-600 bg-opacity-20 w-12 h-12 rounded-full flex items-center justify-center mb-4"
        >
          <Check class="h-6 w-6 " />
        </div>
        <h2 class="text-2xl font-bold text-[#00FFFF]">Sucessful Transaction</h2>
        <p class="text-gray-400">Your Memecoin was created successfully</p>
      </div>
      <div class="space-y-4 px-6">
        <div
          class="bg-black bg-opacity-50 p-3 rounded-md text-xs flex items-center justify-between"
        >
          <span class="text-gray-400">ID Transaction:</span>
          <div class="flex items-center gap-2">
            {#if coinResult?.chainId === 1313161674}
              <span class="font-mono"
                >{coinResult.hash.substring(
                  0,
                  10
                )}...{coinResult.hash.substring(
                  coinResult.hash.length - 4
                )}</span
              >
              <a
                href="https://0x4e4541ca.explorer.aurora-cloud.dev/tx//{coinResult.hash}"
                target="_blank"
              >
                <ExternalLink class="h-3 w-3" />
              </a>
            {:else if coinResult?.chainId === 5201420}
              <span class="font-mono"
                >{coinResult.hash.substring(
                  0,
                  10
                )}...{coinResult.hash.substring(
                  coinResult.hash.length - 4
                )}</span
              >
              <a
                href="https://testnet-blockexplorer.electroneum.com/tx/{coinResult.hash}"
                target="_blank"
              >
                <ExternalLink class="h-3 w-3" />
              </a>
            {/if}
          </div>
        </div>

        <div class="space-y-3">
          <h3 class="text-lg font-medium text-white">Memecoin Details</h3>
          <hr class="border-[#111111]" />

          <div class="grid grid-cols-[120px_1fr] gap-2">
            <div class="text-sm text-gray-400">Network:</div>
            <div class="text-sm font-medium text-right text-white">
              {coinResult?.chainName}
            </div>

            <div class="text-sm text-gray-400">Name:</div>
            <div class="text-sm font-medium text-right text-white">
              {coinResult?.tokenName}
            </div>

            <div class="text-sm text-gray-400">Symbol:</div>
            <div class="text-sm font-medium text-right text-white">
              {coinResult?.tokenSymbol}
            </div>

            <div class="text-sm text-gray-400">Supply:</div>
            <div class="text-sm font-medium text-right text-white">
              {coinResult?.tokenSuply}
            </div>

            <div class="text-sm text-gray-400">Coin Address:</div>
            <div
              class="text-sm font-medium text-right flex items-center justify-end gap-1"
            >
              <span class="font-mono text-xs truncate max-w-[120px] text-white"
                >{coinResult?.tokenAddress}</span
              >

              <button
                class="text-gray-400 hover:text-[#00FFFF]"
                onclick={() => handleCopy(coinResult?.tokenAddress ?? "")}
              >
                {#if isCopied}
                  <Check class="h-3 w-3 text-[#00FFFF]" />
                {:else}
                  <Copy class="h-3 w-3" />
                {/if}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="flex gap-2 p-6">
        <button
          class="flex items-center w-full justify-center bg-[#00ffff] hover:bg-[#00ffff]/90 text-black font-medium py-2 px-4 rounded cursor-pointer transition-colors"
          onclick={handleAddToken}
        >
          <Wallet class="mr-2 h-4 w-4" />
          Add Token to Metamask
        </button>
      </div>
    {/if}
  </div>

  {#if errors.badNetwork}
    <div class="absolute bottom-4 right-4">
      <Toast
        class="bg-yellow-900"
        on:close={() => (errors.badNetwork = !errors.badNetwork)}
      >
        <div class="flex items-center gap-2 text-white">
          <CircleAlert class="w-5 h-5 " />
          <div>
            <p>{errors.errorMessage}</p>
            <!-- <p>
              Add this network to Metamask <a
                class="underline"
                href="/add-network">here</a
              >
            </p> -->
          </div>
        </div>
      </Toast>
    </div>
  {/if}

  {#if errors.rejected}
    <div class="absolute bottom-4 right-4">
      <Toast
        class="bg-yellow-900"
        on:close={() => (errors.rejected = !errors.rejected)}
      >
        <div class="flex items-center gap-2 text-white">
          <CircleAlert class="w-5 h-5 " />
          <div>
            <p>{errors.errorMessage}</p>
          </div>
        </div>
      </Toast>
    </div>
  {/if}

  {#if successMessage}
    <div class="absolute bottom-4 right-4">
      <Toast class="bg-green-600" on:close={() => (successMessage = "")}>
        <div class="flex items-center gap-2 text-white">
          <CircleCheck class="w-5 h-5" />
          <div>
            <p>{successMessage}</p>
          </div>
        </div>
      </Toast>
    </div>
  {/if}
</div>
