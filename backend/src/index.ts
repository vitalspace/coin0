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
    check: (ip: string) => {
      const now = Date.now();
      const windowStart = now - windowMs;

      const ipRequests = requests.get(ip) || [];
      const recentRequests: number[] = ipRequests.filter(
        (time: number) => time > windowStart
      );

      requests.set(ip, [...recentRequests, now]);
      return recentRequests.length >= maxRequests;
    },

    cleanup: () => {
      const now = Date.now();
      const windowStart = now - windowMs;

      for (const [ip, times] of requests.entries()) {
        const recentRequests: number[] = times.filter(
          (time: number) => time > windowStart
        );
        if (recentRequests.length === 0) {
          requests.delete(ip);
        } else {
          requests.set(ip, recentRequests);
        }
      }
    },
  };

  setInterval(rateLimiter.cleanup, windowMs);
  return rateLimiter;
};

const rateLimiterMiddleware = (windowMs = 60000, maxRequests = 10) => {
  const rateLimiter = createRateLimiter(windowMs, maxRequests);

  return new Elysia()
    .decorate("rateLimiter", rateLimiter)
    .onRequest(({ rateLimiter, request, set }) => {
      const ip = request.headers.get("x-forwarded-for") || "unknown";

      if (rateLimiter.check(ip)) {
        set.status = 429;
        return {
          success: false,
          message: "Too Many Requests",
          retryAfter: Math.ceil(windowMs / 1000),
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
          hash,
          name,
          symbol,
          owner,
          supply,
          contractAddress,
          chainId,
          chainName,
          image,
        } = body;

        const coin = new Coin({
          hash,
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
        hash: t.String(),
        name: t.String(),
        symbol: t.String(),
        owner: t.String(),
        supply: t.String(),
        contractAddress: t.String(),
        chainId: t.Numeric(),
        chainName: t.String(),
        image: t.String(),
      }),
    }
  )
  .get(
    "/api/coin-agent/coins",
    async ({ query }) => {
      try {
        const page = parseInt(query.page as unknown as string) || 1;
        const limit = parseInt(query.limit as unknown as string) || 10;
        const skip = (page - 1) * limit;

        const coins = await Coin.find().skip(skip).limit(limit).lean().exec();

        const totalCoins = await Coin.countDocuments();
        const totalPages = Math.ceil(totalCoins / limit);

        return {
          message: "Success",
          data: {
            coins,
            pagination: {
              currentPage: page,
              totalPages,
              totalCoins,
              limit,
            },
          },
        };
      } catch (err) {
        return error(500, { message: `Internal Server Error: ${err}` });
      }
    },
    {
      query: t.Object({
        page: t.Optional(t.Numeric({ default: 1 })),
        limit: t.Optional(t.Numeric({ default: 10 })),
      }),
    }
  )

  .post(
    "/api/coin-agent/play",
    async ({ body }) => {
      try {
        const { userMove } = body;

        const validMoves = ["rock", "paper", "scissors"];

        if (!validMoves.includes(userMove)) {
          return error(400, { message: "Invalid move user" });
        }

        const prompt = `Eres un agente de IA. Responde SOLO con una de estas opciones al azar: "rock", "paper" o "scissors". No des explicaciones ni contexto adicional.`;
        const result = await model.generateContent(prompt);

        const aiMove = result.response.text().toLowerCase().trim();

        if (!validMoves.includes(aiMove)) {
          return error(400, { message: "Invalid move ia" });
        }

        let resultMessage;
        let isWin = false;

        if (userMove === aiMove) {
          isWin = false;
          resultMessage = "Draw game!";
        } else if (
          (userMove === "rock" && aiMove === "scissors") ||
          (userMove === "paper" && aiMove === "rock") ||
          (userMove === "scissors" && aiMove === "paper")
        ) {
          isWin = true;
          resultMessage = `You win! Now you can create your coin totally free.`;
        } else {
          isWin = false;
          resultMessage = `You lost!`;
        }
        return {
          message: "Success",
          data: {
            aiMove: aiMove,
            isPlayerWin: isWin,
            result: resultMessage,
          },
        };
      } catch (err) {
        return error(500, { message: `Internal Server Error: ${err}` });
      }
    },
    {
      body: t.Object({
        userMove: t.String(),
      }),
    }
  )

  .post(
    "/api/coin-agent/lose-coin",
    async ({ body }) => {
      try {
        const { userName } = body;

        // Temática basada en la derrota del usuario
        const randomTheme = `${userName}'s Epic Fail`;

        // Generar nombres burlones
        const namePrompt = `Generate 3 creative memecoin names. Rules:
          1. Based on ${randomTheme}
          2. Maximum 3 words
          3. Unusual term combinations
          4. Avoid "Doge", "Shiba" or "Elon"
          5. Format: Name1|Name2|Name3
          6. Must mock ${userName} for losing a game
          
          Valid examples:
          QuantumFail|LoserLlamas|TofuTears`;
        const nameResult = await model.generateContent(namePrompt);
        const names = nameResult.response.text().trim().split("|");
        const name = names[0]; // Seleccionamos el primer nombre generado

        // Generar símbolos burlones
        const symbolPrompt = `Create 3 unique symbols (3-5 uppercase letters) for a memecoin mocking ${userName} for losing a game. 
          Rules:
          1. Creative derivatives of the coin name
          2. Use initials, phonetic parts, or clever combinations
          3. Avoid exact name repetitions
          4. Format: SYMBOL1|SYMBOL2|SYMBOL3
          5. Must mock ${userName} for losing a game

          No des explicaciones ni contexto adicional solo dame el simbolo.
          
          Examples:
          For "QuantumFail": QTF|FAIL|QFL
          For "LoserLlamas": LLL|LMAO|LOSE`;
        const symbolResult = await model.generateContent(symbolPrompt);
        const symbols = symbolResult.response.text().trim().split("|");
        const symbol = symbols[0]; // Seleccionamos el primer símbolo generado

        // Generar supply burlón
        const supplyPrompt = `
        give me a number between 1 and 9 at random,
        you should only return number NOT TEXT, No des explicaciones ni contexto adicional. solo dame el numero ramdom entre 1 y 9, 

        example: 1|4|9
        `;
        const supplyResult = await model.generateContent(supplyPrompt);
        const supplies = supplyResult.response.text().trim().split("|");
        const supply = supplies[0]; // Seleccionamos el primer supply generado

        // Generar descripción del logo burlón
        const logoPrompt = ` Generate a logo for a memecoin called ${symbolResult} for losing a game. 
          Rules:
          1. Use humor and sarcasm
          2. Be creative and visually descriptive
          3. Include the text "${symbol}" in a typography suitable for the style.

          
          Example: A sad llama wearing a "Loser" crown, sitting on a pile of broken game controllers, with a tear rolling down its face.`;

        // Generar el logo usando Cloudflare
        const logoResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUD_FLARE_ACCOUNT_ID}/ai/run/${process.env.CLOUD_FLARE_IA_MODEL_ID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.CLOUD_FLARE_API_KEY}`,
            },
            body: JSON.stringify({ prompt: logoPrompt }),
          }
        );

        const logoData = await logoResponse.json();
        const logo = `data:image/png;base64,${logoData.result.image}`;

        return {
          message: "Success",
          data: {
            name,
            symbol,
            supply,
            logo,
          },
        };
      } catch (err) {
        return error(500, { message: `Internal Server Error: ${err}` });
      }
    },
    {
      body: t.Object({
        userName: t.String(),
      }),
    }
  )

  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
