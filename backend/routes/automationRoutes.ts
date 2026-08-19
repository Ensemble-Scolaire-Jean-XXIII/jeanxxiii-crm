import { Router } from "express";
import * as automationService from "../services/automationService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const rules = await automationService.getAutomationRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const id = await automationService.createAutomationRule(req.body);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await automationService.deleteAutomationRule(Number(req.params.id));
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
