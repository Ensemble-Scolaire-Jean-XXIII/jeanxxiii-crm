import { api } from "./api";
import { UpdateSettingPayload } from "../types";

export const settingService = {
  get: (key: string): Promise<{ enabled: boolean }> =>
    api.get(`/settings/${key}`),
  update: (key: string, data: UpdateSettingPayload): Promise<void> =>
    api.put(`/settings/${key}`, data),
};
