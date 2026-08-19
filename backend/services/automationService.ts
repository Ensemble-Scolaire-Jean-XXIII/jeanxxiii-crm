import { pool } from "../config/db";
import { sendMail } from "./mailService";
import { parseTemplateVariables } from "../utils/templateParser";

export const getAutomationRules = async () => {
  const [rows] = await pool.query("SELECT * FROM email_automation_rules");
  return rows;
};

export const createAutomationRule = async (data: any) => {
  const [result] = await pool.query(
    "INSERT INTO email_automation_rules (status_id, formation_id, email_template_id, trigger_type, scheduled_date) VALUES (?, ?, ?, ?, ?)",
    [
      data.status_id || null,
      data.formation_id || null,
      data.email_template_id,
      data.trigger_type || "STATUS_CHANGE",
      data.scheduled_date || null,
    ],
  );
  return (result as any).insertId;
};

export const deleteAutomationRule = async (id: number) => {
  await pool.query("DELETE FROM email_automation_rules WHERE id = ?", [id]);
};

export const processAutomations = async () => {
  try {
    const [rules] = (await pool.query(
      "SELECT * FROM email_automation_rules WHERE trigger_type = 'STATUS_CHANGE' OR (trigger_type = 'SCHEDULED_DATE' AND scheduled_date <= NOW())",
    )) as any[];

    for (const rule of rules) {
      const query = `
        SELECT 
          p.id, p.email, p.first_name, p.last_name, p.gender, 
          f.name AS formation, 
          f.name AS programme, 
          p.phone, 
          t.subject as template_subject, t.body as template_body, t.id as template_id
        FROM prospects p
        LEFT JOIN formations f ON p.formation_id = f.id
        JOIN email_templates t ON t.id = ?
        WHERE (p.status_id = ? OR ? IS NULL)
        AND (p.formation_id = ? OR ? IS NULL)
        AND NOT EXISTS (
          SELECT 1 FROM email_automation_logs log 
          WHERE log.prospect_id = p.id AND log.rule_id = ?
        )
      `;

      const [prospects] = (await pool.query(query, [
        rule.email_template_id,
        rule.status_id,
        rule.status_id,
        rule.formation_id,
        rule.formation_id,
        rule.id,
      ])) as any[];

      for (const prospect of prospects) {
        try {
          const finalBody = parseTemplateVariables(
            prospect.template_body,
            prospect,
          );
          const finalSubject = parseTemplateVariables(
            prospect.template_subject,
            prospect,
          );

          await sendMail(prospect.email, finalSubject, finalBody);

          await pool.query(
            "INSERT INTO email_automation_logs (prospect_id, rule_id) VALUES (?, ?)",
            [prospect.id, rule.id],
          );

          await pool.query(
            "UPDATE prospects SET last_action_date = NOW() WHERE id = ?",
            [prospect.id],
          );
        } catch (error) {
          console.error(error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};
