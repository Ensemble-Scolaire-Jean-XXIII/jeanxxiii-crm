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
  const trimmedName = name.trim();
  const [existing] = (await pool.query(
    "SELECT 1 FROM formations WHERE name = ? LIMIT 1",
    [trimmedName],
  )) as any[];

  if (existing.length > 0) {
    throw new Error("DUPLICATE_NAME");
  }

  const [result] = await pool.query(
    "INSERT INTO formations (name) VALUES (?)",
    [trimmedName],
  );
  const insertId = (result as any).insertId;
  if (actorId)
    await logAction(actorId, "CREATE", "FORMATION", {
      id: insertId,
      name: trimmedName,
    });
  return insertId;
};

export const updateFormation = async (
  id: number,
  name: string,
  actorId?: string,
): Promise<void> => {
  const trimmedName = name.trim();
  const [existing] = (await pool.query(
    "SELECT 1 FROM formations WHERE name = ? AND id != ? LIMIT 1",
    [trimmedName, id],
  )) as any[];

  if (existing.length > 0) {
    throw new Error("DUPLICATE_NAME");
  }

  await pool.query("UPDATE formations SET name = ? WHERE id = ?", [
    trimmedName,
    id,
  ]);
  if (actorId)
    await logAction(actorId, "UPDATE", "FORMATION", {
      target_id: id,
      changes: { name: trimmedName },
    });
};

export const deleteFormation = async (
  id: number,
  actorId?: string,
): Promise<void> => {
  const [rows] = (await pool.query(
    "SELECT 1 FROM prospects WHERE formation_id = ? LIMIT 1",
    [id],
  )) as any[];

  if (rows.length > 0) {
    throw new Error(
      "Impossible de supprimer : cette formation est rattachée à des prospects.",
    );
  }

  const [automations] = (await pool.query(
    "SELECT 1 FROM email_automation_rules WHERE formation_id = ? LIMIT 1",
    [id],
  )) as any[];

  if (automations.length > 0) {
    throw new Error(
      "Impossible de supprimer : cette formation est utilisée comme filtre dans une automatisation d'email.",
    );
  }

  await pool.query("DELETE FROM formations WHERE id = ?", [id]);
  if (actorId)
    await logAction(actorId, "DELETE", "FORMATION", { target_id: id });
};
