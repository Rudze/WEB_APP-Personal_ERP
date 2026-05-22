# 🗂️ Personal ERP

> Application web personnelle tout-en-un — wiki, portfolio CV, dossier technique, dashboards, et plus.  
> Déployable en un seul container Docker.

![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker&logoColor=white)
![Claude](https://img.shields.io/badge/90%25%20built%20with-Claude%20AI-D97706?style=flat-square)

---

## Modules

| Module | Description |
|--------|-------------|
| 🔐 **Auth** | JWT (access + refresh tokens), cookies httpOnly, RBAC |
| ⚙️ **Admin** | Gestion des utilisateurs, paramètres globaux, accès public |
| 📊 **Dashboards** | Tableaux de bord dynamiques avec widgets configurables |
| 📖 **Wiki** | Wiki Markdown avec versioning, recherche plein texte, arborescence |
| 💼 **Portfolio** | Vitrine de projets avec mode CV (profil, compétences, timeline) |
| 🎓 **CV** | Dossier technique — formations, certifications, compétences par catégorie |

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

## Démarrage rapide

> Prérequis : Docker + Docker Compose v2, MySQL accessible sur le réseau

```bash
# 1. Cloner le projet
git clone https://github.com/Rudze/WEB_APP-Personal_ERP.git
cd WEB_APP-Personal_ERP

# 2. Configurer l'environnement
cp .env.docker .env
# → Modifier DATABASE_URL avec votre MySQL
# → Changer les JWT secrets (obligatoire)

# 3. Lancer
docker compose up -d --build

# 4. Accéder à l'application
# http://localhost:5173
```

**Identifiants par défaut :** `admin@erp.local` / `Admin1234!`  
> ⚠️ Changez le mot de passe dès la première connexion.

---

## Variables d'environnement (`.env`)

```env
DATABASE_URL="mysql://user:password@host:3306/erp"

JWT_ACCESS_SECRET="changez_moi_minimum_32_caracteres"
JWT_REFRESH_SECRET="changez_moi_minimum_32_caracteres"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

FRONTEND_URL="http://localhost:5173"
COOKIE_SECURE="false"   # true uniquement derrière HTTPS
```

> **Mot de passe avec caractères spéciaux** : encodez-les dans l'URL (`@` → `%40`, `#` → `%23`).  
> ```bash
> python3 -c "import urllib.parse; print(urllib.parse.quote('MON_MDP', safe=''))"
> ```

---

## Commandes utiles

```bash
# Logs en temps réel
docker compose logs -f

# Relancer le seed
docker compose exec app node prisma/seed.js

# Shell dans le container
docker compose exec app sh

# Arrêter + supprimer les volumes (reset BDD)
docker compose down -v
```

---

## Accès public

Les modules Wiki, Portfolio et CV peuvent être rendus accessibles aux visiteurs non connectés.  
Configurez la visibilité de chaque contenu (Privé / Public) depuis l'interface.

---

## Structure du projet

```
/
├── Dockerfile            → Build multi-stage (frontend + backend)
├── docker-compose.yml
├── frontend/             → React + Vite + TailwindCSS
│   └── src/
│       ├── components/   → UI & layout
│       ├── pages/        → Wiki, Portfolio, CV, Dashboards…
│       ├── context/      → Auth, Theme
│       └── lib/          → API client
└── backend/              → Node.js + Express
    ├── src/
    │   ├── controllers/
    │   ├── middlewares/
    │   └── routes/
    └── prisma/
        ├── schema.prisma
        └── seed.js
```

---

## À propos

Ce projet a été développé à **~90% avec [Claude](https://claude.ai)** (Anthropic) — conception de l'architecture, écriture du code, debug et itérations — en collaboration directe via [Claude Code](https://claude.ai/code).

---

## Contact

📧 rudy@galaxynetwork.fr  
🐙 [github.com/Rudze](https://github.com/Rudze)
