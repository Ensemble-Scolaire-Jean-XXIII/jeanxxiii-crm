import { api } from "./api";

export const statusService = {
  getAll: () => api.get("/statuses"),
  create: (data: unknown) => api.post("/statuses", data),
  update: (id: string | number, data: unknown) =>
    api.put(`/statuses/${id}`, data),
  delete: (id: string | number) => api.delete(`/statuses/${id}`),
};
