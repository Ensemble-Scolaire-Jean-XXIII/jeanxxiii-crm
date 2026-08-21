import { Router } from "express";
import * as emailTemplateService from "../services/emailTemplateService";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const templates = await emailTemplateService.getAllEmailTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const template = await emailTemplateService.getEmailTemplateById(
      req.params.id as string,
    );
    if (!template) return res.status(404).json({ error: "Not found" });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, async (req: any, res) => {
  try {
    const id = await emailTemplateService.createEmailTemplate(
      req.body,
      req.user.id,
    );
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", authenticate, async (req: any, res) => {
  try {
    await emailTemplateService.updateEmailTemplate(
      req.params.id as string,
      req.body,
      req.user.id,
    );
    res.status(204).send();
  } catch (error) {
    console.error("ERREUR UPDATE TEMPLATE:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await emailTemplateService.deleteEmailTemplate(
      req.params.id as string,
      req.user.id,
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
