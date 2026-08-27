import { api } from "./api";
import { ProspectExtended, CreateProspectPayload } from "../types";

export const prospectService = {
  getAll: (): Promise<ProspectExtended[]> => api.get("/prospects"),
  create: (data: CreateProspectPayload): Promise<{ id: string }> =>
    api.post("/prospects", data),
  update: (
    id: string | number,
    data: Partial<ProspectExtended>,
  ): Promise<void> => api.put(`/prospects/${id}`, data),
  delete: (id: string | number): Promise<void> =>
    api.delete(`/prospects/${id}`),
  sendEmail: (id: string, template_id: string): Promise<void> =>
    api.post(`/prospects/${id}/send-email`, { template_id }),
};
