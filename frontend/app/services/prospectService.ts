import { api } from "./api";

export const prospectService = {
  getAll: () => api.get("/prospects"),
  create: (data: unknown) => api.post("/prospects", data),
  update: (id: string | number, data: unknown) =>
    api.put(`/prospects/${id}`, data),
  delete: (id: string | number) => api.delete(`/prospects/${id}`),
  sendEmail: (id: string, template_id: string) =>
    api.post(`/prospects/${id}/send-email`, { template_id }),
};
