import { Router } from "express";
import {
  listPortfolios, getPortfolio, createPortfolio, updatePortfolio, deletePortfolio,
  addEntry, updateEntry, deleteEntry,
} from "../controllers/portfolio.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin, isEditor, isViewer } from "../middlewares/role.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", isViewer, listPortfolios);
router.post("/", isAdmin, createPortfolio);
router.get("/:slug", isViewer, getPortfolio);
router.put("/:id", isAdmin, updatePortfolio);
router.delete("/:id", isAdmin, deletePortfolio);
router.post("/:id/entries", isEditor, addEntry);

router.put("/entries/:id", isEditor, updateEntry);
router.delete("/entries/:id", isEditor, deleteEntry);

export default router;
