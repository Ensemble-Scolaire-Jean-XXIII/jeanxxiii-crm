import { pool } from "../config/db";
import { AuditLog } from "../models/types";

export const logAction = async (
  userId: string,
  action: string,
  resource: string,
  details: Record<string, unknown> | null = null,
): Promise<void> => {
  await pool.query(
    "INSERT INTO audit_logs (user_id, action, resource, details) VALUES (?, ?, ?, ?)",
    [userId, action, resource, details ? JSON.stringify(details) : null],
  );
};

export const getLogs = async (
  page: number = 1,
  limit: number = 20,
): Promise<{
  data: AuditLog[];
  total: number;
  page: number;
  totalPages: number;
}> => {
  const offset = (page - 1) * limit;

  const [countRows] = await pool.query(
    "SELECT COUNT(*) as total FROM audit_logs",
  );
  const total = (countRows as any[])[0].total;

  const [rows] = await pool.query(
    `SELECT a.*, u.email as user_email, CONCAT(u.first_name, ' ', u.last_name) as user_name 
     FROM audit_logs a 
     LEFT JOIN users u ON a.user_id = u.id 
     ORDER BY a.created_at DESC 
     LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)],
  );

  return {
    data: rows as AuditLog[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};
