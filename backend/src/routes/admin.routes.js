import { Router } from "express";
import { getSettings, updateSettings, getLanding, updateLanding } from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authenticate, isAdmin);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);
router.get("/landing", getLanding);
router.put("/landing", updateLanding);

export default router;
