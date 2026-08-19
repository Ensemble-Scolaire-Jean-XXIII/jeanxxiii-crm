import { api } from "./api";
import { Formation } from "../types";

export const formationService = {
  getAll: (): Promise<Formation[]> => api.get("/formations"),
};
