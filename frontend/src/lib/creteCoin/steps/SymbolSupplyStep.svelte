<script lang="ts">
  import { Coins, Lightbulb } from "lucide-svelte";

  let {
    symbol = $bindable(""),
    supply = $bindable(""),
    errors = { symbol: "", supply: "" },
    aiSuggestion,
    onGenerate = (field: "symbol" | "supply") => Promise.resolve(),
    onApply = (field: "symbol" | "supply") => {},
  } = $props();
</script>

<div class="space-y-4">
  {#if errors.symbol}
    <div class="text-red-400 text-sm mt-1">
      {errors.symbol}
    </div>
  {/if}

  <div class="flex justify-between place-items-center">
    <label for="symbol" class="block text-white mb-2">Token Symbol</label>

    <button
      onclick={() => onGenerate("symbol")}
      class="bg-transparent text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded flex place-items-center space-x-2 cursor-pointer transition-colors"
    >
      <Lightbulb class="w-4 h-4 mr-1" />
      <span class="text-sm">AI Suggest</span>
    </button>
  </div>

  <div class="flex items-center space-x-2">
    <input
      id="symbol"
      type="text"
      bind:value={symbol}
      placeholder="e.g. AWC"
      class="w-full bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded p-2"
    />
  </div>
  {#if aiSuggestion.symbol}
    <div class="mt-2 p-2 bg-neutral-900 rounded">
      <p class="text-cyan-400">Suggestion: {aiSuggestion.symbol}</p>
      <button
        onclick={() => onApply("symbol")}
        class="mt-1 text-sm text-cyan-500 hover:text-cyan-400 cursor-pointer transition-colors"
      >
        Use this
      </button>
    </div>
  {/if}

  {#if errors.supply}
    <div class="text-red-400 text-sm mt-1">
      {errors.supply}
    </div>
  {/if}
  <div class="flex justify-between place-items-center">
    <label for="supply" class="block text-white mb-2">Initial Supply</label>

    <button
      onclick={() => onGenerate("supply")}
      class="bg-transparent text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded flex place-items-center space-x-2 cursor-pointer transition-colors"
    >
      <Coins class="w-4 h-4 mr-1" />
      <span class="text-sm">AI Suggest</span>
    </button>
  </div>
  <div class="flex items-center space-x-2">
    <input
      id="supply"
      type="number"
      bind:value={supply}
      placeholder="e.g. 1000000"
      class="w-full bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded p-2"
    />
  </div>
  {#if aiSuggestion.supply}
    <div class="mt-2 p-2 bg-neutral-900 rounded">
      <p class="text-cyan-400">Suggestion: {aiSuggestion.supply}</p>
      <button
        onclick={() => onApply("supply")}
        class="mt-1 text-sm text-cyan-500 hover:text-cyan-400 cursor-pointer transition-colors"
      >
        Use this
      </button>
    </div>
  {/if}
</div>
