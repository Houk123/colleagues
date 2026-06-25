import api from "@/shared/api/axios";

let csrfToken: string | null = null;

export function getCsrfToken() {
  return csrfToken;
}

export async function initCsrfToken() {
  if (csrfToken) return csrfToken;
  try {
    const { data } = await api.get<{ csrfToken: string }>("/csrf", {
      withCredentials: true,
    });
    csrfToken = data.csrfToken;
    return csrfToken;
  } catch {
    return null;
  }
}

export function setCsrfToken(token: string | null) {
  csrfToken = token;
}
