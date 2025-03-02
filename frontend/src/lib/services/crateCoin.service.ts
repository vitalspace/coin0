import axios from "./axios";

export const createCoin = async (
  hash: string,
  name: string,
  symbol: string,
  owner: string,
  supply: string,
  contractAddress: string,
  chainId: number,
  chainName: string,
  image: string
) =>
  axios.post("/create-coin", {
    hash,
    name,
    symbol,
    owner,
    supply,
    contractAddress,
    chainId,
    chainName,
    image,
  });
