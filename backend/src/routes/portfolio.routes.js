import { Router } from "express";
import {
  listPortfolios, getPortfolio, createPortfolio, updatePortfolio, deletePortfolio,
  addEntry, updateEntry, deleteEntry,
} from "../controllers/portfolio.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { isAdmin, isEditor } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", optionalAuthenticate, listPortfolios);
router.post("/", authenticate, isAdmin, createPortfolio);
router.get("/:slug", optionalAuthenticate, getPortfolio);
router.put("/:id", authenticate, isAdmin, updatePortfolio);
router.delete("/:id", authenticate, isAdmin, deletePortfolio);
router.post("/:id/entries", authenticate, isEditor, addEntry);
router.put("/entries/:id", authenticate, isEditor, updateEntry);
router.delete("/entries/:id", authenticate, isEditor, deleteEntry);

export default router;
