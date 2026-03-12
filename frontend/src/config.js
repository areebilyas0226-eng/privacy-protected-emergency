const PROD_API = "https://privacy-protected-emergency-production-581f.up.railway.app/api";

export const API_BASE =
  import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : PROD_API;