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

  const [wikiCount, portfolioCount, cvProfile] = await Promise.all([
    prisma.wikiPage.count({ where: { visibility: "public" } }),
    prisma.portfolio.count({ where: { visibility: "public" } }),
    prisma.cVProfile.findUnique({ where: { id: "singleton" }, select: { visibility: true } }),
  ]);

  res.json({
    appName: settings.appName,
    publicModules: {
      wiki: wikiCount > 0,
      portfolio: portfolioCount > 0,
      cv: cvProfile?.visibility === "public",
    },
  });
}));

export default router;
