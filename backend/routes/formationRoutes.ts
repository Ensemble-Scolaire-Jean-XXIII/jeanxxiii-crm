import { Router } from "express";
import * as formationService from "../services/formationService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const countries = await formationService.getAllFormations();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
