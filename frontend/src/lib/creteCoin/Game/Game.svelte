<script lang="ts">
  let gameStarted = $state(false);
  let userMove = $state("");
  let aiMove = $state("");
  let result = $state("");
  let loading = $state(false);
  import { isPlaying, isPlayerWin } from "../../stores/stores";

  let {
    name = $bindable(""),
    symbol = $bindable(""),
    supply = $bindable(""),
    logo = $bindable(""),
  }   = $props();

  const startGame = () => {
    gameStarted = true;
  };

  const playMove = async (move) => {
    userMove = move;
    loading = true;

    try {
      const response = await fetch(
        "http://localhost:3000/api/coin-agent/play",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMove: move }),
        }
      );

      const data = await response.json();
      aiMove = data.data.aiMove;
      result = data.data.result;
      isPlayerWin.set(data.data.isPlayerWin);

      if (data.data.isPlayerWin === false) {
        const response = await fetch(
          "http://localhost:3000/api/coin-agent/lose-coin",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userName: "loser" }),
          }
        );

        const data = await response.json();
        name = data.data.name;
        symbol = data.data.symbol;
        supply = Number(data.data.supply);
        logo = data.data.logo;
      }

      setTimeout(() => {
        isPlaying.set(false);
      }, 5000);

      //   isPlaying.set(false);

      //   gameStarted = false;
    } catch (error) {
      console.error(error);
      result = "¡Error! Intenta de nuevo.";
    }

    loading = false;
  };
</script>

{#if !gameStarted}
  <div
    class="w-full max-w-md overflow-hidden rounded-lg border border-neutral-800 bg-black/40 p-4 backdrop-blur-sm"
  >
    <h2 class="text-white text-xl font-bold mb-4">MemeCoin Agent</h2>
    <p class="text-white mb-6">
      Let's play a game of rock, paper, scissors. If you win, I will let you
      create your token totally free of charge.
    </p>
    <button
      onclick={startGame}
      class="w-full rounded-sm bg-[#00ffff] py-2 hover:bg-[#00ffff]/90 text-black font-medium transition-colors cursor-pointer"
    >
      Play
    </button>
  </div>
{:else}
  <div
    class="w-full max-w-md overflow-hidden rounded-lg border border-neutral-800 bg-black/40 p-4 backdrop-blur-sm"
  >
    <h2 class="text-white text-xl font-bold mb-4">Choise your move</h2>
    <div class="grid grid-cols-3 gap-4 mb-4">
      <button
        onclick={() => playMove("rock")}
        class="p-4 rounded-lg text-xl font-bold uppercase bg-[#00ffff]/80 hover:bg-[#00ffff]/70 text-white cursor-pointer transition-colors"
        disabled={loading}
      >
        🪨
      </button>
      <button
        onclick={() => playMove("paper")}
        class="p-4 rounded-lg text-xl font-bold uppercase bg-[#00ffff]/80 hover:bg-[#00ffff]/70 text-white cursor-pointer transition-colors"
        disabled={loading}
      >
        📄
      </button>
      <button
        onclick={() => playMove("scissors")}
        class="p-4 rounded-lg text-xl font-bold uppercase bg-[#00ffff]/80 hover:bg-[#00ffff]/70 text-white cursor-pointer transition-colors"
        disabled={loading}
      >
        ✂️
      </button>
    </div>

    {#if loading}
      <p class="text-white text-center">🤖 Ai thinking...</p>
    {:else if result}
      <div class="mt-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm">
        <p class="text-white text-center">{result}</p>
        <div class="flex justify-center gap-4 text-white mt-2">
          <span>You: {userMove.toLocaleUpperCase()}</span>
          <span>vs</span>
          <span>Ai: {aiMove.toLocaleUpperCase()}</span>
        </div>
        {#if result.includes("TX Hash")}
          <a
            href={`https://testnet.aurorascan.dev/tx/${result.split(" ").pop()}`}
            target="_blank"
            rel="noopener noreferrer"
            class="mt-4 block text-center bg-green-600 px-6 py-2 rounded-lg hover:bg-green-700 text-white"
          >
            🔍 Ver Transacción
          </a>
        {/if}
      </div>
    {/if}
  </div>
{/if}
