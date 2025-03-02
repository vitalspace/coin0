import type { FormData, AISuggestions } from "../types/types";

const API_URL = "http://localhost:3000/api/coin-agent/generate";

export const generateSuggestion = async (
  field: keyof AISuggestions,
  formData: FormData
): Promise<string> => {
  try {
    const prompt = buildPrompt(field, formData);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const { data } = await response.json();
    return processResponse(field, data);
  } catch (error) {
    throw new Error("Failed to generate suggestion");
  }
};

const buildPrompt = (field: string, formData: FormData): string => {
  const prompts = {
    name: () => `Generate creative names...`, // Prompt detallado
    symbol: () => `Create symbols based on ${formData.name}...`,
    supply: () => `Suggest initial supply for memecoin...`,
  };

  return prompts[field]();
};

const processResponse = (field: string, response: string): string => {
  const processors = {
    name: (text: string) => text.replace(/["']/g, ""),
    symbol: (text: string) => text.replace(/[^A-Z]/g, "").slice(0, 5),
    supply: (text: string) => text.replace(/\D/g, "").slice(0, 12),
  };

  return processors[field](response.split("|")[0]);
};
