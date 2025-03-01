import mongoose, { type Document } from "mongoose";

interface ICoin extends Document {
  name: string;
  symbol: string;
  owner: string;
  supply: string;
  contractAddress: string;
  chainId: string;
  chainName: string;
  decimals: string;
  image: string;
}

const coinSchema: mongoose.Schema<ICoin> = new mongoose.Schema<ICoin>(
  {
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    owner: { type: String, required: true },
    supply: { type: String, required: true },
    contractAddress: { type: String, required: true },
    chainId: { type: String, required: true },
    chainName: { type: String, required: true },
    decimals: { type: String, required: true, default: "18" },
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Coin = mongoose.model<ICoin>("Coin", coinSchema);

export default Coin;
