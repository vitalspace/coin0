import { Elysia, t } from "elysia";
import { createStakingPool, getStakingPools, getStakingPoolByAddress } from "../controllers/staking.controller";

export const stakingRoutes = new Elysia({
  detail: {
    tags: ["Staking"],
  },
})
  .get("/staking-pools", getStakingPools, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      creator: t.Optional(t.String()),
      mint: t.Optional(t.String()),
    }),
  })
  .get("/staking-pools/:poolAddress", getStakingPoolByAddress, {
    params: t.Object({
      poolAddress: t.String({ minLength: 1, error: "Pool address is required" }),
    }),
  })
  .post("/staking-pools", createStakingPool, {
    body: t.Object({
      txSignature: t.String({ minLength: 1, error: "Transaction signature is required" }),
      poolAddress: t.String({ minLength: 1, error: "Pool address is required" }),
      mintAddress: t.String({ minLength: 1, error: "Mint address is required" }),
      rewardMintAddress: t.String({ minLength: 1, error: "Reward mint address is required" }),
      creatorAddress: t.String({ minLength: 1, error: "Creator address is required" }),
      tokenName: t.String({ minLength: 1, error: "Token name is required" }),
      tokenSymbol: t.String({ minLength: 1, error: "Token symbol is required" }),
      rewardAmount: t.String({ minLength: 1, error: "Reward amount is required" }),
      lockSeconds: t.Number({ minimum: 1, error: "Lock seconds must be at least 1" }),
      multiplierBps: t.Number({ minimum: 10000, error: "Multiplier must be at least 1x (10000 bps)" }),
      logo: t.Optional(t.String()),
    }),
  });
