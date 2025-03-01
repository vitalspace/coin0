import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyB7sBJG7rpFfefAbo4T0C50BLWy7KzzbvU");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

let isGenerating = {
  name: false,
  symbol: false,
  supply: false,
};

let generationError: string | null = null;

async function generateAISuggestion(field: "name" | "symbol" | "supply") {
  try {
    generationError = null;
    isGenerating = { ...isGenerating, [field]: true };

    const prompts = {
      name: `Generate a creative, catchy name for a memecoin. 
               Respond ONLY with the name, nothing else. 
               Make it related to internet culture or crypto trends.`,

      symbol: `Suggest a 3-5 letter uppercase symbol for a cryptocurrency. 
                 It should be memorable and related to the name ${formData.name}.
                 Respond ONLY with the symbol.`,

      supply: `Suggest a realistic initial token supply for a memecoin. 
                 Consider typical supplies in cryptocurrency.
                 Respond ONLY with the number, no text.`,
    };

    const result = await model.generateContent(prompts[field]);
    const response = await result.response;
    const text = response.text().trim();

    aiSuggestion[field] = formatSuggestion(field, text);
  } catch (err) {
    generationError = "Error generating suggestion. Please try again.";
    console.error("Gemini API error:", err);
  } finally {
    isGenerating = { ...isGenerating, [field]: false };
  }
}

function formatSuggestion(field: string, text: string): string {
  switch (field) {
    case "symbol":
      return text.replace(/[^A-Z]/g, "").slice(0, 5);
    case "supply":
      return text.replace(/\D/g, "").slice(0, 12);
    default:
      return text;
  }
}
