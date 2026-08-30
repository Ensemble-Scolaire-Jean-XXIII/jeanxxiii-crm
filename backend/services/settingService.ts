import { pool } from "../config/db";
import { Setting } from "../models/types";
import { logAction } from "./auditLogService";

export const getSetting = async (key: string): Promise<string | null> => {
  const [rows] = await pool.query(
    "SELECT setting_value FROM settings WHERE setting_key = ?",
    [key],
  );
  const settings = rows as Setting[];
  return settings.length > 0 ? settings[0].setting_value : null;
};

export const updateSetting = async (
  key: string,
  value: string,
  actorId: string,
): Promise<void> => {
  await pool.query(
    "INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?",
    [key, value, value],
  );
  await logAction(actorId, "UPDATE", "SETTING", { key, value });
};
