import mongoose, { type Document } from "mongoose";

export interface IStakingPool extends Document {
  txSignature: string;
  poolAddress: string;
  mintAddress: string;
  rewardMintAddress: string;
  creatorAddress: string;
  tokenName: string;
  tokenSymbol: string;
  rewardAmount: string;
  lockSeconds: number;
  multiplierBps: number;
  logo: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const stakingPoolSchema: mongoose.Schema<IStakingPool> = new mongoose.Schema<IStakingPool>({
  txSignature: { type: String, required: true, unique: true },
  poolAddress: { type: String, required: true },
  mintAddress: { type: String, required: true },
  rewardMintAddress: { type: String, required: true },
  creatorAddress: { type: String, required: true },
  tokenName: { type: String, required: true },
  tokenSymbol: { type: String, required: true },
  rewardAmount: { type: String, required: true },
  lockSeconds: { type: Number, required: true },
  multiplierBps: { type: Number, required: true },
  logo: { type: String, required: false },
  description: { type: String, required: false },
  isActive: { type: Boolean, required: false, default: true },
}, {
  timestamps: true
});

stakingPoolSchema.index({ creatorAddress: 1 });
stakingPoolSchema.index({ mintAddress: 1 });

const StakingPool = mongoose.model<IStakingPool>("StakingPool", stakingPoolSchema);

export default StakingPool;
