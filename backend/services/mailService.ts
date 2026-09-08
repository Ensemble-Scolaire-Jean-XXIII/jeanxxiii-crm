import { transporter } from "../config/mail";
import path from "path";

const generateHtmlEmail = (title: string, content: string) => {
  const formattedContent = content
    ? content.replace(/\r\n/g, "\n").replace(/\n/g, "<br>")
    : "";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; padding: 20px; background-color: #0f172a;">
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: 0 auto; background-color: #1e293b; padding: 30px; border-top: 4px solid #e84e1b; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);">
        <h2 style="color: #f8fafc; border-bottom: 2px solid #334155; padding-bottom: 10px; font-weight: 600; margin-top: 0;">${title}</h2>
        <div style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #cbd5e1;">
          ${formattedContent}
        </div>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #334155;">
          <img src="cid:signature" alt="Signature CRM Jean XXIII" style="width: 100%; height: auto; display: block;" />
        </div>
      </div>
    </body>
    </html>
  `;
};

export const sendMail = async (
  to: string,
  subject: string,
  text: string,
  htmlContent?: string,
): Promise<void> => {
  try {
    const finalHtml = generateHtmlEmail(subject, htmlContent || text);

    await transporter.sendMail({
      from: `"Ensemble Scolaire Jean 23 | NO REPLY " <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html: finalHtml,
      attachments: [
        {
          filename: "signature.png",
          path: path.join(process.cwd(), "public", "signature.png"),
          cid: "signature",
          contentDisposition: "inline",
        },
      ],
    });
  } catch (error) {
    throw new Error("Impossible d'envoyer l'email");
  }
};
