import { Router } from "express";
import {
  listPages, getPage, createPage, updatePage, deletePage,
  getVersions, getVersion, searchPages,
} from "../controllers/wiki.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { isAdmin, isEditor, isViewer } from "../middlewares/role.middleware.js";

const router = Router();
router.use(authenticate);

router.get("/search", isViewer, searchPages);
router.get("/", isViewer, listPages);
router.post("/", isEditor, createPage);
router.get("/:slug", isViewer, getPage);
router.put("/:id", isEditor, updatePage);
router.delete("/:id", isAdmin, deletePage);
router.get("/:id/versions", isEditor, getVersions);
router.get("/:id/versions/:versionId", isEditor, getVersion);

export default router;
