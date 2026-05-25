import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { z } from "zod";

const landingSchema = z.object({
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  heroDescription: z.string().optional(),
  sections: z.string().optional(),
});

const settingsSchema = z.object({
  appName: z.string().min(1).optional(),
  logoUrl: z.string().nullable().optional(),
  defaultTheme: z.enum(["dark", "light"]).optional(),
  primaryColor: z.string().optional(),
  language: z.string().optional(),
  modules: z.preprocess((v) => v ?? undefined, z.record(z.boolean()).optional()),
  publicModules: z.preprocess((v) => v ?? undefined, z.record(z.boolean()).optional()),
});

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  res.json(settings);
});

export const updateSettings = asyncHandler(async (req, res) => {
  const data = settingsSchema.parse(req.body);
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  res.json(settings);
});

export const getLanding = asyncHandler(async (_req, res) => {
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  res.json(settings.landingContent || {});
});

export const updateLanding = asyncHandler(async (req, res) => {
  const data = landingSchema.parse(req.body);
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: { landingContent: data },
    create: { id: "singleton", landingContent: data },
  });
  res.json(settings.landingContent);
});
