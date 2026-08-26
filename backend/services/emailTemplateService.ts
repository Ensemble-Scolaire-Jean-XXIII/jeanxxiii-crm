import { pool } from "../config/db";
import { EmailTemplate } from "../models/types";
import { v4 as uuidv4 } from "uuid";
import { logAction } from "./auditLogService";

export const getAllEmailTemplates = async (): Promise<EmailTemplate[]> => {
  const [rows] = await pool.query(
    "SELECT * FROM email_templates ORDER BY created_at DESC",
  );
  return rows as EmailTemplate[];
};

export const getEmailTemplateById = async (
  id: string,
): Promise<EmailTemplate | null> => {
  const [rows] = await pool.query(
    "SELECT * FROM email_templates WHERE id = ?",
    [id],
  );
  const templates = rows as EmailTemplate[];
  return templates.length > 0 ? templates[0] : null;
};

export const createEmailTemplate = async (
  data: Omit<EmailTemplate, "id" | "created_at">,
  actorId?: string,
): Promise<string> => {
  const [existing] = (await pool.query(
    "SELECT 1 FROM email_templates WHERE name = ? LIMIT 1",
    [data.name.trim()],
  )) as any[];

  if (existing.length > 0) {
    throw new Error("DUPLICATE_NAME");
  }

  const id = uuidv4();
  await pool.query(
    "INSERT INTO email_templates (id, name, subject, body) VALUES (?, ?, ?, ?)",
    [id, data.name.trim(), data.subject, data.body],
  );
  if (actorId)
    await logAction(actorId, "CREATE", "TEMPLATE", { id, name: data.name });
  return id;
};

export const updateEmailTemplate = async (
  id: string,
  data: Partial<EmailTemplate>,
  actorId?: string,
): Promise<void> => {
  const updateData = { ...data };
  delete updateData.created_at;
  delete updateData.id;

  if (Object.keys(updateData).length === 0) return;

  if (updateData.name) {
    const [existing] = (await pool.query(
      "SELECT 1 FROM email_templates WHERE name = ? AND id != ? LIMIT 1",
      [updateData.name.trim(), id],
    )) as any[];

    if (existing.length > 0) {
      throw new Error("DUPLICATE_NAME");
    }
    updateData.name = updateData.name.trim();
  }

  const fields = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(", ");

  const values = [...Object.values(updateData), id];
  await pool.query(`UPDATE email_templates SET ${fields} WHERE id = ?`, values);

  if (actorId)
    await logAction(actorId, "UPDATE", "TEMPLATE", {
      target_id: id,
      changes: updateData,
    });
};

export const deleteEmailTemplate = async (
  id: string,
  actorId?: string,
): Promise<void> => {
  const [automations] = (await pool.query(
    "SELECT 1 FROM email_automation_rules WHERE email_template_id = ? LIMIT 1",
    [id],
  )) as any[];

  if (automations.length > 0) {
    throw new Error(
      "Impossible de supprimer : ce template est actuellement programmé dans une automatisation active.",
    );
  }

  await pool.query("DELETE FROM email_templates WHERE id = ?", [id]);
  if (actorId)
    await logAction(actorId, "DELETE", "TEMPLATE", { target_id: id });
};
