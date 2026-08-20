import { api } from "./api";
import { EmailAutomationRule, CreateAutomationDTO } from "../types";

export const automationService = {
  getAll: (): Promise<EmailAutomationRule[]> => api.get("/automations"),
  create: (data: CreateAutomationDTO): Promise<{ id: number }> =>
    api.post("/automations", data),
  update: (
    id: string | number,
    data: Partial<EmailAutomationRule>,
  ): Promise<void> => api.put(`/automations/${id}`, data),
  delete: (id: string | number): Promise<void> =>
    api.delete(`/automations/${id}`),
};
