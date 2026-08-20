import { api } from "./api";
import { Formation, CreateFormationDTO } from "../types";

export const formationService = {
  getAll: (): Promise<Formation[]> => api.get("/formations"),
  create: (data: CreateFormationDTO): Promise<{ id: number }> =>
    api.post("/formations", data),
  update: (id: string | number, data: Partial<Formation>): Promise<void> =>
    api.put(`/formations/${id}`, data),
  delete: (id: string | number): Promise<void> =>
    api.delete(`/formations/${id}`),
};
