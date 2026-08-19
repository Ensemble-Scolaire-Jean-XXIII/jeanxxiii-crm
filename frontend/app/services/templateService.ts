import { api } from "./api";

export const templateService = {
  getAll: () => api.get("/email-templates"),
  create: (data: unknown) => api.post("/email-templates", data),
  update: (id: string | number, data: unknown) =>
    api.put(`/email-templates/${id}`, data),
  delete: (id: string | number) => api.delete(`/email-templates/${id}`),
};
