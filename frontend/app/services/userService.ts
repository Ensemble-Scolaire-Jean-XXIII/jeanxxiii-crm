import { api, BASE_URL } from "./api";

export const userService = {
  login: async (email: string, password_hash: string) => {
    const res = await fetch(`${BASE_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password_hash }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Identifiants invalides");
    }
    return res.json();
  },
  getAll: () => api.get("/users"),
  getMe: () => api.get("/users/me"),
  create: (data: unknown) => api.post("/users", data),
  update: (id: string | number, data: unknown) => api.put(`/users/${id}`, data),
  updateMe: (data: unknown) => api.put("/users/me", data),
  delete: (id: string | number) => api.delete(`/users/${id}`),
};
