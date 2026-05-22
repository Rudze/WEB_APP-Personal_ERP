import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";

const router = Router();

router.get("/config", asyncHandler(async (_req, res) => {
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  res.json({
    appName: settings.appName,
    publicModules: settings.publicModules,
  });
}));

export default router;
