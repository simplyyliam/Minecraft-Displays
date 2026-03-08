const rawApiUrl = import.meta.env.VITE_API_URL;
const normalizedApiUrl = typeof rawApiUrl === "string" ? rawApiUrl.trim().replace(/\/+$/, "") : "";

const configErrorPrefix =
  "Invalid VITE_API_URL for cinema. Set it in packages/cinema/.env.local (or deploy env vars).";

let apiUrlError: string | null = null;

if (!normalizedApiUrl) {
  apiUrlError = `${configErrorPrefix} Current value is empty.`;
} else {
  try {
    // Validate that the value is a well-formed absolute URL.
    new URL(normalizedApiUrl);
  } catch {
    apiUrlError = `${configErrorPrefix} Current value "${rawApiUrl}" is not a valid absolute URL.`;
  }
}

export const API_URL = normalizedApiUrl;
export const API_URL_ERROR = apiUrlError;
