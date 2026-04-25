import { Elysia, t } from "elysia";

import { createToken, getTokens, getTokenByTxHash, getTokenByAddress } from "../controllers/coin.controller";
import { generateMemecoinNames, generateDescription } from "../controllers/cerebras.controller";

export const tokenRoutes = new Elysia({
    detail: {
        tags: ["Token"],
    },
})
    .get("/tokens", getTokens, {
        query: t.Object({
            page: t.Optional(t.String()),
            limit: t.Optional(t.String()),
            owner: t.Optional(t.String()),
        }),
    })
    .post("/create-token", createToken, {
        body: t.Object({
            name: t.String({ minLength: 1, error: "Name is required" }),
            symbol: t.String({ minLength: 1, error: "Symbol is required" }),
            owner: t.String({ minLength: 1, error: "Owner address is required" }),
            supply: t.String({ minLength: 1, error: "Supply is required" }),
            txHash: t.String({ minLength: 1, error: "Payment transaction ID is required" }),
            contractAddress: t.Optional(t.String()),
            logo: t.Optional(t.String()),
        }),
    })
    .get("/tokens/:txhash", getTokenByTxHash, {
        params: t.Object({
            txhash: t.String({ minLength: 1, error: "Transaction hash is required" }),
        }),
    })
    .get("/tokens/address/:address", getTokenByAddress, {
        params: t.Object({
            address: t.String({ minLength: 1, error: "Token address is required" }),
        }),
    })
    .post("/generate-memecoin-names", generateMemecoinNames, {
        body: t.Object({
            theme: t.Optional(t.String()),
            keywords: t.Optional(t.String()),
            count: t.Optional(t.Numeric({ minimum: 1, maximum: 10 })),
        }),
    })
    .post("/generate-description", generateDescription, {
        body: t.Object({
            type: t.String({ pattern: '^(airdrop|staking)$', error: "Type must be 'airdrop' or 'staking'" }),
            tokenName: t.String({ minLength: 1, error: "Token name is required" }),
            tokenSymbol: t.String({ minLength: 1, error: "Token symbol is required" }),
            amount: t.Optional(t.String()),
            lockDays: t.Optional(t.Numeric()),
            multiplier: t.Optional(t.String()),
        }),
    });
