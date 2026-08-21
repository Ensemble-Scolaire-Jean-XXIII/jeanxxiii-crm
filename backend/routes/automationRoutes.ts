import { Router } from "express";
import * as automationService from "../services/automationService";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const rules = await automationService.getAutomationRules();
    res.json(rules);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, async (req: any, res) => {
  try {
    const id = await automationService.createAutomationRule(
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
    await automationService.updateAutomationRule(
      Number(req.params.id),
      req.body,
      req.user.id,
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await automationService.deleteAutomationRule(
      Number(req.params.id),
      req.user.id,
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
