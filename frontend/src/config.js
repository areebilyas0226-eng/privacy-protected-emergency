const PROD_API = "https://privacy-protected-emergency-production-581f.up.railway.app/api";

const envUrl = import.meta.env.VITE_API_URL;

/* Normalize env variable */
export const API_BASE = envUrl
  ? envUrl.replace(/\/$/, "").replace(/\/api$/, "") + "/api"
  : PROD_API;