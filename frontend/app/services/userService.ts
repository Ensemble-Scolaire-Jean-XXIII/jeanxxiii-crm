import { api, BASE_URL } from "./api";
import { User, CreateUserDTO } from "../types";

export const userService = {
  login: async (
    email: string,
    password_hash: string,
  ): Promise<{ token: string }> => {
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
  getAll: (): Promise<User[]> => api.get("/users"),
  getMe: (): Promise<User> => api.get("/users/me"),
  create: (data: CreateUserDTO): Promise<{ id: string }> =>
    api.post("/users", data),
  update: (id: string | number, data: Partial<User>): Promise<void> =>
    api.put(`/users/${id}`, data),
  updateMe: (data: Partial<User>): Promise<void> => api.put("/users/me", data),
  delete: (id: string | number): Promise<void> => api.delete(`/users/${id}`),
};
