import { Context } from "elysia";
import Token from "../models/coin.model";


export const getTokens = async (ctx: Context) => {
  try {
    const query = ctx.query as Record<string, string | undefined>;
    const page = Math.max(1, parseInt(query.page || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10') || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (query.owner) {
      filter.owner = query.owner;
    }

    const [tokens, total] = await Promise.all([
      Token.find(filter)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Token.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    ctx.set.status = 200;
    return {
      tokens,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  } catch (error) {
    console.error('Error in getTokens:', error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
}

export const createToken = async (ctx: Context) => {
  try {
    const body = ctx.body as any;

    const {
      txHash,
      name,
      symbol,
      owner,
      supply,
      contractAddress,
      chainName,
      logo, } = body


    if (!txHash || !name || !symbol || !owner || !supply) {
      ctx.set.status = 400;
      return { message: "Missing required fields: hash, name, symbol, owner, supply" };
    }

    const token = new Token({
      txHash,
      name: name as string,
      symbol: symbol as string,
      owner: owner as string,
      supply: supply as string,
      contractAddress: contractAddress as string || undefined,
      chainName: chainName as string || "Initia",
      logo: logo as string || undefined,
    });
    await token.save();

    ctx.set.status = 201;
    return {
      message: "Token saved successfully",
      token: token.toObject(),
    };

  } catch (error) {
    console.error('Error in saveToken:', error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
}


export const getTokenByTxHash = async (ctx: Context) => {
  try {
    const params = ctx.params as { txhash: string };
    const { txhash } = params;

    if (!txhash) {
      ctx.set.status = 400;
      return { message: "TxHash is required" };
    }

    const token = await Token.findOne({
      txHash: { $regex: new RegExp('^' + txhash + '$', 'i') }
    }).lean();

    if (!token) {
      ctx.set.status = 404;
      return { message: "Token not found" };
    }

    ctx.set.status = 200;
    return {
      token,
    };
  } catch (error) {
    console.error('Error in getTokenByTxHash:', error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const getTokenByAddress = async (ctx: Context) => {
  try {
    const params = ctx.params as { address: string };
    const { address } = params;

    if (!address) {
      ctx.set.status = 400;
      return { message: "Address is required" };
    }

    const escaped = address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const token = await Token.findOne({
      contractAddress: { $regex: new RegExp('^' + escaped + '$', 'i') }
    }).lean();

    if (!token) {
      ctx.set.status = 404;
      return { message: "Token not found" };
    }

    ctx.set.status = 200;
    return {
      token,
    };
  } catch (error) {
    console.error('Error in getTokenByAddress:', error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};
