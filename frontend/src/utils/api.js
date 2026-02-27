const API_BASE = import.meta.env.VITE_API_URL;

if (!API_BASE) {
  throw new Error("VITE_API_URL not defined");
}

function buildUrl(path) {
  return `${API_BASE}/api${path}`;
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(buildUrl(path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  });

  if (res.status === 401) {
    window.location.replace("/admin-login");
    return null;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `HTTP ${res.status}`);
  }

  return data;
}