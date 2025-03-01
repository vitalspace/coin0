<script lang="ts">
  import { isConnected } from "../../stores/stores";
  import web3App from "../../web3/App";
  
  let isLoading = $state(true);

  // Verificar el estado de conexión inicial
  const checkInitialConnection = async () => {
    try {
      const isConn = await web3App.isConnected();
      isConnected.set(isConn);
      isLoading = false;
    } catch (error) {
      console.error("Error checking connection:", error);
      isLoading = false;
    }
  };
  
  const connectWallet = async () => {
    isLoading = true; // Mostrar carga mientras conecta
    try {
      await web3App.connectWallet();
      const isConn = await web3App.isConnected();
      isConnected.set(isConn);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      isLoading = false;
    }
  };
  
  // Ejecutar al cargar el componente
  $effect(() => {
    checkInitialConnection();
  });
</script>

<div
  class="fixed top-0 right-0 left-0 container mx-auto flex place-items-center justify-between px-20 py-10 z-20"
>
  <div>
    <a href="/">
      <h1 class="text-4xl font-mono text-cyan-500">Coin0</h1>
    </a>
  </div>
  
  <div class="space-x-2 text-white">
    <a href="/create-coin">Create Coin</a>
    <a href="/">About Us</a>
    
    {#if isLoading}
      <!-- <span>Loading...</span> -->
    {:else if $isConnected}
      <a class="text-white" href="/my-coins">My Coins</a>
    {:else}
      <button
        onclick={connectWallet}
        class="bg-cyan-400 hover:bg-cyan-500 text-black font-medium py-2 px-4 rounded cursor-pointer transition-colors"
      >
        Connect Wallet
      </button>
    {/if}
  </div>
</div>