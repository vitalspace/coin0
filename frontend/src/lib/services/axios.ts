import axios, { type AxiosInstance } from "axios";
import { API_URL } from "../constants/constants";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default axiosInstance;
