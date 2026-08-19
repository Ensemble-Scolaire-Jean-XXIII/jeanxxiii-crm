import { api } from "./api";

export const countryService = {
  getAll: () => api.get("/countries"),
};
