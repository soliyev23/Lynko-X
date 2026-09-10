export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lynkox_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("lynkox_token", token);
  else localStorage.removeItem("lynkox_token");
}

export async function api<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  if (res.status === 401 && typeof window !== "undefined") {
    setToken(null);
    if (!location.pathname.startsWith("/login")) location.href = "/login";
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg = Array.isArray(body?.message)
      ? body.message.join(", ")
      : (body?.message ?? `Xatolik: ${res.status}`);
    throw new Error(msg);
  }
  return res.json();
}

/** Rasm faylini serverga yuklab, URL qaytaradi. */
export async function uploadImage(file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? "Rasm yuklashda xatolik");
  }
  return (await res.json()).url;
}
