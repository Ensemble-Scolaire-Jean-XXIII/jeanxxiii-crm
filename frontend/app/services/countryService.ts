import { api } from "./api";
import { Country } from "../types";

export const countryService = {
  getAll: (): Promise<Country[]> => api.get("/countries"),
};
