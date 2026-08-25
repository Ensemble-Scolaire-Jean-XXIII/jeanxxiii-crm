import express from "express";
import { Request, Response, NextFunction } from "express";
import cors from "cors";
import cron from "node-cron";
import prospectRoutes from "./routes/prospectRoutes";
import userRoutes from "./routes/userRoutes";
import statusRoutes from "./routes/statusRoutes";
import emailTemplateRoutes from "./routes/emailTemplateRoutes";
import countryRoutes from "./routes/countryRoutes";
import automationRoutes from "./routes/automationRoutes";
import lexpressRoutes from "./routes/lexpressRoutes";
import formationRoutes from "./routes/formationRoutes";
import auditLogRoutes from "./routes/auditLogRoutes";
import webhookRoutes from "./routes/webhookRoutes";

import { authenticate } from "./middleware/auth";
import { processAutomations } from "./services/automationService";
import { syncLatestLexpressSubmissionsToDb } from "./services/lexpressService";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/prospects", authenticate, prospectRoutes);
app.use("/api/statuses", authenticate, statusRoutes);
app.use("/api/email-templates", authenticate, emailTemplateRoutes);
app.use("/api/countries", authenticate, countryRoutes);
app.use("/api/automations", authenticate, automationRoutes);
app.use("/api/lexpress", authenticate, lexpressRoutes);
app.use("/api/formations", authenticate, formationRoutes);
app.use("/api/audit-logs", authenticate, auditLogRoutes);
app.use("/webhooks", webhookRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res
    .status(500)
    .json({ error: "Internal Server Error", details: err.message });
});

cron.schedule("*/2 * * * *", async () => {
  console.log("CRON : Lancement du traitement des automatisations...");
  try {
    await processAutomations();
    console.log("CRON : Traitement réussie.");
  } catch (error) {
    console.error("CRON : Échec du traitement", error);
  }
});

cron.schedule("*/15 * * * *", async () => {
  console.log(
    "CRON : Lancement de la synchronisation incrémentale L'Express...",
  );
  try {
    await syncLatestLexpressSubmissionsToDb();
    console.log("CRON : Synchronisation réussie.");
  } catch (error) {
    console.error("CRON : Échec de la synchronisation", error);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
