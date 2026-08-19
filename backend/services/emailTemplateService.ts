import { pool } from "../config/db";
import { EmailTemplate } from "../models/types";
import { v4 as uuidv4 } from "uuid";

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
): Promise<string> => {
  const id = uuidv4();
  await pool.query(
    "INSERT INTO email_templates (id, name, subject, body) VALUES (?, ?, ?, ?)",
    [id, data.name, data.subject, data.body],
  );
  return id;
};

export const updateEmailTemplate = async (
  id: string,
  data: Partial<EmailTemplate>,
): Promise<void> => {
  const updateData = { ...data };

  delete updateData.created_at;
  delete updateData.id;

  if (Object.keys(updateData).length === 0) return;

  const fields = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(", ");

  const values = [...Object.values(updateData), id];

  await pool.query(`UPDATE email_templates SET ${fields} WHERE id = ?`, values);
};

export const deleteEmailTemplate = async (id: string): Promise<void> => {
  await pool.query("DELETE FROM email_templates WHERE id = ?", [id]);
};
