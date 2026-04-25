import cors from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { staticPlugin } from "@elysiajs/static";
import { Elysia } from "elysia";
import { connectDB } from "./database/database";
import { userRoutes } from "./routes/user.route";
import { tokenRoutes } from "./routes/coin.route";
import { airdropRoutes } from "./routes/airdrop.route";
import { aiRoutes } from "./routes/ai.route";
import { stakingRoutes } from "./routes/staking.route";
import { agentRoutes } from "./routes/agent.route";


(async () => {
  await connectDB();
})();

const app = new Elysia()
  .use(
    cors({
      origin: "*",
      allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret:
        process.env.JWT_SECRET || "* m i r a n d o m s e c r e t gg 123.*",
    }),
  )
  .use(
    staticPlugin({
      assets: "public",
      prefix: "/public",
    }),
  )
  .group("/api/v1", (app) => app.use(userRoutes).use(tokenRoutes).use(airdropRoutes).use(aiRoutes).use(stakingRoutes).use(agentRoutes))
  .listen(4000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
