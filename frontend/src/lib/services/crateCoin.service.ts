import axios from "./axios";

export const createCoin = async (
  name: string,
  symbol: string,
  owner: string,
  supply: string,
  contractAddress: string,
  chainId: string,
  chainName: string,
  image: string
) =>
  axios.post("/create-coin", {
    name,
    symbol,
    owner,
    supply,
    contractAddress,
    chainId,
    chainName,
    image,
  });
