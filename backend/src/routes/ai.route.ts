import { Elysia, t } from "elysia";
import { generateImage, uploadImage } from "../controllers/ai.controller";

export const aiRoutes = new Elysia({
  detail: {
    tags: ["AI"],
  },
})
  .post("/generate-image", generateImage, {
    body: t.Object({
      prompt: t.String({ minLength: 1, maxLength: 500, error: "Prompt is required (max 500 chars)" }),
    }),
  })
  .post("/upload-image", uploadImage, {
    body: t.Object({
      file: t.File({ error: "Image file is required" }),
    }),
  });
