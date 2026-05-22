import { Router } from "express";
import { getCV, updateProfile, createFormation, updateFormation, deleteFormation } from "../controllers/cv.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { isEditor } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", optionalAuthenticate, getCV);
router.put("/profile", authenticate, isEditor, updateProfile);
router.post("/formations", authenticate, isEditor, createFormation);
router.put("/formations/:id", authenticate, isEditor, updateFormation);
router.delete("/formations/:id", authenticate, isEditor, deleteFormation);

export default router;
