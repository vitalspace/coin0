import mongoose, { type Document } from "mongoose";

export interface IAirdrop extends Document {
  txSignature: string;
  poolAddress: string;
  mintAddress: string;
  creatorAddress: string;
  tokenName: string;
  tokenSymbol: string;
  totalAmount: string;
  maxUsers: number;
  distributionTime: Date;
  description: string;
  isCancelled: boolean;
  chainName: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}

const airdropSchema: mongoose.Schema<IAirdrop> = new mongoose.Schema<IAirdrop>({
  txSignature: { type: String, required: true, unique: true },
  poolAddress: { type: String, required: true },
  mintAddress: { type: String, required: true },
  creatorAddress: { type: String, required: true },
  tokenName: { type: String, required: true },
  tokenSymbol: { type: String, required: true },
  totalAmount: { type: String, required: true },
  maxUsers: { type: Number, required: true },
  distributionTime: { type: Date, required: true },
  description: { type: String, required: false, default: "" },
  isCancelled: { type: Boolean, required: false, default: false },
  chainName: { type: String, required: false, default: "Initia" },
  logo: { type: String, required: false },
}, {
  timestamps: true
});

airdropSchema.index({ creatorAddress: 1 });
airdropSchema.index({ mintAddress: 1 });
airdropSchema.index({ distributionTime: 1 });

const Airdrop = mongoose.model<IAirdrop>("Airdrop", airdropSchema);

export default Airdrop;
