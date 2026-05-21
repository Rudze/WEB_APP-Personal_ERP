import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function slugify(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

const ROLE_HIERARCHY = { viewer: 0, editor: 1, admin: 2 };

export function hasRole(userRole, minRole) {
  return (ROLE_HIERARCHY[userRole] ?? -1) >= (ROLE_HIERARCHY[minRole] ?? 99);
}

export const ROLE_LABELS = {
  admin: "Administrateur",
  editor: "Éditeur",
  viewer: "Lecteur",
};

export const STATUS_LABELS = {
  en_cours: "En cours",
  termine: "Terminé",
  archive: "Archivé",
};

export const STATUS_COLORS = {
  en_cours: "bg-blue-500/20 text-blue-300",
  termine: "bg-green-500/20 text-green-300",
  archive: "bg-gray-500/20 text-gray-400",
};
