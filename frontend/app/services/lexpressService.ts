import { api } from "./api";

export const lexpressService = {
  syncLatest: () => api.post("/lexpress/sync-latest", {}),
  syncFull: () => api.post("/lexpress/sync-full", {}),
};
