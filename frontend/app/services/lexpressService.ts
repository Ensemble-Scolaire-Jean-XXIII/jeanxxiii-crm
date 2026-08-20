import { api } from "./api";

export const lexpressService = {
  syncLatest: (): Promise<unknown> => api.post("/lexpress/sync-latest", {}),
  syncFull: (): Promise<unknown> => api.post("/lexpress/sync-full", {}),
  getLastSync: (): Promise<{ lastSync?: string }> =>
    api.get("/lexpress/last-sync"),
};
