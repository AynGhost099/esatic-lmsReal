# Guide de contribution — ESATIC LMS

## Prérequis
- Python 3.12+
- Node.js 20+
- PostgreSQL 16
- Redis 7

## Démarrage rapide (sans Docker)

### Backend
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
source .venv/bin/activate        # Linux/Mac
pip install -r requirements/dev.txt
cp .env.example .env             # Remplir les variables
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev                      # http://localhost:3000
```

### Avec Docker (recommandé)
```bash
cp backend/.env.example backend/.env
docker-compose up --build
```
- Frontend: http://localhost
- Backend API: http://localhost:8000
- Swagger: http://localhost:8000/api/docs/
- Admin Django: http://localhost:8000/admin/

## Branches Git

| Branche | Usage |
|---------|-------|
| `main` | Production stable |
| `develop` | Intégration continue |
| `feature/xxx` | Nouvelles fonctionnalités |
| `fix/xxx` | Corrections de bugs |

## Workflow
1. Créer une branche depuis `develop` : `git checkout -b feature/mon-module`
2. Développer + écrire les tests
3. `git push origin feature/mon-module`
4. Ouvrir une Pull Request vers `develop`
5. Review par un autre membre → merge

## Répartition des modules

| Membre | Module(s) |
|--------|-----------|
| M1 - Backend Lead | Auth/Users, Architecture, Code Review |
| M2 - Backend Dev 1 | Cours, Ressources, Devoirs |
| M3 - Backend Dev 2 | Quiz/Examens, Reporting, Communication |
| M4 - Frontend Lead | Layout, Auth UI, Dashboard, Cours |
| M5 - Frontend/DevOps | Quiz UI, Devoirs UI, Docker, AWS |

## Endpoints API principaux

| Méthode | URL | Description |
|---------|-----|-------------|
| POST | `/api/v1/auth/login/` | Connexion |
| POST | `/api/v1/auth/register/` | Inscription |
| GET | `/api/v1/courses/` | Liste des cours |
| POST | `/api/v1/courses/<id>/enroll/` | S'inscrire |
| GET | `/api/v1/quizzes/` | Liste des quiz |
| POST | `/api/v1/quizzes/<id>/submit/` | Soumettre un quiz |
| GET | `/api/v1/reporting/dashboard/` | Dashboard |

Documentation complète : http://localhost:8000/api/docs/
