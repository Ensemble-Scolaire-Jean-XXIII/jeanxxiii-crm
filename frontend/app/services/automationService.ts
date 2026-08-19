import { api } from "./api";

export const automationService = {
  getAll: () => api.get("/automations"),
  create: (data: unknown) => api.post("/automations", data),
  update: (id: string | number, data: unknown) =>
    api.put(`/automations/${id}`, data),
  delete: (id: string | number) => api.delete(`/automations/${id}`),
};
