import type { TUser } from "~/models/user";

declare module "hono" {
  interface ContextVariableMap {
    user: TUser;
  }
}
