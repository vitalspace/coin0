import { Context } from "elysia";
import User, { type IUser, type ISocial } from "../models/user.model";
import Token from "../models/coin.model";

const getAddressFromToken = async (ctx: Context): Promise<string | null> => {
  const authHeader = ctx.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7);
  
  try {
    //@ts-ignore
    const payload = await ctx.jwt.verify(token);
    return payload.address as string;
  } catch {
    return null;
  }
};

export const getUserTokens = async (ctx: Context) => {
  try {
    const address = await getAddressFromToken(ctx);

    if (!address) {
      ctx.set.status = 401;
      return { message: "Unauthorized: Invalid token" };
    }

    // Case-insensitive search for EVM addresses
    const escaped = address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const tokens = await Token.find({
      owner: { $regex: new RegExp('^' + escaped + '$', 'i') }
    }).sort({ createdAt: -1 });

    ctx.set.status = 200;
    return { tokens };
  } catch (err) {
    ctx.set.status = 500;
    return { message: "Internal server error", error: String(err) };
  }
};

export const updateUser = async (ctx: Context) => {
  try {
    const address = await getAddressFromToken(ctx);

    if (!address) {
      ctx.set.status = 401;
      return { message: "Unauthorized: Invalid token" };
    }

    const updates = ctx.body as Partial<IUser>;

    if (updates.socials && Array.isArray(updates.socials)) {
      const existingUser = await User.findOne({ address });
      if (existingUser) {
        const existingSocials = existingUser.socials || [];
        
        for (const newSocial of updates.socials) {
          const existingIndex = existingSocials.findIndex(
            (s: ISocial) => s.platform.toLowerCase() === newSocial.platform.toLowerCase()
          );
          
          if (existingIndex >= 0) {
            existingSocials[existingIndex] = newSocial;
          } else {
            existingSocials.push(newSocial);
          }
        }
        
        updates.socials = existingSocials;
      }
    }

    const user = await User.findOneAndUpdate({ address }, updates, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    ctx.set.status = 200;
    return { user: user.toObject() };
  } catch (err) {
    ctx.set.status = 500;
    return { message: "Internal server error", error: String(err) };
  }
};

export const profile = async (ctx: Context) => {
  try {
    const address = await getAddressFromToken(ctx);

    if (!address) {
      ctx.set.status = 401;
      return { message: "Unauthorized: Invalid token" };
    }

    const user = await User.findOne({
      address,
    }).select("-_id -__v -udpatedAt");

    if (!user) {
      ctx.set.status = 404;
      return { message: "User not found" };
    }

    ctx.set.status = 200;
    return user.toObject();
  } catch (err) {
    ctx.set.status = 500;
    return { message: "Internal server error", error: String(err) };
  }
};

export const loginWithWallet = async (ctx: Context) => {
  try {
    const { address } = ctx.body as { address: string };

    let user = await User.findOne({ address });

    if (!user) {
      user = new User({
        address,
      });

      await user.save();
    }

    //@ts-ignore
    const token = await ctx.jwt.sign({
      address: user.address,
    });

    ctx.set.status = 200;
    return { user, token };
  } catch (err) {
    ctx.set.status = 500;
    return { message: "Internal server error", error: String(err) };
  }
};
