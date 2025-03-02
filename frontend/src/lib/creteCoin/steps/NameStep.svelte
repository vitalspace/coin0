<script lang="ts">
  import { Sparkles } from "lucide-svelte";
  import type { FormData, AISuggestions } from "../types/types";

  let {
    name = $bindable(""),
    errors = "",
    aiSuggestion,
    onGenerate = () => Promise.resolve(),
    onApply = () => {},
  } = $props();
</script>

<div class="space-y-4">
  {#if errors}
    <div class="text-red-400 text-sm mt-1">{errors}</div>
  {/if}

  <div class="flex justify-between place-items-center">
    <label for="name" class="block text-white mb-2">Token Name</label>
    <button
      onclick={() => onGenerate("name")}
      class="bg-transparent text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded flex place-items-center space-x-2 cursor-pointer transition-colors"
    >
      <Sparkles class="w-4 h-4" />
      <span class="text-sm"> AI Suggest</span>
    </button>
  </div>

  <div class="flex items-center space-x-2">
    <input
      type="text"
      name=""
      id="name"
      bind:value={name}
      placeholder="e.g. Awesome Coin"
      class="w-full bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded p-2"
    />
  </div>

  {#if aiSuggestion.name}
    <div class="mt-2 p-2 bg-neutral-900 rounded">
      <p class="text-cyan-400">Suggestion: {aiSuggestion.name}</p>
      <button
        onclick={() => onApply("name")}
        class="mt-1 text-sm text-cyan-500 hover:text-cyan-400 cursor-pointer transition-colors"
      >
        Use this
      </button>
    </div>
  {/if}
</div>
