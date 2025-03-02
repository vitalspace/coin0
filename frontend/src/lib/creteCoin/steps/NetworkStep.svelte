<script lang="ts">
  import { Globe } from "lucide-svelte";
  import web3App from "../../web3/App";

  let { networks = [], selectedNetwork = $bindable(0), errors = "" } = $props();

  async function handleSelect(id: number) {
    selectedNetwork = id;
    await web3App.switchNetwork(id);
  }
</script>

<div class="space-y-4">
  <label for="network" class="block text-white mb-2">Select Network</label>
  {#if errors}
    <div class="text-red-400 text-sm mt-1">{errors}</div>
  {/if}

  <div class="grid gap-3">
    {#each networks as network}
      <button
        class="flex items-center p-3 rounded border {selectedNetwork ===
        network.id
          ? 'border-cyan-400 bg-cyan-400/10'
          : 'border-neutral-800 bg-neutral-900'} cursor-pointer hover:border-neutral-600"
        onclick={() => handleSelect(network.id)}
      >
        <div class="flex-1">
          <div class="flex items-center">
            <Globe class="w-4 h-4 text-cyan-400 mr-2" />
            <span class="text-white">{network.name}</span>
          </div>
        </div>
        <div
          class="w-5 h-5 rounded-full border border-neutral-500 flex items-center justify-center"
        >
          {#if selectedNetwork === network.id}
            <div class="w-3 h-3 rounded-full bg-cyan-400"></div>
          {/if}
        </div>
      </button>
    {/each}
  </div>
</div>
