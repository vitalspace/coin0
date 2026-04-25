import { Elysia, t } from "elysia";
import { createAirdrop, getAirdrops, getAirdropByPoolAddress, cancelAirdrop } from "../controllers/airdrop.controller";

export const airdropRoutes = new Elysia({
  detail: {
    tags: ["Airdrop"],
  },
})
  .get("/airdrops", getAirdrops, {
    query: t.Object({
      page: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      creator: t.Optional(t.String()),
    }),
  })
  .get("/airdrops/:poolAddress", getAirdropByPoolAddress, {
    params: t.Object({
      poolAddress: t.String({ minLength: 1, error: "Pool address is required" }),
    }),
  })
  .put("/airdrops/:poolAddress/cancel", cancelAirdrop, {
    params: t.Object({
      poolAddress: t.String({ minLength: 1, error: "Pool address is required" }),
    }),
  })
  .post("/airdrops", createAirdrop, {
    body: t.Object({
      txSignature: t.String({ minLength: 1, error: "Transaction signature is required" }),
      poolAddress: t.String({ minLength: 1, error: "Pool address is required" }),
      mintAddress: t.String({ minLength: 1, error: "Mint address is required" }),
      creatorAddress: t.String({ minLength: 1, error: "Creator address is required" }),
      tokenName: t.String({ minLength: 1, error: "Token name is required" }),
      tokenSymbol: t.String({ minLength: 1, error: "Token symbol is required" }),
      totalAmount: t.String({ minLength: 1, error: "Total amount is required" }),
      maxUsers: t.Number({ minimum: 1, error: "Max users must be at least 1" }),
      distributionTime: t.String({ minLength: 1, error: "Distribution time is required" }),
      description: t.Optional(t.String()),
      logo: t.Optional(t.String()),
    }),
  });
