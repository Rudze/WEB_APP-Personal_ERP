<h2 align="center">
  Personal ERP
</h2>

---

<div align="center">

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com) &nbsp;
[![forthebadge](https://forthebadge.com/images/badges/open-source.svg)](https://forthebadge.com) &nbsp;
[![forthebadge](https://forthebadge.com/images/badges/made-with-javascript.svg)](https://forthebadge.com) &nbsp;

</div>

---

## About the Project

**Personal ERP** est une application web personnelle tout-en-un, conçue pour centraliser wiki, portfolio, CV, dossier technique et dashboards dans une interface unique et épurée.

L'objectif principal est de disposer d'un **espace personnel complet**, accessible depuis n'importe quel navigateur, déployable en **un seul container Docker** sur un serveur local ou distant.

Le projet est conçu avec la **modularité en tête** : chaque module peut être activé, configuré et rendu public ou privé indépendamment.

> 🤖 Ce projet a été développé à **~90% avec [Claude](https://claude.ai) (Anthropic)** — architecture, code, debug et itérations — via [Claude Code](https://claude.ai/code).

---

## Features

* ✅ **Auth sécurisée** — JWT (access + refresh tokens), cookies httpOnly, RBAC (admin / editor / viewer)
* ✅ **Wiki Markdown** — arborescence, versioning, recherche plein texte, visibilité par page
* ✅ **Portfolio CV** — vitrine de projets avec mode CV (profil, compétences, timeline par catégorie)
* ✅ **Dossier technique (CV)** — formations, certifications avec dates, compétences par catégorie avec niveaux
* ✅ **Dashboards** — tableaux de bord avec widgets configurables
* ✅ **Accès public sélectif** — chaque contenu peut être rendu accessible aux visiteurs non connectés
* ✅ **Single container** — frontend (React) servi par Express, pas de nginx séparé
* ✅ **Admin panel** — gestion des utilisateurs, paramètres globaux, accès public

---

## Architecture

```
Client (navigateur)
    │
    │  HTTP  →  GET /  →  React App (servi par Express)
    ▼
Express (Node.js) :4000
    │
    ├── /              → React build (SPA fallback)
    ├── /api/auth      → JWT login / refresh / logout
    ├── /api/wiki      → Pages wiki (public ou authentifié)
    ├── /api/portfolio → Portfolios & entrées
    ├── /api/cv        → Profil CV & formations
    ├── /api/dashboards → Widgets & layouts
    └── /api/admin     → Paramètres & utilisateurs
    │
    ▼
Prisma ORM
    │
    ▼
MySQL 8+
```

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Frontend | React 18 · Vite · TailwindCSS · shadcn/ui |
| Backend | Node.js · Express |
| ORM | Prisma |
| Base de données | MySQL 8+ |
| Auth | JWT · bcrypt · httpOnly cookies |
| Déploiement | Docker (single container) |

---

## Installation

### 1 — Cloner le projet

```bash
git clone https://github.com/Rudze/WEB_APP-Personal_ERP.git
cd WEB_APP-Personal_ERP
```

### 2 — Configurer l'environnement

```bash
cp .env.docker .env
```

Éditez `.env` :

```env
DATABASE_URL="mysql://user:password@host:3306/erp"

JWT_ACCESS_SECRET="changez_moi_minimum_32_caracteres"
JWT_REFRESH_SECRET="changez_moi_minimum_32_caracteres"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

FRONTEND_URL="http://localhost:5173"
COOKIE_SECURE="false"
```

> **Mot de passe avec caractères spéciaux** dans l'URL MySQL : encodez-les (`@` → `%40`, `#` → `%23`).
> ```bash
> python3 -c "import urllib.parse; print(urllib.parse.quote('MON_MDP', safe=''))"
> ```

### 3 — Lancer

```bash
docker compose up -d --build
```

L'application est disponible sur **http://localhost:5173**

**Identifiants par défaut :** `admin@erp.local` / `Admin1234!`
> ⚠️ Changez le mot de passe dès la première connexion.

---

## Commandes utiles

```bash
# Logs en temps réel
docker compose logs -f

# Shell dans le container
docker compose exec app sh

# Reset complet (supprime la BDD)
docker compose down -v
```

---

## Project Structure

```
/
├── Dockerfile                → Build multi-stage (frontend + backend)
├── docker-compose.yml
├── frontend/                 → React 18 + Vite + TailwindCSS
│   └── src/
│       ├── components/       → UI & layout (sidebar, header…)
│       ├── pages/            → Wiki, Portfolio, CV, Dashboards, Admin
│       ├── context/          → Auth, Theme
│       └── lib/              → API client, utilitaires
└── backend/                  → Node.js + Express
    ├── src/
    │   ├── controllers/      → Logique métier
    │   ├── middlewares/      → Auth, rôles
    │   └── routes/           → Routers Express
    └── prisma/
        ├── schema.prisma
        └── seed.js
```

---

## Contact

If you have any questions, feel free to reach out at contact@rudydavid.fr

---

### Show Your Support

Give a ⭐ if you like this project!
