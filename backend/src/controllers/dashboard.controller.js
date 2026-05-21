import { prisma } from "../lib/prisma.js";
import { asyncHandler, notFound, AppError } from "../utils/errors.js";
import { z } from "zod";

const HIERARCHY = { viewer: 0, editor: 1, admin: 2 };

function canAccess(dashboard, userRole) {
  const minRole = dashboard.roles.reduce((min, r) =>
    HIERARCHY[r] < HIERARCHY[min] ? r : min
  );
  return HIERARCHY[userRole] >= HIERARCHY[minRole];
}

const dashboardSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  layout: z.array(z.any()).default([]),
  roles: z.array(z.enum(["admin", "editor", "viewer"])).default(["admin"]),
});

const widgetSchema = z.object({
  type: z.enum(["bar", "line", "pie", "kpi", "table", "note"]),
  title: z.string().min(1),
  config: z.record(z.any()).default({}),
  position: z.record(z.any()).default({}),
});

export const listDashboards = asyncHandler(async (req, res) => {
  const all = await prisma.dashboard.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, slug: true, description: true, roles: true, createdAt: true },
  });
  const visible = all.filter((d) => canAccess(d, req.user.role));
  res.json(visible);
});

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await prisma.dashboard.findUnique({
    where: { slug: req.params.slug },
    include: { widgets: { orderBy: { createdAt: "asc" } } },
  });
  if (!dashboard) throw notFound("Dashboard");
  if (!canAccess(dashboard, req.user.role)) throw new AppError("Accès refusé", 403);
  res.json(dashboard);
});

export const createDashboard = asyncHandler(async (req, res) => {
  const data = dashboardSchema.parse(req.body);
  const exists = await prisma.dashboard.findUnique({ where: { slug: data.slug } });
  if (exists) throw new AppError("Slug déjà utilisé", 409);
  const dashboard = await prisma.dashboard.create({ data });
  res.status(201).json(dashboard);
});

export const updateDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const data = dashboardSchema.partial().parse(req.body);
  const exists = await prisma.dashboard.findUnique({ where: { id } });
  if (!exists) throw notFound("Dashboard");
  const updated = await prisma.dashboard.update({ where: { id }, data });
  res.json(updated);
});

export const deleteDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const exists = await prisma.dashboard.findUnique({ where: { id } });
  if (!exists) throw notFound("Dashboard");
  await prisma.dashboard.delete({ where: { id } });
  res.json({ ok: true });
});

export const updateLayout = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { layout } = z.object({ layout: z.array(z.any()) }).parse(req.body);
  const updated = await prisma.dashboard.update({ where: { id }, data: { layout } });
  res.json(updated);
});

export const addWidget = asyncHandler(async (req, res) => {
  const data = widgetSchema.parse(req.body);
  const dashboard = await prisma.dashboard.findUnique({ where: { id: req.params.id } });
  if (!dashboard) throw notFound("Dashboard");
  const widget = await prisma.widget.create({
    data: { ...data, dashboardId: req.params.id },
  });
  res.status(201).json(widget);
});

export const updateWidget = asyncHandler(async (req, res) => {
  const data = widgetSchema.partial().parse(req.body);
  const exists = await prisma.widget.findUnique({ where: { id: req.params.id } });
  if (!exists) throw notFound("Widget");
  const widget = await prisma.widget.update({ where: { id: req.params.id }, data });
  res.json(widget);
});

export const deleteWidget = asyncHandler(async (req, res) => {
  const exists = await prisma.widget.findUnique({ where: { id: req.params.id } });
  if (!exists) throw notFound("Widget");
  await prisma.widget.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});
