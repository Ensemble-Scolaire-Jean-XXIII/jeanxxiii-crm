import { Router } from "express";
import {
  syncLexpressSubmissionsToDb,
  syncLatestLexpressSubmissionsToDb,
  getLastIncrementalSyncTime,
} from "../services/lexpressService";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/sync-latest", authenticate, async (req, res, next) => {
  try {
    const count = await syncLatestLexpressSubmissionsToDb();
    res.json({ message: "Synchronisation incrémentale réussie", count });
  } catch (error) {
    next(error);
  }
});

router.post("/sync-full", authenticate, async (req, res, next) => {
  try {
    const count = await syncLexpressSubmissionsToDb();
    res.json({ message: "Synchronisation complète réussie", count });
  } catch (error) {
    next(error);
  }
});

router.get("/last-sync", authenticate, async (req, res, next) => {
  try {
    res.json({ lastSync: getLastIncrementalSyncTime() });
  } catch (error) {
    next(error);
  }
});

export default router;
