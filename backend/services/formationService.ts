import { pool } from "../config/db";
import { Formation } from "../models/types";
import { logAction } from "./auditLogService";

export const getOrCreateFormationByName = async (
  name: string | null,
): Promise<number | null> => {
  if (!name || name.trim() === "") return null;
  const trimmedName = name.trim();

  const [rows] = await pool.query("SELECT id FROM formations WHERE name = ?", [
    trimmedName,
  ]);
  const formations = rows as Formation[];

  if (formations.length > 0) {
    return (formations[0].id as number) ?? null;
  }

  const [result] = await pool.query(
    "INSERT INTO formations (name) VALUES (?)",
    [trimmedName],
  );

  return (result as any).insertId;
};

export const getAllFormations = async (): Promise<Formation[]> => {
  const [rows] = await pool.query("SELECT * FROM formations ORDER BY name ASC");
  return rows as Formation[];
};

export const createFormation = async (
  name: string,
  actorId?: string,
): Promise<number> => {
  const [result] = await pool.query(
    "INSERT INTO formations (name) VALUES (?)",
    [name.trim()],
  );
  const insertId = (result as any).insertId;
  if (actorId)
    await logAction(actorId, "CREATE", "FORMATION", { id: insertId, name });
  return insertId;
};

export const updateFormation = async (
  id: number,
  name: string,
  actorId?: string,
): Promise<void> => {
  await pool.query("UPDATE formations SET name = ? WHERE id = ?", [
    name.trim(),
    id,
  ]);
  if (actorId)
    await logAction(actorId, "UPDATE", "FORMATION", {
      target_id: id,
      changes: { name },
    });
};

export const deleteFormation = async (
  id: number,
  actorId?: string,
): Promise<void> => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM prospects WHERE formation_id = ?",
    [id],
  );
  if ((rows as any[])[0].count > 0) {
    throw new Error("IN_USE");
  }
  await pool.query("DELETE FROM formations WHERE id = ?", [id]);
  if (actorId)
    await logAction(actorId, "DELETE", "FORMATION", { target_id: id });
};
