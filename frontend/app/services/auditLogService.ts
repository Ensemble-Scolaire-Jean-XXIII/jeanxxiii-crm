import { api } from "./api";
import { AuditLog, PaginatedResponse } from "../types";

export const auditLogService = {
  getLogs: (
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedResponse<AuditLog>> =>
    api.get(`/audit-logs?page=${page}&limit=${limit}`),
};
