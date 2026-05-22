import { Router } from "express";
import {
  listPages, getPage, createPage, updatePage, deletePage,
  getVersions, getVersion, searchPages,
} from "../controllers/wiki.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.middleware.js";
import { isAdmin, isEditor } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/search", optionalAuthenticate, searchPages);
router.get("/", optionalAuthenticate, listPages);
router.post("/", authenticate, isEditor, createPage);
router.get("/:slug", optionalAuthenticate, getPage);
router.put("/:id", authenticate, isEditor, updatePage);
router.delete("/:id", authenticate, isAdmin, deletePage);
router.get("/:id/versions", authenticate, isEditor, getVersions);
router.get("/:id/versions/:versionId", authenticate, isEditor, getVersion);

export default router;
