import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { z } from "zod";

const landingSchema = z.object({
  content: z.string().optional(),
});

const settingsSchema = z.object({
  appName: z.string().min(1).optional(),
  logoUrl: z.string().nullable().optional(),
  defaultTheme: z.enum(["dark", "light"]).optional(),
  primaryColor: z.string().optional(),
  language: z.string().optional(),
  modules: z.preprocess((v) => v ?? undefined, z.record(z.boolean()).optional()),
  publicModules: z.preprocess((v) => v ?? undefined, z.record(z.boolean()).optional()),
  navLayout: z.enum(["vertical", "horizontal"]).optional(),
  publicNavLayout: z.enum(["vertical", "horizontal"]).optional(),
  navOrder: z.preprocess((v) => v ?? undefined, z.array(z.string()).optional()),
  customNavLinks: z.preprocess((v) => v ?? undefined, z.array(z.object({ label: z.string(), url: z.string() })).optional()),
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
  const { appName, logoUrl, defaultTheme, primaryColor, language, modules, publicModules, navLayout, publicNavLayout, navOrder, customNavLinks } = settingsSchema.parse(req.body);
  const data = { appName, logoUrl, defaultTheme, primaryColor, language, modules, publicModules, navLayout, publicNavLayout, navOrder, customNavLinks };
  const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
  const settings = await prisma.appSettings.upsert({
    where: { id: "singleton" },
    update: clean,
    create: { id: "singleton", ...clean },
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
