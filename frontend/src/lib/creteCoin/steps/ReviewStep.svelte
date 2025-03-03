<script lang="ts">
    import { ArrowLeft, Trophy, Hand, Scissors, FileText } from 'lucide-svelte';


  let {
    formData = $bindable({}),
    networks = $bindable([]),
    aiLogo = $bindable(""),
    whitepaperGenerated = $bindable(false),
    onGenerateWhitepaper = () => {},
    onCreate = () => Promise.resolve(),
  } = $props();

</script>

<div class="space-y-4">


  <h3 class="text-lg font-semibold text-white">Review Your Memecoin</h3>
  <div class="space-y-2 text-neutral-300">
    <p>
      <span class="font-semibold">Network:</span>
      {networks.find((n) => n.id === formData.network)?.name ||
        formData.network}
    </p>
    <p><span class="font-semibold">Name:</span> {formData.name}</p>
    <p><span class="font-semibold">Symbol:</span> {formData.symbol}</p>
    <p>
      <span class="font-semibold">Initial Supply:</span>
      {formData.supply}
    </p>
  </div>
  {#if aiLogo}
    <div class="flex flex-col items-center">
      <p class="text-neutral-300 mb-2">Logo:</p>
      <img
        src={aiLogo || "/placeholder.svg"}
        alt="Generated Logo"
        class="w-24 h-24 rounded-full"
      />
    </div>
  {/if}
  <!-- <button
    onclick={() => onGenerateWhitepaper()}
    class="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2 px-4 rounded"
  >
    Generate Whitepaper
  </button> -->
  {#if whitepaperGenerated}
    <div class="mt-4 p-4 bg-neutral-900 rounded-lg space-y-2">
      <h3 class="text-cyan-400 font-bold">1. Introduction</h3>
      <p class="text-neutral-300">
        {formData.name} is a revolutionary memecoin designed to bring humor and value
        to the cryptocurrency space on the {networks.find(
          (n) => n.id === formData.network
        )?.name} network.
      </p>
      <h3 class="text-cyan-400 font-bold">2. Tokenomics</h3>
      <p class="text-neutral-300">
        Initial supply: {formData.supply}
        {formData.symbol}
      </p>
      <h3 class="text-cyan-400 font-bold">3. Use Cases</h3>
      <p class="text-neutral-300">
        {formData.name} aims to facilitate fun and engaging transactions within meme
        communities.
      </p>
    </div>
  {/if}
</div>
