import { Context } from "elysia";
import Airdrop from "../models/airdrop.model";

export const createAirdrop = async (ctx: Context) => {
  try {
    const body = ctx.body as any;
    const {
      txSignature,
      poolAddress,
      mintAddress,
      creatorAddress,
      tokenName,
      tokenSymbol,
      totalAmount,
      maxUsers,
      distributionTime,
      description,
      logo,
    } = body;

    if (!txSignature || !poolAddress || !mintAddress || !creatorAddress || !tokenName || !tokenSymbol || !totalAmount || !maxUsers || !distributionTime) {
      ctx.set.status = 400;
      return { message: "Missing required fields" };
    }

    const airdrop = new Airdrop({
      txSignature,
      poolAddress,
      mintAddress,
      creatorAddress,
      tokenName,
      tokenSymbol,
      totalAmount,
      maxUsers,
      distributionTime: new Date(distributionTime),
      description: description || "",
      logo: logo || undefined,
    });
    await airdrop.save();

    ctx.set.status = 201;
    return {
      message: "Airdrop saved successfully",
      airdrop: airdrop.toObject(),
    };
  } catch (error: any) {
    console.error("Error in createAirdrop:", error);
    if (error?.code === 11000) {
      ctx.set.status = 409;
      return { message: "Airdrop already exists for this pool address" };
    }
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const getAirdrops = async (ctx: Context) => {
  try {
    const query = ctx.query as Record<string, string | undefined>;
    const page = Math.max(1, parseInt(query.page || "1") || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || "10") || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.creator) {
      filter.creatorAddress = query.creator;
    }

    const [airdrops, total] = await Promise.all([
      Airdrop.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Airdrop.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    ctx.set.status = 200;
    return {
      airdrops,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    console.error("Error in getAirdrops:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const getAirdropByPoolAddress = async (ctx: Context) => {
  try {
    const params = ctx.params as { poolAddress: string };
    const { poolAddress } = params;

    if (!poolAddress) {
      ctx.set.status = 400;
      return { message: "Pool address is required" };
    }

    const escaped = poolAddress.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const airdrop = await Airdrop.findOne({
      poolAddress: { $regex: new RegExp("^" + escaped + "$", "i") },
    }).lean();

    if (!airdrop) {
      ctx.set.status = 404;
      return { message: "Airdrop not found" };
    }

    ctx.set.status = 200;
    return { airdrop };
  } catch (error) {
    console.error("Error in getAirdropByPoolAddress:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const cancelAirdrop = async (ctx: Context) => {
  try {
    const params = ctx.params as { poolAddress: string };
    const { poolAddress } = params;

    if (!poolAddress) {
      ctx.set.status = 400;
      return { message: "Pool address is required" };
    }

    const escaped = poolAddress.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const airdrop = await Airdrop.findOneAndUpdate(
      { poolAddress: { $regex: new RegExp("^" + escaped + "$", "i") } },
      { isCancelled: true },
      { returnDocument: "after" }
    ).lean();

    if (!airdrop) {
      ctx.set.status = 404;
      return { message: "Airdrop not found" };
    }

    ctx.set.status = 200;
    return { airdrop };
  } catch (error) {
    console.error("Error in cancelAirdrop:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};
