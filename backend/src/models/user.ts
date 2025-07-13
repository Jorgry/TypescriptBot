import { model, Schema, type InferSchemaType } from "mongoose";

const UserSchema = new Schema({
  id: { type: String, required: true },
  username: { type: String, required: true },
  avatarHash: { type: String, default: null },
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
});

export type TUser = InferSchemaType<typeof UserSchema>;

export default model<TUser>("Users", UserSchema);
