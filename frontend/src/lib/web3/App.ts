import { ethers, N } from "ethers";
import MemeCoinFactoryAbi from "../contracts/MemeCoinFactoryAbi.json";
import { CONTRACT_ADDRESS } from "../constants/constants";

class App {
  address: string = "";
  existsWeb3: boolean = false;
  contractAddress: string = "";
  contractAbi: any;
  provider!: ethers.BrowserProvider;
  currentChainId: number = 0;

  private contractConfig!: { [chainId: number]: string };

  constructor(contractConfig: { [chainId: number]: string }, abi?: any) {
    //@ts-ignore
    if (typeof window.ethereum !== "undefined") {
      this.existsWeb3 = true;
      //@ts-ignore
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.contractConfig = contractConfig;
      this.contractAddress = this.contractConfig[1313161674];

      console.log("Contract", this.contractAddress);

      //@ts-ignore
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        this.address = accounts[0];
      });

      //@ts-ignore
      window.ethereum.on("chainChanged", (chainId: number) => {
        const numericChainId = Number(chainId);
        this.currentChainId = numericChainId;
        console.log("Contract", this.contractConfig[numericChainId]);
        this.contractAddress = this.contractConfig[numericChainId];
      });

      this.contractAddress = this.contractConfig[1313161674];
      this.contractAbi = abi;
    }
  }

  async init() {}

  async isConnected(): Promise<boolean> {
    if (!this.existsWeb3) return false;
    try {
      const account = await this.provider.listAccounts();
      return account.length > 0;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async existConnection() {
    if (!this.existsWeb3) return;
    try {
      const accounts = await this.provider.send("eth_accounts", []);
      if (accounts.length > 0) {
        this.address = accounts[0];
      }
    } catch (err) {
      console.error("Error checking connection: ", err);
      return;
    }
  }

  async connectWallet() {
    if (!this.existsWeb3) return null;
    try {
      const accounts = await this.provider.send("eth_requestAccounts", []);
      this.address = accounts[0];
      return this.address;
    } catch (err) {
      console.error("Error connecting to wallet: ", err);
      return null;
    }
  }

  async getAddresses() {
    if (!this.existsWeb3) return null;

    try {
      const signer = await this.provider.getSigner();
      return await signer.getAddress();
    } catch (err) {
      console.error("Error getting address: ", err);
    }
  }

  async getCurrentNetwork() {
    if (!this.existsWeb3) return null;
    try {
      const network = await this.provider.send("eth_chainId", []);
      this.currentChainId = Number(network);
      return this.currentChainId;
    } catch (err) {
      console.error("Error getting current network: ", err);
    }
  }

  private checkNetworkSupport() {
    if (!this.existsWeb3) return false;
    if (!this.contractConfig[this.currentChainId]) {
      throw new Error("Network not supported: ${this.currentChainId}");
    }
  }

  async switchNetwork(chainId: number) {
    try {
      console.log("chainId", chainId);
      this.contractAddress = this.contractConfig[chainId];
      //@ts-ignore
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error("Error cambiando red:", error);
    }
  }

  async connectContract(address: string, abi: any) {
    if (!this.existsWeb3) return null;
    try {
      const signer = await this.provider.getSigner();
      return new ethers.Contract(address, abi, signer);
    } catch (err) {
      console.error("Error connecting to contract: ", err);
      return null;
    }
  }

  async contract() {
    // this.checkNetworkSupport();

    if (!this.existsWeb3 || !this.contractAddress || !this.contractAbi)
      return null;

    try {
      const contract = await this.connectContract(
        this.contractAddress,
        this.contractAbi
      );
      return contract;
    } catch (err) {
      console.error("Error connecting to contract: ", err);
      return null;
    }
  }

  async createMemeCoin(name: string, symbol: string, supply: string) {
    // this.checkNetworkSupport();

    if (!this.existsWeb3) return null;
    try {
      const address = await this.getAddresses();
      if (!address) throw new Error("Conecta tu wallet primero");

      const formattedSupply = ethers.parseUnits(supply.toString(), 0);
      const contract = await this.contract();
      console.log(
        "createMemeCoin",
        name,
        symbol,
        supply,
        address,
        contract,
        this.contractAddress
      );

      const tx = await contract?.createMemecoin(
        name,
        symbol,
        address,
        formattedSupply
      );

      const hash = tx.hash;
      const receipt = await tx.wait();

      const [tokenAddress, tokenName, tokenSymbol, initialAddress, tokenSuply] =
        receipt.logs[1].args;

      return {
        hash,
        tokenAddress,
        tokenName,
        tokenSymbol,
        initialAddress,
        tokenSuply: tokenSuply.toString(),
      };
    } catch (err) {
      throw err;
    }
  }

  async addTokenToMetaMask(
    tokenAddress: string,
    tokenSymbol: string,
    tokenName: string,
    image: string
  ) {
    if (!this.existsWeb3) return null;

    try {
      this.provider.send("wallet_watchAsset", {
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: 18,
          image: image,
          name: tokenName,
        },
      });
    } catch (err) {
      console.error("Error adding token to MetaMask: ", err);
    }
  }
}

const web3App = new App(CONTRACT_ADDRESS, MemeCoinFactoryAbi);
export default web3App;
