import axios from "./axios";

export const generateLogo = async (prompt: string) => axios.post("/logo-generate", { prompt });