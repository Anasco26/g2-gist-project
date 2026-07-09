const API_BASE = (import.meta.env.VITE_API_URL || "") + "/api/v1";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token) {
  if (token) localStorage.setItem("accessToken", token);
  else localStorage.removeItem("accessToken");
}

export function getUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (user) localStorage.setItem("user", JSON.stringify(user));
  else localStorage.removeItem("user");
}

export function clearAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

async function request(path, options = {}) {
  const { method = "GET", body } = options;
  const url = `${API_BASE}${path}`;
  const headers = { "Content-Type": "application/json" };
  const token = getAccessToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Server returned non-JSON (${res.status}): ${text.slice(0, 100)}`);
  }
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: "GET" }),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export async function apiLogin(identifier, password) {
  const data = await api.post("/auth/login", { identifier, password });
  if (data?.data?.accessToken) {
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
  }
  return data;
}

export async function apiRegister(body) {
  const data = await api.post("/auth/register", body);
  if (data?.data?.accessToken) {
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
  }
  return data;
}

export async function apiLogout() {
  try {
    await api.post("/auth/logout");
  } catch {}
  clearAuth();
}

export async function apiFetchMe() {
  try {
    const data = await api.get("/auth/me");
    if (data?.data?.user) {
      setUser(data.data.user);
      return data.data.user;
    }
  } catch {}
  return null;
}
