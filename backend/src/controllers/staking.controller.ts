import { Context } from "elysia";
import StakingPool from "../models/staking.model";

export const createStakingPool = async (ctx: Context) => {
  try {
    const body = ctx.body as any;
    const {
      txSignature,
      poolAddress,
      mintAddress,
      rewardMintAddress,
      creatorAddress,
      tokenName,
      tokenSymbol,
      rewardAmount,
      lockSeconds,
      multiplierBps,
      logo,
      description,
    } = body;

    if (!txSignature || !poolAddress || !mintAddress || !rewardMintAddress || !creatorAddress || !tokenName || !tokenSymbol || !rewardAmount || !lockSeconds || !multiplierBps) {
      ctx.set.status = 400;
      return { message: "Missing required fields" };
    }

    const pool = new StakingPool({
      txSignature,
      poolAddress,
      mintAddress,
      rewardMintAddress,
      creatorAddress,
      tokenName,
      tokenSymbol,
      rewardAmount,
      lockSeconds,
      multiplierBps,
      logo: logo || undefined,
      description: description || undefined,
    });
    await pool.save();

    ctx.set.status = 201;
    return {
      message: "Staking pool saved successfully",
      pool: pool.toObject(),
    };
  } catch (error: any) {
    console.error("Error in createStakingPool:", error);
    if (error?.code === 11000) {
      ctx.set.status = 409;
      return { message: "Staking pool already exists for this transaction" };
    }
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const getStakingPools = async (ctx: Context) => {
  try {
    const query = ctx.query as Record<string, string | undefined>;
    const page = Math.max(1, parseInt(query.page || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10") || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.creator) {
      filter.creatorAddress = query.creator;
    }
    if (query.mint) {
      filter.mintAddress = query.mint;
    }

    const [pools, total] = await Promise.all([
      StakingPool.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      StakingPool.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    ctx.set.status = 200;
    return {
      pools,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    console.error("Error in getStakingPools:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const getStakingPoolByAddress = async (ctx: Context) => {
  try {
    const params = ctx.params as { poolAddress: string };
    const { poolAddress } = params;

    if (!poolAddress) {
      ctx.set.status = 400;
      return { message: "Pool address is required" };
    }

    const escaped = poolAddress.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pool = await StakingPool.findOne({
      poolAddress: { $regex: new RegExp("^" + escaped + "$", "i") },
    }).lean();

    if (!pool) {
      ctx.set.status = 404;
      return { message: "Staking pool not found" };
    }

    ctx.set.status = 200;
    return { pool };
  } catch (error) {
    console.error("Error in getStakingPoolByAddress:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};
