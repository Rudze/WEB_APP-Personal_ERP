# Personal ERP — Web Application

A full-stack personal ERP built with React + Node.js + MySQL (ou PostgreSQL).

## Modules

- **Auth** — JWT (access + refresh tokens), httpOnly cookies, RBAC
- **Admin** — User management, module config, global settings
- **Dashboards** — Dynamic widget-based dashboards with drag & drop
- **Wiki** — Markdown wiki with versioning, full-text search, tree navigation
- **Portfolio** — Project/work showcase with CRUD and public view

## Stack

| Layer    | Technology                                        |
|----------|---------------------------------------------------|
| Frontend | React 18 + Vite + TailwindCSS + shadcn/ui         |
| Backend  | Node.js + Express                                 |
| ORM      | Prisma                                            |
| Database | **MySQL 8+** (par défaut) ou PostgreSQL 14+       |
| Auth     | JWT + bcrypt + httpOnly cookies                   |

---

## Base de données — MySQL vs PostgreSQL

Le schéma est configuré pour **MySQL** par défaut (`provider = "mysql"` dans `schema.prisma`).

Pour basculer sur **PostgreSQL** :
1. Remplacez `provider = "mysql"` par `provider = "postgresql"` dans `backend/prisma/schema.prisma`
2. Retirez toutes les annotations `@db.LongText` / `@db.Text` (optionnelles avec PostgreSQL)
3. Remplacez les champs `Json` de type tableau (`roles`, `tags`, `images`) par `String[]` si vous souhaitez des tableaux natifs PostgreSQL
4. Réactivez `mode: "insensitive"` dans `wiki.controller.js` pour la recherche insensible à la casse
5. Mettez à jour `DATABASE_URL` avec l'URL PostgreSQL

> **Note MySQL :** les champs `tags`, `images`, `roles` sont stockés en JSON (`Json`) au lieu de tableaux natifs (`String[]`) qui ne sont pas supportés par MySQL. Prisma les sérialise/désérialise automatiquement — l'API et le frontend ne changent pas.

---

## Installation

### Option A — Docker (recommandé)

> Prérequis : Docker + Docker Compose v2

```bash
# 1. Copiez et éditez le fichier d'environnement
cp .env.docker .env
#    → changez les JWT secrets (obligatoire !)
#    → ajustez DATABASE_URL si vous utilisez une BDD externe

# 2. Build + démarrage (MySQL intégré + backend + frontend)
docker compose up -d --build

# 3. Vérifiez les logs
docker compose logs -f backend
```

> **⚠️ Mot de passe avec caractères spéciaux dans `DATABASE_URL`**
>
> Le fichier `.env` utilise `#` comme caractère de commentaire — tout ce qui suit un `#` est ignoré.
> Si votre mot de passe contient `&`, `#`, `*`, `@`, `:`, etc., encodez-les en `%XX` dans l'URL :
>
> | Caractère | Encodé |
> |-----------|--------|
> | `&` | `%26` |
> | `#` | `%23` |
> | `*` | `%2A` |
> | `@` | `%40` |
>
> Commande pour encoder votre mot de passe :
> ```bash
> python3 -c "import urllib.parse; print(urllib.parse.quote('MON_MDP', safe=''))"
> ```
> Exemple : `p@ss#1` → `DATABASE_URL=mysql://erp:p%40ss%231@host:3306/erp_perso`

**Premier démarrage** : les migrations Prisma et le seed (`admin@erp.local / Admin1234!`) s'exécutent automatiquement.

Accès :
- Frontend : http://localhost:5173
- API : http://localhost:4000/api
- MySQL : localhost:3306 (si service intégré)

Commandes utiles :
```bash
# Voir les logs en temps réel
docker compose logs -f

# Re-seed (si la DB est déjà initialisée)
docker compose exec backend node prisma/seed.js

# Ouvrir un shell dans le conteneur backend
docker compose exec backend sh

# Arrêter
docker compose down

# Arrêter + supprimer les volumes (réinitialise la BDD)
docker compose down -v
```

---

### Option B — Installation manuelle (dev local)

#### Prerequisites

- Node.js 18+
- MySQL 8.0+ (ou MariaDB 10.5+) accessible à `192.168.1.100:3306`
- npm

#### Backend

```bash
cd backend
cp .env.example .env
# Éditez .env : DATABASE_URL, JWT secrets
npm install
npx prisma migrate dev --name init
npx prisma db seed      # crée admin@erp.local / Admin1234!
npm run dev             # port 4000
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Éditez VITE_API_URL si l'API n'est pas sur localhost:4000
npm run dev             # port 5173
```

### Default admin credentials

After seeding:
- **Email**: `admin@erp.local`
- **Password**: `Admin1234!`

> Change the password immediately after first login.

---

## Environment variables

### Backend (`backend/.env`)

```env
# MySQL (par défaut)
DATABASE_URL="mysql://user:password@192.168.1.100:3306/erp_perso"
# PostgreSQL (changer aussi provider dans schema.prisma)
# DATABASE_URL="postgresql://user:password@192.168.1.100:5432/erp_perso"

JWT_ACCESS_SECRET="change_me_access"
JWT_REFRESH_SECRET="change_me_refresh"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"
PORT=4000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:4000/api"
```

---

## API Routes

| Method | Path                          | Role     | Description                  |
|--------|-------------------------------|----------|------------------------------|
| POST   | /api/auth/login               | public   | Login                        |
| POST   | /api/auth/refresh             | public   | Refresh access token         |
| POST   | /api/auth/logout              | auth     | Logout                       |
| GET    | /api/auth/me                  | auth     | Current user                 |
| GET    | /api/users                    | admin    | List users                   |
| POST   | /api/users                    | admin    | Create user                  |
| PUT    | /api/users/:id                | admin    | Update user                  |
| DELETE | /api/users/:id                | admin    | Delete user                  |
| GET    | /api/admin/settings           | admin    | Get app settings             |
| PUT    | /api/admin/settings           | admin    | Update app settings          |
| GET    | /api/dashboards               | viewer+  | List dashboards               |
| POST   | /api/dashboards               | admin    | Create dashboard              |
| GET    | /api/dashboards/:slug         | viewer+  | Get dashboard with widgets    |
| PUT    | /api/dashboards/:id           | admin    | Update dashboard              |
| DELETE | /api/dashboards/:id           | admin    | Delete dashboard              |
| POST   | /api/dashboards/:id/widgets   | editor+  | Add widget                   |
| PUT    | /api/widgets/:id              | editor+  | Update widget                |
| DELETE | /api/widgets/:id              | editor+  | Delete widget                |
| GET    | /api/wiki                     | viewer+  | List pages (tree)             |
| POST   | /api/wiki                     | editor+  | Create page                   |
| GET    | /api/wiki/:slug               | viewer+  | Get page                      |
| PUT    | /api/wiki/:id                 | editor+  | Update page                   |
| DELETE | /api/wiki/:id                 | admin    | Delete page                   |
| GET    | /api/wiki/:id/versions        | editor+  | Page version history          |
| GET    | /api/wiki/search?q=           | viewer+  | Full-text search              |
| GET    | /api/portfolio                | viewer+  | List portfolios               |
| POST   | /api/portfolio                | admin    | Create portfolio              |
| GET    | /api/portfolio/:slug          | viewer+  | Get portfolio with entries    |
| POST   | /api/portfolio/:id/entries    | editor+  | Add entry                    |
| PUT    | /api/portfolio/entries/:id    | editor+  | Update entry                 |
| DELETE | /api/portfolio/entries/:id    | editor+  | Delete entry                 |

---

## Project structure

```
/
├── frontend/
│   ├── src/
│   │   ├── components/     → UI components (shadcn/ui + layout)
│   │   ├── pages/          → Route-level pages
│   │   ├── context/        → React context (Auth, Theme)
│   │   ├── hooks/          → Custom hooks
│   │   └── lib/            → API client, utilities
│   └── ...
├── backend/
│   ├── src/
│   │   ├── controllers/    → Business logic
│   │   ├── middlewares/    → Auth, role checks
│   │   ├── routes/         → Express routers
│   │   └── utils/          → JWT, errors, helpers
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── ...
└── README.md
```
