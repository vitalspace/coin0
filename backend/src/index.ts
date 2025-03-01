import { cors } from "@elysiajs/cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Elysia, error, t } from "elysia";
import Coin from "./models/coin.mode";
import { buildLogoPrompt } from "./utils/logoIAGenerator";
import db from "./db/db";

// Initialize the database
db();

// Initialize the Google Generative AI
//@ts-ignore
const genIA = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genIA.getGenerativeModel({
  //@ts-ignore
  model: process.env.GOOGLE_IA_MODEL_ID,
});

// Simple in-memory rate limiter
const createRateLimiter = (windowMs = 60000, maxRequests = 10) => {
  const requests = new Map();

  const rateLimiter = {
    check: (ip) => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Get the requests for this IP
      const ipRequests = requests.get(ip) || [];
      
      // Filter out requests outside the current window
      const recentRequests = ipRequests.filter(time => time > windowStart);
      
      // Update the requests
      requests.set(ip, [...recentRequests, now]);
      
      // Check if the IP has exceeded the rate limit
      return recentRequests.length >= maxRequests;
    },
    // Clean up old data
    cleanup: () => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      for (const [ip, times] of requests.entries()) {
        const recentRequests = times.filter(time => time > windowStart);
        if (recentRequests.length === 0) {
          requests.delete(ip);
        } else {
          requests.set(ip, recentRequests);
        }
      }
    }
  };

  // Clean up old data periodically
  setInterval(rateLimiter.cleanup, windowMs);

  return rateLimiter;
};

// Rate limiter middleware
const rateLimiterMiddleware = (windowMs = 60000, maxRequests = 10) => {
  const rateLimiter = createRateLimiter(windowMs, maxRequests);
  
  return new Elysia()
    .decorate('rateLimiter', rateLimiter)
    .onRequest(({ rateLimiter, request, set }) => {
      // Extract the IP address
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      
      // Check if the IP has exceeded the rate limit
      if (rateLimiter.check(ip)) {
        set.status = 429;
        return {
          success: false,
          message: 'Too Many Requests',
          retryAfter: Math.ceil(windowMs / 1000)
        };
      }
    });
};

const app = new Elysia()
  .use(
    cors({
      //@ts-ignore
      origin: [process.env.ALLOED_ORIGIN_1, process.env.ALLOED_ORIGIN_2],
      allowedHeaders: ["Content-Type"],
      methods: ["GET", "POST", "PUT", "DELETE"],
    })
  )
  // Apply rate limiting - 60 requests per minute
  .use(rateLimiterMiddleware(60000, 20))
  .get("/", () => "Hello Elysia")

  .post(
    "/api/coin-agent/generate",
    async ({ body }) => {
      try {
        const { prompt } = body;
        const result = await model.generateContent(prompt);

        return {
          message: "Success",
          data: result.response.text(),
        };
      } catch (err) {
        return error(500, { message: `Internal Server Error: ${err}` });
      }
    },
    {
      body: t.Object({
        prompt: t.String(),
      }),
    }
  )
  .post(
    "/api/coin-agent/logo-generate",
    async ({ body }) => {
      try {
        const { prompt } = body;

        const response = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUD_FLARE_ACCOUNT_ID}/ai/run/${process.env.CLOUD_FLARE_IA_MODEL_ID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CLOUD_FLARE_API_KEY}`,
            },
            body: JSON.stringify({ prompt: buildLogoPrompt(prompt) }),
          }
        );

        const data = await response.json();
        const dataURI = `data:image/png;base64,${data.result.image}`;

        return {
          message: "Success",
          image: dataURI,
        };
      } catch (err) {
        return error(500, { message: `Internal Server Error: ${err}` });
      }
    },
    {
      body: t.Object({
        prompt: t.String(),
      }),
    }
  )

  .post(
    "/api/coin-agent/create-coin",
    async ({ body }) => {
      try {
        const {
          name,
          symbol,
          owner,
          supply,
          contractAddress,
          chainId,
          chainName,
          image,
        } = body;

        console.log(body);

        const coin = new Coin({
          name,
          symbol,
          owner,
          supply,
          contractAddress,
          chainId,
          chainName,
          image,
        });

        await coin.save();

        return {
          message: "Success",
        };
      } catch (err) {
        return error(500, { message: `Internal Server Error: ${err}` });
      }
    },
    {
      body: t.Object({
        name: t.String(),
        symbol: t.String(),
        owner: t.String(),
        supply: t.String(),
        contractAddress: t.String(),
        chainId: t.String(),
        chainName: t.String(),
        image: t.String(),
      }),
    }
  )

  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);