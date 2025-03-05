<script lang="ts">
  let showAIAssistant = $state(false);
  import { Bot, Map, Zap, Lightbulb, Monitor, Image } from "lucide-svelte";
</script>

<!-- Floating AI Assistant Button -->
<button
  onclick={() => (showAIAssistant = !showAIAssistant)}
  class="fixed bottom-4 right-6 h-14 w-14 rounded-full bg-cyan-400 hover:bg-cyan-500 text-black shadow-lg shadow-cyan-400/20 flex items-center justify-center"
>
  <Bot class="w-6 h-6" />
</button>

<!-- AI Assistant Dialog -->
{#if showAIAssistant}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
    <div
      class="bg-black/95 border border-neutral-800 rounded-lg p-6 max-w-md w-full"
    >
      <h3 class="text-white text-xl font-bold mb-4">AI Assistant</h3>
      <p class="text-neutral-400 mb-4">
        Hello! I can help you create your memecoin. Here's what you can do:
      </p>
      <ul class="space-y-3 text-neutral-300">
        <li class="flex items-start gap-2">
          <Map class="h-5 w-5 text-cyan-400 mt-0.5" />
          <span>Start by selecting the blockchain network for your token</span>
        </li>
        <li class="flex items-start gap-2">
          <Zap class="h-5 w-5 text-cyan-400 mt-0.5" />
          <span
            >Click "AI Suggest" next to each field for creative suggestions</span
          >
        </li>
        <li class="flex items-start gap-2">
          <Lightbulb class="h-5 w-5 text-cyan-400 mt-0.5" />
          <span>Get help choosing a memorable token name and symbol</span>
        </li>
        <li class="flex items-start gap-2">
          <Monitor class="h-5 w-5 text-cyan-400 mt-0.5" />
          <span>Receive recommendations for optimal initial supply</span>
        </li>
        <li class="flex items-start gap-2">
          <Image class="h-5 w-5 text-cyan-400 mt-0.5" />
          <span>Generate an AI-powered logo for your memecoin</span>
        </li>
      </ul>
      <button
        onclick={() => (showAIAssistant = false)}
        class="mt-6 w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2 px-4 rounded"
      >
        Close
      </button>
    </div>
  </div>
{/if}
