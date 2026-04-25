import { Context } from "elysia";
import AgentConversation from "../models/agent.model";
import { runAgent, clearUserConversation } from "../services/agent";

export const chat = async (ctx: Context) => {
  try {
    const body = ctx.body as any;
    const { message, userAddress } = body;

    if (!message || !userAddress) {
      ctx.set.status = 400;
      return { message: "Message and userAddress are required" };
    }

    // Save user message to DB
    let conversation = await AgentConversation.findOne({ userAddress });
    if (!conversation) {
      conversation = new AgentConversation({ userAddress, messages: [] });
    }
    conversation.messages.push({
      role: "user" as const,
      content: message,
      timestamp: new Date()
    });

    // Run MCP agent
    const result = await runAgent(message, userAddress);

    // Save assistant response to DB
    conversation.messages.push({
      role: "assistant" as const,
      content: result.response,
      timestamp: new Date(),
      action: result.metadata?.action,
      metadata: result.metadata,
    });
    await conversation.save();

    ctx.set.status = 200;
    return {
      response: result.response,
      intent: result.metadata?.action || 'chat',
      metadata: result.metadata || {},
    };
  } catch (error: any) {
    console.error("Error in chat:", error);
    ctx.set.status = 500;
    return { message: "Internal server error", error: error.message };
  }
};

export const getConversations = async (ctx: Context) => {
  try {
    const query = ctx.query as Record<string, string | undefined>;
    const userAddress = query.address;

    if (!userAddress) {
      ctx.set.status = 400;
      return { message: "User address is required" };
    }

    const conversation = await AgentConversation.findOne({ userAddress }).lean();

    ctx.set.status = 200;
    return {
      conversation: conversation || null,
      messageCount: conversation?.messages?.length || 0
    };
  } catch (error: any) {
    console.error("Error in getConversations:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};

export const executeTransaction = async (ctx: Context) => {
  try {
    const body = ctx.body as any;
    const { userAddress, action, txSignature, poolAddress, airdropAddress } = body;

    if (!userAddress || !action || !txSignature) {
      ctx.set.status = 400;
      return { message: "userAddress, action, and txSignature are required" };
    }

    ctx.set.status = 200;
    return {
      success: true,
      message: "Transaction submitted successfully",
      txSignature,
      action,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error("Error in executeTransaction:", error);
    ctx.set.status = 500;
    return { message: "Internal server error", error: error.message };
  }
};

export const clearConversation = async (ctx: Context) => {
  try {
    const body = ctx.body as any;
    const { userAddress } = body;

    if (!userAddress) {
      ctx.set.status = 400;
      return { message: "User address is required" };
    }

    // Clear from DB
    await AgentConversation.deleteOne({ userAddress });
    // Clear from in-memory context
    clearUserConversation(userAddress);

    ctx.set.status = 200;
    return { message: "Conversation cleared successfully" };
  } catch (error: any) {
    console.error("Error in clearConversation:", error);
    ctx.set.status = 500;
    return { message: "Internal server error" };
  }
};
