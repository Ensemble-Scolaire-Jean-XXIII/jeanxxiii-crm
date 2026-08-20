import { pool } from "../config/db";
import { Formation } from "../models/types";

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

export const createFormation = async (name: string): Promise<number> => {
  const [result] = await pool.query(
    "INSERT INTO formations (name) VALUES (?)",
    [name.trim()],
  );
  return (result as any).insertId;
};

export const updateFormation = async (
  id: number,
  name: string,
): Promise<void> => {
  await pool.query("UPDATE formations SET name = ? WHERE id = ?", [
    name.trim(),
    id,
  ]);
};

export const deleteFormation = async (id: number): Promise<void> => {
  await pool.query("DELETE FROM formations WHERE id = ?", [id]);
};
