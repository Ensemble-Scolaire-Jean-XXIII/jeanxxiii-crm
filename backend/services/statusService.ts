import { pool } from "../config/db";
import { Status } from "../models/types";
import { logAction } from "./auditLogService";

export const getAllStatuses = async (): Promise<Status[]> => {
  const [rows] = await pool.query("SELECT * FROM statuses");
  return rows as Status[];
};

export const getStatusById = async (id: number): Promise<Status | null> => {
  const [rows] = await pool.query("SELECT * FROM statuses WHERE id = ?", [id]);
  return (rows as Status[])[0] || null;
};

export const createStatus = async (
  data: Omit<Status, "id">,
  actorId?: string,
): Promise<number> => {
  const [result] = await pool.query(
    "INSERT INTO statuses (name, is_custom) VALUES (?, ?)",
    [data.name, data.is_custom],
  );
  const insertId = (result as any).insertId;

  if (actorId)
    await logAction(actorId, "CREATE", "STATUS", {
      id: insertId,
      name: data.name,
    });
  return insertId;
};

export const updateStatus = async (
  id: number,
  data: Partial<Status>,
  actorId?: string,
): Promise<void> => {
  const allowedFields = ["name", "is_custom"];
  const updateData: Record<string, any> = {};

  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) {
      updateData[key] = (data as any)[key];
    }
  }

  if (Object.keys(updateData).length === 0) return;

  const fields = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updateData), id];

  await pool.query(`UPDATE statuses SET ${fields} WHERE id = ?`, values);

  if (actorId)
    await logAction(actorId, "UPDATE", "STATUS", {
      target_id: id,
      changes: updateData,
    });
};

export const deleteStatus = async (id: number, actorId?: string) => {
  const [prospects] = (await pool.query(
    "SELECT 1 FROM prospects WHERE status_id = ? LIMIT 1",
    [id],
  )) as any[];

  if (prospects.length > 0) {
    throw new Error(
      "Impossible de supprimer : ce statut est actuellement utilisé par des prospects.",
    );
  }

  const [automations] = (await pool.query(
    "SELECT 1 FROM email_automation_rules WHERE status_id = ? LIMIT 1",
    [id],
  )) as any[];

  if (automations.length > 0) {
    throw new Error(
      "Impossible de supprimer : ce statut est utilisé comme déclencheur dans une automatisation d'email.",
    );
  }

  await pool.query("DELETE FROM statuses WHERE id = ?", [id]);
  if (actorId) await logAction(actorId, "DELETE", "STATUS", { target_id: id });
};
