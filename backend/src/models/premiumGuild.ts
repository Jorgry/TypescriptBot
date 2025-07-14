import { model, Schema, type InferSchemaType } from "mongoose";

const PremiumGuildSchema = new Schema(
  {
    guildId: { type: String, required: true },
    plan: { type: String, enum: ["monthly", "lifetime"], default: "monthly" },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export type TPremiumGuild = InferSchemaType<typeof PremiumGuildSchema>;

export default model<TPremiumGuild>("PremiumGuilds", PremiumGuildSchema);
