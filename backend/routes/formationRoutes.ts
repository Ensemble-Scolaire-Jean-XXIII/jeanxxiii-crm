import { Router } from "express";
import * as formationService from "../services/formationService";
import { authenticate } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const formations = await formationService.getAllFormations();
    res.json(formations);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", authenticate, async (req: any, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Le nom est requis" });
    const id = await formationService.createFormation(name, req.user.id);
    res.status(201).json({ id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Le nom est requis" });
    await formationService.updateFormation(
      Number(req.params.id),
      name,
      req.user.id,
    );
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await formationService.deleteFormation(Number(req.params.id), req.user.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === "IN_USE") {
      return res.status(400).json({
        error:
          "Impossible de supprimer cette formation : elle est actuellement attribuée à un ou plusieurs prospects.",
      });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
