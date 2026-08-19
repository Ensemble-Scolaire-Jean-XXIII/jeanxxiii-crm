import { Router } from "express";
import * as emailTemplateService from "../services/emailTemplateService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const templates = await emailTemplateService.getAllEmailTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const template = await emailTemplateService.getEmailTemplateById(
      req.params.id,
    );
    if (!template) return res.status(404).json({ error: "Not found" });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const id = await emailTemplateService.createEmailTemplate(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    await emailTemplateService.updateEmailTemplate(req.params.id, req.body);
    res.status(204).send();
  } catch (error) {
    console.error("ERREUR UPDATE TEMPLATE:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await emailTemplateService.deleteEmailTemplate(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
