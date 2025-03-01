import { ethers } from "ethers";
import MemeCoinFactoryAbi from "../contracts/MemeCoinFactoryAbi.json";
import { CONTRACT_ADDRESS } from "../constants/constants";

class App {
  address: string = "";
  existsWeb3: boolean = false;
  contractAddress: string = "";
  contractAbi: any;
  provider!: ethers.BrowserProvider;
  constructor(contactAddress: string, abi?: any) {
    //@ts-ignore
    if (typeof window.ethereum !== "undefined") {
      this.existsWeb3 = true;
      //@ts-ignore
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.contractAddress = contactAddress;
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
    if (!this.existsWeb3) return null;
    try {
      const address = await this.getAddresses();
      if (!address) throw new Error("Conecta tu wallet primero");

      const formattedSupply = ethers.parseUnits(supply.toString(), 0);
      const contract = await this.contract();

      const tx = await contract?.createMemecoin(
        name,
        symbol,
        address,
        formattedSupply
      );

      const receipt = await tx.wait();

      const [tokenAddress, tokenName, tokenSymbol, initialAddress, tokenSuply] =
        receipt.logs[1].args;
      return {
        tokenAddress,
        tokenName,
        tokenSymbol,
        initialAddress,
        tokenSuply: tokenSuply.toString(),
      };
    } catch (err) {
      console.error("Error creating meme coin: ", err);
      return null;
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
