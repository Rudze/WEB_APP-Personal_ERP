import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate, isAdmin);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

export default router;
