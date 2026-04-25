import mongoose, { type Document } from "mongoose";

export interface IToken extends Document {
  txHash: string;
  name: string;
  symbol: string;
  owner: string;
  supply: string;
  contractAddress: string;
  chainName: string;
  decimals: string;
  logo: string;
}

const tokenSchema: mongoose.Schema<IToken> = new mongoose.Schema<IToken>({
  txHash: { type: String, required: true },
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  owner: { type: String, required: true },
  supply: { type: String, required: true },
  contractAddress: { type: String, required: false },
  chainName: { type: String, required: false },
  decimals: { type: String, required: false, default: "6" },
  logo: { type: String, required: false },
}, {
  timestamps: true
});

tokenSchema.index({ contractAddress: 1 });

const Token = mongoose.model<IToken>("Token", tokenSchema);

export default Token;
