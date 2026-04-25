import { Elysia, t } from "elysia";
import { updateUser, profile, loginWithWallet, getUserTokens } from "../controllers/user.controller";

export const userRoutes = new Elysia({ prefix: "/user" })
  .post("/login", loginWithWallet, {
    body: t.Object({
      address: t.String(),
    }),
  })
  .get("/profile", profile)
  .put("/update", updateUser)
  .get("/tokens", getUserTokens);

