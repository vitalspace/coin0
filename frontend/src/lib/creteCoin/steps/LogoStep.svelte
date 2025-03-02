<script lang="ts">
  import { Image } from "lucide-svelte";

  let {
    errors = "",
    aiLogo = $bindable(""),
    isGeneratingLogo = $bindable(false),
    onGenerate = () => Promise.resolve(),
  } = $props();

  // export let aiLogo: string | null;
  // export let isGeneratingLogo: boolean;
  // export let onGenerate: () => Promise<void>;
</script>

<div class="space-y-4">
  {#if errors}
    <div class="text-red-400 text-sm mt-1">{errors}</div>
  {/if}

  <label for="icon" class="block text-white mb-2">Token Logo</label>
  <div class="flex flex-col items-center space-y-4">
    {#if aiLogo}
      <img
        src={aiLogo || "/placeholder.svg"}
        alt="AI Generated Logo"
        class="w-32 h-32 rounded-full"
      />
    {:else}
      <div
        class="w-32 h-32 bg-neutral-800 rounded-lg flex items-center justify-center"
      >
        <Image class="w-20 h-20 text-gray-500 " />
      </div>
    {/if}
    <button
      onclick={() => onGenerate()}
      class="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2 px-4 rounded cursor-pointer transition-colors"
      disabled={isGeneratingLogo}
    >
      {#if isGeneratingLogo}
        Generating Logo...
      {:else}
        {aiLogo ? "Regenerate AI Logo" : "Generate AI Logo"}
      {/if}
    </button>
  </div>
</div>
