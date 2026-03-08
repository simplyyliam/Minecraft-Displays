const rawApiUrl = import.meta.env.VITE_API_URL;

if (!rawApiUrl) {
  throw new Error(
    "Missing VITE_API_URL. Set it in packages/controller/.env.local (or your deploy env vars).",
  );
}

export const API_URL = rawApiUrl.replace(/\/$/, "");
