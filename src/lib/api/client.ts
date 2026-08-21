import axios from "axios";

import { getToken } from "@/lib/api/token";

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
