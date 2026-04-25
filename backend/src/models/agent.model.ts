import mongoose, { type Document, Schema } from "mongoose";

export interface IAgentMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  intent?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface IAgentConversation extends Document {
  userAddress: string;
  messages: IAgentMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const AgentMessageSchema = new Schema<IAgentMessage>(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    intent: { type: String },
    action: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const AgentConversationSchema = new Schema<IAgentConversation>(
  {
    userAddress: { type: String, required: true, index: true },
    messages: { type: [AgentMessageSchema], default: [] },
  },
  { timestamps: true }
);

AgentConversationSchema.index({ userAddress: 1, updatedAt: -1 });

const AgentConversation = mongoose.model<IAgentConversation>(
  "AgentConversation",
  AgentConversationSchema
);

export default AgentConversation;