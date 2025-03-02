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
  const themes = [
    "mythical creatures",
    "astronomical phenomena",
    "internet slang",
    "absurd food combinations",
    "exaggerated everyday objects",
  ];

  const randomTheme = themes[Math.floor(Math.random() * themes.length)];

  const prompts = {
    name: () => `Generate 3 creative memecoin names. Rules:
                1. Based on ${randomTheme}
                2. Maximum 3 words
                3. Unusual term combinations
                4. Avoid "Doge", "Shiba" or "Elon"
                5. Format: Name1|Name2|Name3
                
                Valid examples:
                QuantumCroissant|Memeosaurus|TofuTornado`,
    symbol:
      () => `Create 3 unique symbols (3-5 uppercase letters) for memecoin "${formData.name}". 
          Rules:
          1. Creative derivatives of the coin name
          2. Use initials, phonetic parts, or clever combinations
          3. Avoid exact name repetitions
          4. Format: SYMBOL1|SYMBOL2|SYMBOL3
          
          Examples:
          For "QuantumCroissant": QTC|QCRS|QTCR
          For "Memeosaurus": MEO|MSRS|MEOSR`,
    supply:
      () => `Suggest 3 initial supply amounts for a memecoin. Rules:
                1. Between 1 million and 10 trillion
                2. Rounded numbers with interesting formatting
                3. Use notation: 1M=1,000,000 / 1B=1,000,000,000
                4. Format: NUM1|NUM2|NUM3
                
                Example: 500M|2.5B|10B`,
  };

  return prompts[field]();
};

const processResponse = (field: string, response: string): string => {
  const processors = {
    name: (text: string) => text.replace(/["']/g, ""), // Remove quotes
    symbol: (text: string) => text.replace(/[^A-Z]/g, "").slice(0, 5), // Keep only uppercase letters and limit to 5 characters
    supply: (text: string) => text.replace(/\D/g, "").slice(0, 12), // Keep only digits and limit to 12 characters
  };

  return processors[field](response.split("|")[0]);
};