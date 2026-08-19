import { Router } from "express";
import * as statusService from "../services/statusService";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const statuses = await statusService.getAllStatuses();
    res.json(statuses);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const status = await statusService.getStatusById(Number(req.params.id));
    if (!status) return res.status(404).json({ error: "Not found" });
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const id = await statusService.createStatus(req.body);
    res.status(201).json({ id });
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Un statut avec ce nom existe déjà" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    await statusService.updateStatus(Number(req.params.id), req.body);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "Un statut avec ce nom existe déjà" });
    }
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const status = await statusService.getStatusById(id);

    if (!status) {
      return res.status(404).json({ error: "Not found" });
    }

    if (!status.is_custom) {
      return res
        .status(403)
        .json({ error: "Vous ne pouvez pas supprimer un statut système" });
    }

    await statusService.deleteStatus(id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message && error.message.includes("Impossible de supprimer")) {
      return res.status(400).json({ error: error.message });
    }

    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.code === "ER_ROW_IS_REFERENCED"
    ) {
      return res.status(400).json({
        error:
          "Impossible de supprimer ce statut car il est attribué à un ou plusieurs prospects",
      });
    }
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
