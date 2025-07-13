import { model, Schema, type InferSchemaType } from "mongoose";

const SessionSchema = new Schema({
  userId: { type: String, required: true },
  sessionToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
});

type TSession = InferSchemaType<typeof SessionSchema>;

export default model<TSession>("Sessions", SessionSchema);
