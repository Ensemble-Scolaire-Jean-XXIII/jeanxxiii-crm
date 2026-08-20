import { api } from "./api";
import { Status, CreateStatusDTO } from "../types";

export const statusService = {
  getAll: (): Promise<Status[]> => api.get("/statuses"),
  create: (data: CreateStatusDTO): Promise<{ id: number }> =>
    api.post("/statuses", data),
  update: (id: string | number, data: Partial<Status>): Promise<void> =>
    api.put(`/statuses/${id}`, data),
  delete: (id: string | number): Promise<void> => api.delete(`/statuses/${id}`),
};
