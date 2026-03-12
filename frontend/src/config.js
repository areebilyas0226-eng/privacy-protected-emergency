const PROD_API = "https://privacy-protected-emergency-production-581f.up.railway.app";

const BASE = import.meta.env.VITE_API_URL || PROD_API;

export const API_BASE = `${BASE.replace(/\/$/, "")}/api`;