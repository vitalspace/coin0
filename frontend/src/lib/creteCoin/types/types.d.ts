export interface Network {
  id: number;
  name: string;
  cotractAddress: string;
}

export interface FormData {
  network: number;
  name: string;
  symbol: string;
  supply: string;
}

export interface AISuggestions {
  name: string;
  symbol: string;
  supply: string;
}

export interface CoinResult {
  hash: string;
  tokenName: string;
  tokenSymbol: string;
  initialAddress: string;
  tokenSuply: string;
  tokenAddress: string;
  image: string;
  contractAddress: string;
  chainId: number;
  chainName: string;
}

export type StepErrors = Record<keyof FormData, string>;
