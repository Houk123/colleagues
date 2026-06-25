"use client";

import axios from "axios";
import { getCsrfToken } from "@/shared/lib/csrf";
import { useAuthStore } from "@/entities/user/model/authStore";
import { toaster } from "@/shared/ui/toaster";

const isBrowser = typeof window !== "undefined";
const baseURL = isBrowser ? "/api" : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api");

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const csrfToken = getCsrfToken();
    if (csrfToken && config.method && config.method !== "get") {
      config.headers["X-CSRF-Token"] = csrfToken;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined") {
      if (error.response?.status === 403) {
        toaster.create({
          title: "Ошибка безопасности",
          description: error.response?.data?.message || "Проверьте CSRF-токен или обновите страницу",
          type: "error",
          duration: 5000,
        });
      } else if (!error.response) {
        toaster.create({
          title: "Сетевые проблемы",
          description: "Не удалось связаться с сервером. Проверьте подключение или запуск бэкенда.",
          type: "error",
          duration: 5000,
        });
      }
    }
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      const isPublic = path === "/" || path === "/login" || path === "/register" || path.startsWith("/invites/");
      if (!isPublic) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
