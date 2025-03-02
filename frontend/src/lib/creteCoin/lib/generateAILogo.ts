import { generateLogo } from "../../services/logo.service";

export const generateAILogo = async (prompt: string) => {
  try {
    const response = await generateLogo(prompt);
    return response.data.image;
  } catch (error) {
    throw new Error("Failed to generate logo");
  }
};
