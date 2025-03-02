import axios from "./axios";

export const getCoins = async () => axios.get("/coins");
