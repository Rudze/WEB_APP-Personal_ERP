import { Router } from "express";
import {
  listPortfolios, getPortfolio, createPortfolio, updatePortfolio, deletePortfolio,
} from "../controllers/portfolio.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { isAdmin, isEditor } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", optionalAuthenticate, listPortfolios);
router.post("/", authenticate, isEditor, createPortfolio);
router.get("/:slug", optionalAuthenticate, getPortfolio);
router.put("/:id", authenticate, isEditor, updatePortfolio);
router.delete("/:id", authenticate, isAdmin, deletePortfolio);

export default router;
