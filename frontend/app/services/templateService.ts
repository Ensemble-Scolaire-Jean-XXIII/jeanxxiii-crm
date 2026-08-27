import { api } from "./api";
import { EmailTemplate, CreateTemplatePayload } from "../types";

export const templateService = {
  getAll: (): Promise<EmailTemplate[]> => api.get("/email-templates"),
  create: (data: CreateTemplatePayload): Promise<{ id: string }> =>
    api.post("/email-templates", data),
  update: (id: string | number, data: Partial<EmailTemplate>): Promise<void> =>
    api.put(`/email-templates/${id}`, data),
  delete: (id: string | number): Promise<void> =>
    api.delete(`/email-templates/${id}`),
};
