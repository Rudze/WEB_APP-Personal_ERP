import { forbidden } from "../utils/errors.js";

const HIERARCHY = { public: -1, viewer: 0, editor: 1, admin: 2 };

export function requireRole(minRole) {
  return (req, _res, next) => {
    const userLevel = HIERARCHY[req.user?.role] ?? -1;
    const required = HIERARCHY[minRole] ?? 99;
    if (userLevel >= required) return next();
    next(forbidden());
  };
}

export const isAdmin = requireRole("admin");
export const isEditor = requireRole("editor");
export const isViewer = requireRole("viewer");
