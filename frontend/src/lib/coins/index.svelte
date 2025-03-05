<script lang="ts">
  import { onMount } from "svelte";
  import {
    ArrowLeft,
    ArrowRight,
    ExternalLink,
    Plus,
    CirclePlus,
  } from "lucide-svelte";
  import web3App from "../web3/App";

  interface Coin {
    _id: string;
    name: string;
    symbol: string;
    chainName: string;
    supply: number;
    chainId: number;
    hash: string;
    contractAddress: string;
    image: string;
    owner: string;
  }

  interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalCoins: number;
    limit: number;
  }

  interface ApiResponse {
    message: string;
    data: {
      coins: Coin[];
      pagination: PaginationData;
    };
  }

  let coins: Coin[] = [];
  let pagination: PaginationData = {
    currentPage: 1,
    totalPages: 1,
    totalCoins: 0,
    limit: 9,
  };

  let loading = true;
  let error: string | null = null;

  async function fetchCoins(page: number = 1, limit: number = 9) {
    loading = true;
    try {
      const response = await fetch(
        `http://localhost:3000/api/coin-agent/coins?page=${page}&limit=${limit}`
      );
      const data: ApiResponse = await response.json();

      if (data.message === "Success") {
        coins = data.data.coins;
        pagination = data.data.pagination;
      } else {
        error = "Too many requests";
      }
    } catch (err) {
      error = "Error connecting to server";
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function handlePageChange(newPage: number) {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      pagination = { ...pagination, currentPage: newPage };
      fetchCoins(newPage, pagination.limit);
    }
  }

  onMount(() => {
    fetchCoins(pagination.currentPage, pagination.limit);
  });

  const handleAddToken = async (coin: Coin) => {
    await web3App.addTokenToMetaMask(
      coin.contractAddress,
      coin.symbol,
      coin.name,
      coin.image
    );
  };
</script>

<div
  class="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.07),transparent)] justify-center pt-20"
>
  <main class="container mx-auto py-8 px-20">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold">Coins List</h2>
      <a
        href="/create-coin"
        class="flex items-center bg-[#00e5ff] hover:bg-[#00e5ff]/90 text-black font-medium py-2 px-4 rounded cursor-pointer transition-colors"
      >
        <CirclePlus class="mr-2 h-4 w-4" /> Create New Coin
      </a>
    </div>

    {#if loading}
      <div class="flex justify-center py-12">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00e5ff]"
        ></div>
      </div>
    {:else if error}
      <div class="rounded-lg border border-gray-800 bg-black p-6 shadow-sm">
        <p class="text-red-500">{error}</p>
      </div>
    {:else}
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each coins as coin (coin._id)}
          <div
            class="overflow-hidden border border-cyan-900/40 bg-black/60 rounded-lg transition-all duration-300 hover:border-cyan-500/70 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <div
              class="border-b border-cyan-900/40 bg-gradient-to-r from-cyan-950/40 to-transparent p-4"
            >
              <div class="flex items-center gap-3">
                <div
                  class="relative h-12 w-12 overflow-hidden rounded-full border border-cyan-800/50 bg-black p-1"
                >
                  <img
                    src={coin.image || "/placeholder.svg"}
                    alt={`${coin.name} logo`}
                    class="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
                <h3 class="text-xl font-bold text-cyan-400">{coin.name}</h3>
                <span
                  class="ml-auto inline-flex items-center rounded-full border border-cyan-700 px-2.5 py-0.5 text-xs font-semibold text-cyan-300"
                >
                  {coin.symbol}
                </span>
              </div>
            </div>

            <div class="p-6">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-400">Network:</span>
                  <span>{coin.chainName}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Symbol:</span>
                  <span>{coin.symbol}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-400">Total Supply:</span>
                  <span>{coin.supply}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-gray-400">Coin Address:</span>
                  {#if coin?.chainId === 1313161674}
                    <div class=" flex items-center gap-2">
                      <span class="font-mono"
                        >{coin.contractAddress.substring(
                          0,
                          10
                        )}...{coin.contractAddress.substring(
                          coin.contractAddress.length - 4
                        )}</span
                      >
                      <a
                        href="https://0x4e4541ca.explorer.aurora-cloud.dev/address/{coin.contractAddress}"
                        target="_blank"
                      >
                        <ExternalLink class="h-3 w-3" />
                      </a>
                    </div>
                  {:else if coin?.chainId === 52014}
                    <div class=" flex items-center gap-2">
                      <span class="font-mono"
                        >{coin.contractAddress.substring(
                          0,
                          10
                        )}...{coin.contractAddress.substring(
                          coin.contractAddress.length - 4
                        )}</span
                      >
                      <a
                        href="https://blockexplorer.electroneum.com/address/{coin.contractAddress}"
                        target="_blank"
                      >
                        <ExternalLink class="h-3 w-3" />
                      </a>
                    </div>
                  {:else if coin?.chainId === 5201420}
                    <div class=" flex items-center gap-2">
                      <span class="font-mono"
                        >{coin.contractAddress.substring(
                          0,
                          10
                        )}...{coin.contractAddress.substring(
                          coin.contractAddress.length - 4
                        )}</span
                      >
                      <a
                        href="https://testnet-blockexplorer.electroneum.com/address/{coin.contractAddress}"
                        target="_blank"
                      >
                        <ExternalLink class="h-3 w-3" />
                      </a>
                    </div>
                  {/if}
                </div>

                <div class="flex justify-between">
                  <span class="text-gray-400">Creator:</span>
                  {#if coin?.chainId === 1313161674}
                    <div class=" flex items-center gap-2">
                      <span class="font-mono"
                        >{coin.owner.substring(0, 10)}...{coin.owner.substring(
                          coin.owner.length - 4
                        )}</span
                      >
                      <a
                        href="https://0x4e4541ca.explorer.aurora-cloud.dev/address/{coin.owner}"
                        target="_blank"
                      >
                        <ExternalLink class="h-3 w-3" />
                      </a>
                    </div>
                  {:else if coin?.chainId === 52014}
                    <div class=" flex items-center gap-2">
                      <span class="font-mono"
                        >{coin.owner.substring(0, 10)}...{coin.owner.substring(
                          coin.owner.length - 4
                        )}</span
                      >
                      <a
                        href="https://blockexplorer.electroneum.com/address/{coin.owner}"
                        target="_blank"
                      >
                        <ExternalLink class="h-3 w-3" />
                      </a>
                    </div>
                  {:else if coin?.chainId === 5201420}
                    <div class=" flex items-center gap-2">
                      <span class="font-mono"
                        >{coin.owner.substring(0, 10)}...{coin.owner.substring(
                          coin.owner.length - 4
                        )}</span
                      >
                      <a
                        href="https://testnet-blockexplorer.electroneum.com/address/{coin.owner}"
                        target="_blank"
                      >
                        <ExternalLink class="h-3 w-3" />
                      </a>
                    </div>
                  {/if}
                </div>
              </div>

              <div class="border-t border-cyan-900/40 pt-4 mt-2">
                <button
                  on:click={() => handleAddToken(coin)}
                  class="flex items-center w-full justify-center bg-[#00ffff] hover:bg-[#00ffff]/90 text-black font-medium py-2 px-4 rounded cursor-pointer transition-colors"
                >
                  Add Token to Metamask
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <!-- Paginación -->
      <div class="flex justify-between items-center mt-8">
        <div class="text-sm text-gray-400">
          Showing {coins.length} of {pagination.totalCoins} coins
        </div>
        <div class="flex items-center gap-2">
          <button
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-800 hover:bg-gray-800 hover:text-[#00e5ff] disabled:opacity-50 cursor-pointer transition-colors"
            on:click={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            <ArrowLeft class="h-4 w-4" />
          </button>
          <div class="flex items-center gap-1">
            {#each Array.from({ length: pagination.totalPages }, (_, i) => i + 1) as page}
              <button
                class={page === pagination.currentPage
                  ? "inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[#00e5ff] text-black hover:bg-[#00b8cc] px-3 py-1 cursor-pointer"
                  : "inline-flex h-8 min-w-8 items-center justify-center rounded-md border border-gray-800 hover:bg-gray-800 hover:text-[#00e5ff] px-3 py-1 cursor-pointer"}
                on:click={() => handlePageChange(page)}
              >
                {page}
              </button>
            {/each}
          </div>
          <button
            class="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-gray-800 hover:bg-gray-800 hover:text-[#00e5ff] disabled:opacity-50"
            on:click={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            <ArrowRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    {/if}
  </main>
</div>

<style>
  /* Estilos adicionales si son necesarios */
</style>
