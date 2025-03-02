import mongoose, { type Document } from "mongoose";

interface ICoin extends Document {
  hash: string;
  name: string;
  symbol: string;
  owner: string;
  supply: string;
  contractAddress: string;
  chainId: number;
  chainName: string;
  decimals: string;
  image: string;
}

const coinSchema: mongoose.Schema<ICoin> = new mongoose.Schema<ICoin>(
  {
    hash: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    owner: { type: String, required: true },
    supply: { type: String, required: true },
    contractAddress: { type: String, required: true },
    chainId: { type: Number, required: true },
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
