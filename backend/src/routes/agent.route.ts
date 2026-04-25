import { Elysia, t } from "elysia";
import { chat, getConversations, executeTransaction, clearConversation } from "../controllers/agent.controller";


export const agentRoutes = new Elysia({
  detail: {
    tags: ["Agent"],
  },
})
  .post("/agent/chat", chat, {
    body: t.Object({
      message: t.String({ minLength: 1, maxLength: 1000, error: "Message is required (max 1000 chars)" }),
      userAddress: t.String({ minLength: 1, error: "User wallet address is required" }),
    }),
  })
  .get("/agent/conversations", getConversations, {
    query: t.Object({
      address: t.String({ minLength: 1, error: "User address is required" }),
    }),
  })
  .post("/agent/execute", executeTransaction, {
    body: t.Object({
      userAddress: t.String({ minLength: 1, error: "User address is required" }),
      action: t.String({ minLength: 1, error: "Action is required" }),
      txSignature: t.String({ minLength: 1, error: "Transaction signature is required" }),
      poolAddress: t.Optional(t.String()),
      airdropAddress: t.Optional(t.String()),
    }),
  })
  .delete("/agent/conversations", clearConversation, {
    body: t.Object({
      userAddress: t.String({ minLength: 1, error: "User address is required" }),
    }),
  });