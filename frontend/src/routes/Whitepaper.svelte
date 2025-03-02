<script>
  let whitepaper = `
# **Coin0: AI-Powered Memecoin Creation**

## **About Coin0**

Coin0 is an innovative platform that enables users to create **memecoins effortlessly with the power of AI**. By simply connecting their **MetaMask wallet**, users can generate and deploy their own memecoin without requiring technical knowledge. Coin0 automates the entire process, making token creation accessible to everyone.

## **How It Works**

1. **Connect Wallet** – Users connect their **MetaMask** wallet to the platform.
2. **AI or Manual Token Creation** – Users can either manually input details or let AI generate them automatically.
   - **Blockchain Selection** – Choose the desired blockchain.
   - **Token Name & Symbol** – Define the identity of the memecoin.
   - **Total Supply** – Set the number of tokens to be created.
   - **AI-Generated Logo** – Coin0 uses **Cloudflare’s AI model (Flux-1-Schnell)** to create a unique token logo.
3. **Validation Process** – The system ensures all required parameters are set correctly.
4. **Deploy on Blockchain** – The user finalizes the creation process by paying the **gas fee**, and the token is deployed.

## **Smart Contract & Supported Chains**

Memecoins are deployed using the **MemecoinFactory contract** on the following networks:

- **VitalSpace Mainnet / Aurora Virtual Chain**: \`0x15ff23Ab56f157bC9Dd460D6E6d686A0A0664E08\`
- **Electroneum Testnet**: \`0xA8317d7A1eD51c4C4e52bD0DF39ba0fD84BE1275\`

## **Decentralization & Responsibility**

Coin0 **does not manage or control** the tokens created. The ownership and full responsibility of the memecoins **remain with the user**. Once deployed, the user must handle liquidity, marketing, and utility independently.

## **Future Plans**

- Integration of **additional AI agents** to enhance automation.
- Expansion to more **EVM-compatible chains**.
- Improved user experience with **advanced customization options**.
  `;
</script>

<div
  class="min-h-screen bg-black bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.07),transparent)] flex items-center justify-center pt-20"
>
  <div class="md:container md:mx-auto md:px-20 px-4 py-10 w-full">
    <main class="">
      <article class="grid gap-6">
        <h1 class="text-4xl font-bold mb-4">Coin0 Whitepaper</h1>
        <h2 class="font-semibold text-2xl">About Coin0</h2>
        <p>
          Coin0 is an innovative platform that enables users to create memecoins
          effortlessly with the power of AI. By simply connecting their MetaMask
          wallet, users can generate and deploy their own memecoin without
          requiring technical knowledge. Coin0 automates the entire process,
          making token creation accessible to everyone.
        </p>

        <h2 class="font-semibold text-2xl">How It Works</h2>
        <ul>
          <li>
            1. Connect Wallet: Users connect their MetaMask wallet to the
            platform.
          </li>
          <li>
            2. AI or Manual Token Creation: Users can either manually input
            details or let AI generate them automatically.
          </li>
          <li>3. Blockchain Selection: Choose the desired blockchain.</li>
          <li>4. Token Name & Symbol: Define the identity of the memecoin.</li>
          <li>5. Total Supply: Set the number of tokens to be created.</li>
          <li>
            6. AI-Generated Logo: Coin0 uses Cloudflare's AI model
            (Flux-1-Schnell) to create a unique token logo.
          </li>
          <li>
            7. Validation Process: The system ensures all required parameters
            are set correctly.
          </li>
          <li>
            8. Deploy on Blockchain: The user finalizes the creation process by
            paying the gas fee, and the token is deployed.
          </li>
        </ul>

        <h2 class="font-semibold text-2xl">
          Smart Contract & Supported Chains
        </h2>
        <p>
          Memecoins are deployed using the MemecoinFactory contract on the
          following networks:
        </p>
        <ul>
          <li>
            VitalSpace Mainnet / Aurora Virtual Chain:
            0x15ff23Ab56f157bC9Dd460D6E6d686A0A0664E08
          </li>
          <li>
            Electroneum Testnet: 0xA8317d7A1eD51c4C4e52bD0DF39ba0fD84BE1275
          </li>
        </ul>

        <h2 class="font-semibold text-2xl">
          Decentralization & Responsibility
        </h2>
        <p>
          Coin0 does not manage or control the tokens created. The ownership and
          full responsibility of the memecoins remain with the user. Once
          deployed, the user must handle liquidity, marketing, and utility
          independently.
        </p>

        <h2 class="font-semibold text-2xl">Future Plans</h2>
        <ul>
          <li>Integration of additional AI agents to enhance automation.</li>
          <li>Expansion to more EVM-compatible chains.</li>
          <li>Improved user experience with advanced customization options.</li>
        </ul>
      </article>

      <!-- {@html whitepaper.replace(/\n/g, "<br/>")} -->
    </main>
  </div>
</div>
