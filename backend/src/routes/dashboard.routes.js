import { Router } from "express";
import {
  listDashboards, getDashboard, createDashboard,
  updateDashboard, deleteDashboard, updateLayout,
  addWidget, updateWidget, deleteWidget,
} from "../controllers/dashboard.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin, isEditor, isViewer } from "../middlewares/role.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/", isViewer, listDashboards);
router.post("/", isAdmin, createDashboard);
router.get("/:slug", isViewer, getDashboard);
router.put("/:id", isAdmin, updateDashboard);
router.delete("/:id", isAdmin, deleteDashboard);
router.put("/:id/layout", isEditor, updateLayout);
router.post("/:id/widgets", isEditor, addWidget);

router.put("/widgets/:id", isEditor, updateWidget);
router.delete("/widgets/:id", isEditor, deleteWidget);

export default router;
