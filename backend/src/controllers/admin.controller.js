import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/errors.js";
import { z } from "zod";

const settingsSchema = z.object({
  appName: z.string().min(1).optional(),
  logoUrl: z.string().nullable().optional(),
  defaultTheme: z.enum(["dark", "light"]).optional(),
  primaryColor: z.string().optional(),
  language: z.string().optional(),
  modules: z.record(z.boolean()).nullable().optional(),
  publicModules: z.record(z.boolean()).nullable().optional(),
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
