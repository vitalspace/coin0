<script lang="ts">
  import {
    ArrowLeft,
    Coins,
    Globe,
    Image,
    Lightbulb,
    Sparkles,
  } from "lucide-svelte";
  import { z, ZodError } from "zod";
  import { generateLogo } from "../../services/logo.service";
  import { createCoin } from "../../services/crateCoin.service";
  import AiAssistantDIalog from "./dialogs/AiAssistantDIalog.svelte";

  import web3App from "../../web3/App";

  // Modificado: Aumentado a 5 pasos y comenzamos en el paso de selección de red
  let step = 1;
  let formData = {
    network: "", // Nuevo campo para la red
    name: "",
    symbol: "",
    supply: "",
  };
  let aiLogo: string | null = null;
  let isGeneratingLogo = false;
  let whitepaperGenerated = false;
  let aiSuggestion = {
    name: "",
    symbol: "",
    supply: "",
  };

  // Lista de redes disponibles
  const networks = [
    { id: "electrum-mainnet", name: "Electrum Mainnet" },
    { id: "aurora-mainnet", name: "Aurora Mainnet" },
    { id: "electrum-testnet", name: "Electrum Testnet" },
    { id: "aurora-testnet", name: "Aurora Testnet" },
    { id: "vitalspace-mainnet", name: "VitalSpace Mainnet" },
  ];

  // Nuevo esquema para validar la selección de red
  const networkSchema = z.object({
    network: z.string().min(1, { message: "Please select a network" }),
  });

  const nameShema = z.object({
    name: z
      .string()
      .min(3, { message: "Name must be at least 3 characters" })
      .max(50)
      .trim(),
  });

  const symbolSchema = z.object({
    symbol: z
      .string()
      .min(3, { message: "Symbol must be at least 3 characters" })
      .max(5, { message: "Symbol must be at most 5 characters" })
      .regex(/^[A-Z]+$/, { message: "Symbol must be uppercase letters" })
      .trim(),
    supply: z.coerce
      .number()
      .int({ message: "Supply must be an integer" })
      .positive({ message: "Supply must be a positive number" }),
  });

  let errors = {
    network: "", // Nuevo campo para errores
    name: "",
    symbol: "",
    supply: "",
  };

  let isGenerating = {
    name: false,
    symbol: false,
    supply: false,
  };

  let generationError: string | null = null;

  async function generateAISuggestion(field: "name" | "symbol" | "supply") {
    try {
      generationError = null;
      isGenerating = { ...isGenerating, [field]: true };

      const dynamicPrompts = {
        name: () => {
          const themes = [
            "animales mitológicos",
            "fenómenos astronómicos",
            "jerga de internet",
            "comida absurda",
            "objetos cotidianos exagerados",
          ];

          const randomTheme = themes[Math.floor(Math.random() * themes.length)];

          return `Genera 3 nombres creativos para un memecoin. Reglas:
                1. Basados en ${randomTheme}
                2. Máximo 3 palabras
                3. Combinación inusual de términos
                4. Evitar usar "Doge", "Shiba" o "Elon"
                5. Formato: Nombre1|Nombre2|Nombre3
                
                Ejemplos válidos:
                QuantumCroissant|Memeosaurus|TofuTornado`;
        },

        symbol: `Crea 3 símbolos únicos (3-5 letras mayúsculas) para un memecoin llamado "${formData.name}". 
          Reglas:
          1. Los símbolos deben derivarse del nombre de la moneda, pero con creatividad.
          2. Pueden usar iniciales, fragmentos fonéticos o combinaciones ingeniosas.
          3. Evita repeticiones exactas del nombre.
          4. Formato: SÍMBOLO1|SÍMBOLO2|SÍMBOLO3
          
          Ejemplo:
          Para "QuantumCroissant": QTC|QCRS|QTCR
          Para "Memeosaurus": MEO|MSRS|MEOSR`,

        supply: `Sugiere 3 cantidades de supply inicial para un memecoin. Reglas:
                1. Entre 1 millón y 10 billones
                2. Números redondos con formato interesante
                3. Usar notación: 1M=1,000,000 1B=1,000,000,000
                4. Formato: NUM1|NUM2|NUM3
                
                Ejemplo: 500M|2.5B|10B`,
      };

      const prompt =
        typeof dynamicPrompts[field] === "function"
          ? dynamicPrompts[field]()
          : dynamicPrompts[field];

      const result = await fetch(
        "http://localhost:3000/api/coin-agent/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt }),
        }
      );

      const { data } = await result.json();
      // Procesar múltiples opciones
      const suggestions = data
        .split("|")
        .map((s: string) => s.trim())
        .filter(Boolean);
      const randomSelection =
        suggestions[Math.floor(Math.random() * suggestions.length)];

      aiSuggestion[field] = formatSuggestion(field, randomSelection);
    } catch (err) {
      generationError = "Error generating suggestion. Please try again.";
      console.error("Gemini API error:", err);
    } finally {
      isGenerating = { ...isGenerating, [field]: false };
    }
  }

  function formatSuggestion(field: string, text: string): string {
    switch (field) {
      case "symbol":
        return text.replace(/[^A-Z]/g, "").slice(0, 5);
      case "supply":
        return text.replace(/\D/g, "").slice(0, 12);
      default:
        return text.replace(/["']/g, ""); // Limpiar comillas
    }
  }

  const applySuggestion = (field: "name" | "symbol" | "supply") =>
    (formData[field] = aiSuggestion[field]);

  async function generateAILogo() {
    isGeneratingLogo = true;
    try {
      const response = await generateLogo(formData.name);
      aiLogo = await response.data.image;
      isGeneratingLogo = false;
    } catch (error) {
      isGeneratingLogo = false;
      console.error("Error generating logo", error);
    }
  }

  const generateWhitepaper = () => (whitepaperGenerated = true);

  const nextStep = () => {
    errors = { network: "", name: "", symbol: "", supply: "" };

    let isValid = true;

    try {
      if (step === 1) {
        // Validar la selección de red
        networkSchema.parse({
          network: formData.network,
        });
      } else if (step === 2) {
        nameShema.parse({
          name: formData.name,
        });
      } else if (step === 3) {
        symbolSchema.parse({
          symbol: formData.symbol,
          supply: formData.supply,
        });
      }
    } catch (err) {
      isValid = false;
      if (err instanceof ZodError) {
        //@ts-ignore
        errors = err.flatten().fieldErrors;
      } else if (err instanceof Error) {
        //@ts-ignore
        errors = [err.message];
      }
    }

    if (isValid && step < 5) step++;
  };

  const prevStep = () => {
    if (step > 1) step--;
  };

  const createMemecoin = async () => {
    // console.log("Create Memecoin", formData);
    const isConn = await web3App.isConnected();

    if (isConn && formData.name && formData.symbol && formData.supply) {
      const coinResult = await web3App.createMemeCoin(
        formData.name,
        formData.symbol,
        formData.supply
      );

      if (!coinResult) {
        return;
      }

      if (coinResult && aiLogo) {
        const response = await createCoin(
          coinResult.tokenName,
          coinResult.tokenSymbol,
          coinResult.initialAddress,
          coinResult.tokenSuply,
          coinResult.tokenAddress,
          "1",
          formData.network,
          aiLogo
        );

        const { data } = response;

        console.log("Response:", data);

        // await web3App.addTokenToMetaMask(
        //   coinResult.tokenAddress,
        //   coinResult.tokenSymbol,
        //   coinResult.tokenName,
        //   aiLogo
        // );
      }
    }
  };
</script>

<div
  class="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.07),transparent)] flex items-center justify-center p-4"
>
  <div
    class="w-full max-w-md border border-neutral-800 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden"
  >
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
        <div class="space-y-4">
          <div>
            <label for="network" class="block text-white mb-2"
              >Select Network</label
            >
            {#if errors.network}
              <div class="text-red-400 text-sm mt-1">
                {errors.network[0]}
              </div>
            {/if}
            <div class="grid gap-3">
              {#each networks as network}
                <button
                  class="flex items-center p-3 rounded border {formData.network ===
                  network.id
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-neutral-800 bg-neutral-900'} cursor-pointer hover:border-neutral-600"
                  on:click={() => (formData.network = network.id)}
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
                    {#if formData.network === network.id}
                      <div class="w-3 h-3 rounded-full bg-cyan-400"></div>
                    {/if}
                  </div>
                </button>
              {/each}
            </div>
          </div>
        </div>
      {:else if step === 2}
        <div class="space-y-4">
          <div>
            {#if errors.name}
              <div class="text-red-400 text-sm mt-1">
                {errors.name[0]}
              </div>
            {/if}
            <div class="flex justify-between place-items-center">
              <label for="name" class="block text-white mb-2">Token Name</label>
              <button
                on:click={() => generateAISuggestion("name")}
                class="bg-transparent text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded space-x-2 flex place-items-center"
              >
                <Sparkles class="w-4 h-4" />
                <span class="text-sm"> AI Suggest</span>
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <input
                id="name"
                type="text"
                bind:value={formData.name}
                placeholder="e.g. Awesome Coin"
                class="w-full bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded p-2"
              />
            </div>
            {#if aiSuggestion.name}
              <div class="mt-2 p-2 bg-neutral-900 rounded">
                <p class="text-cyan-400">Suggestion: {aiSuggestion.name}</p>
                <button
                  on:click={() => applySuggestion("name")}
                  class="mt-1 text-sm text-cyan-500 hover:text-cyan-400"
                >
                  Use this
                </button>
              </div>
            {/if}
          </div>
        </div>
      {:else if step === 3}
        <div class="space-y-4">
          <div>
            {#if errors.symbol}
              <div class="text-red-400 text-sm mt-1">
                {errors.symbol[0]}
              </div>
            {/if}

            <div class="flex justify-between place-items-center">
              <label for="symbol" class="block text-white mb-2"
                >Token Symbol</label
              >

              <button
                on:click={() => generateAISuggestion("symbol")}
                class="bg-transparent text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded flex place-items-center space-x-2"
              >
                <Lightbulb class="w-4 h-4 mr-1" />
                <span class="text-sm">AI Suggest</span>
              </button>
            </div>

            <div class="flex items-center space-x-2">
              <input
                id="symbol"
                type="text"
                bind:value={formData.symbol}
                placeholder="e.g. AWC"
                class="w-full bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded p-2"
              />
            </div>
            {#if aiSuggestion.symbol}
              <div class="mt-2 p-2 bg-neutral-900 rounded">
                <p class="text-cyan-400">Suggestion: {aiSuggestion.symbol}</p>
                <button
                  on:click={() => applySuggestion("symbol")}
                  class="mt-1 text-sm text-cyan-500 hover:text-cyan-400"
                >
                  Use this
                </button>
              </div>
            {/if}
          </div>
          <div>
            {#if errors.supply}
              <div class="text-red-400 text-sm mt-1">
                {errors.supply[0]}
              </div>
            {/if}
            <div class="flex justify-between place-items-center">
              <label for="supply" class="block text-white mb-2"
                >Initial Supply</label
              >

              <button
                on:click={() => generateAISuggestion("supply")}
                class="bg-transparent text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded flex place-items-center space-x-2"
              >
                <Coins class="w-4 h-4 mr-1" />
                <span class="text-sm">AI Suggest</span>
              </button>
            </div>
            <div class="flex items-center space-x-2">
              <input
                id="supply"
                type="number"
                bind:value={formData.supply}
                placeholder="e.g. 1000000"
                class="w-full bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded p-2"
              />
            </div>
            {#if aiSuggestion.supply}
              <div class="mt-2 p-2 bg-neutral-900 rounded">
                <p class="text-cyan-400">Suggestion: {aiSuggestion.supply}</p>
                <button
                  on:click={() => applySuggestion("supply")}
                  class="mt-1 text-sm text-cyan-500 hover:text-cyan-400"
                >
                  Use this
                </button>
              </div>
            {/if}
          </div>
        </div>
      {:else if step === 4}
        <div class="space-y-4">
          <label for="icon" class="block text-white mb-2">Token Logo</label>
          <div class="flex flex-col items-center space-y-4">
            {#if aiLogo}
              <img
                src={aiLogo || "/placeholder.svg"}
                alt="AI Generated Logo"
                class="w-32 h-32"
              />
            {:else}
              <div
                class="w-32 h-32 bg-neutral-800 rounded-lg flex items-center justify-center"
              >
                <Image class="w-20 h-20 text-gray-500 " />
              </div>
            {/if}
            <button
              on:click={generateAILogo}
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
      {:else if step === 5}
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
                class="w-24 h-24"
              />
            </div>
          {/if}
          <button
            on:click={generateWhitepaper}
            class="w-full bg-cyan-700 hover:bg-cyan-600 text-white py-2 px-4 rounded"
          >
            Generate Whitepaper
          </button>
          {#if whitepaperGenerated}
            <div class="mt-4 p-4 bg-neutral-900 rounded-lg space-y-2">
              <h3 class="text-cyan-400 font-bold">1. Introduction</h3>
              <p class="text-neutral-300">
                {formData.name} is a revolutionary memecoin designed to bring humor
                and value to the cryptocurrency space on the {networks.find(
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
                {formData.name} aims to facilitate fun and engaging transactions
                within meme communities.
              </p>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="px-6 py-4 bg-black/60 flex justify-between">
      <button
        on:click={prevStep}
        disabled={step === 1}
        class="bg-transparent border flex place-items-center border-neutral-700 text-neutral-300 hover:bg-neutral-800 py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft class="w-4 h-4 mr-2" />

        Previous
      </button>
      <button
        on:click={step === 5 ? createMemecoin : nextStep}
        class="bg-[#00ffff] hover:bg-[#00ffff]/90 text-black font-medium py-2 px-4 rounded cursor-pointer transition-colors"
      >
        {step === 5 ? "Create Memecoin" : "Next"}
      </button>
    </div>
  </div>

  <AiAssistantDIalog />
</div>
