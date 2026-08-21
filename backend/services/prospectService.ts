import { pool } from "../config/db";
import { Prospect } from "../models/types";
import { v4 as uuidv4 } from "uuid";
import { sendMail } from "./mailService";
import { parseTemplateVariables } from "../utils/templateParser";
import { getEmailTemplateById } from "./emailTemplateService";
import { logAction } from "./auditLogService";

export const getAllProspects = async (): Promise<any> => {
  const [rows] = await pool.query(`
    SELECT p.*, s.name as status_name, c.name as country_name
    FROM prospects p
    LEFT JOIN statuses s ON p.status_id = s.id
    LEFT JOIN countries c ON p.country_id = c.id
  `);
  return rows as any;
};

export const getProspectById = async (id: string): Promise<Prospect | null> => {
  const [rows] = await pool.query("SELECT * FROM prospects WHERE id = ?", [id]);
  const prospects = rows as Prospect[];
  return prospects.length > 0 ? prospects[0] : null;
};

export const getProspectByEmail = async (
  email: string,
): Promise<Prospect | null> => {
  const [rows] = await pool.query("SELECT * FROM prospects WHERE email = ?", [
    email,
  ]);
  const prospects = rows as Prospect[];
  return prospects.length > 0 ? prospects[0] : null;
};

export const createProspect = async (
  data: Omit<Prospect, "id" | "created_at">,
  actorId?: string,
): Promise<string> => {
  const existing = await getProspectByEmail(data.email);
  if (existing) throw new Error("EMAIL_EXISTS");

  const id = uuidv4();
  await pool.query(
    `INSERT INTO prospects (id, email, first_name, last_name, phone, gender, country_id, status_id, formation_id, last_action_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.email,
      data.first_name,
      data.last_name,
      data.phone,
      data.gender,
      data.country_id,
      data.status_id,
      data.formation_id,
      new Date(),
    ],
  );

  if (actorId)
    await logAction(actorId, "CREATE", "PROSPECT", { id, email: data.email });
  return id;
};

export const updateProspect = async (
  id: string,
  data: Partial<Prospect>,
  actorId?: string,
): Promise<void> => {
  const allowedFields = [
    "email",
    "first_name",
    "last_name",
    "phone",
    "gender",
    "status_id",
    "country_id",
    "formation_id",
  ];

  const updateData: any = {};
  for (const key of Object.keys(data)) {
    if (allowedFields.includes(key)) {
      updateData[key] = (data as any)[key];
    }
  }

  if (Object.keys(updateData).length === 0) return;

  if (updateData.email) {
    const existing = await getProspectByEmail(updateData.email);
    if (existing && existing.id !== id) throw new Error("EMAIL_EXISTS");
  }

  if (updateData.status_id) {
    updateData.last_action_date = new Date();
  }

  const fields = Object.keys(updateData)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updateData), id];

  await pool.query(`UPDATE prospects SET ${fields} WHERE id = ?`, values);

  if (actorId)
    await logAction(actorId, "UPDATE", "PROSPECT", {
      target_id: id,
      changes: updateData,
    });
};

export const deleteProspect = async (
  id: string,
  actorId?: string,
): Promise<void> => {
  await pool.query("DELETE FROM prospects WHERE id = ?", [id]);
  if (actorId)
    await logAction(actorId, "DELETE", "PROSPECT", { target_id: id });
};

export const sendEmailToProspect = async (
  prospectId: string,
  templateId: string,
) => {
  const prospect = await getProspectById(prospectId);
  const template = await getEmailTemplateById(templateId);

  if (!prospect || !template) {
    throw new Error("Prospect ou template introuvable");
  }

  const finalBody = parseTemplateVariables(template.body, prospect);
  const finalSubject = parseTemplateVariables(template.subject, prospect);

  await sendMail(prospect.email, finalSubject, finalBody);
  await pool.query(
    "UPDATE prospects SET last_action_date = NOW() WHERE id = ?",
    [prospectId],
  );
};
