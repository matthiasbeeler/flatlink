# flatlink

flatlink is a flat-sharing matching web app, built as a matura project. People looking for a room ("searchers") and people offering one ("providers") each create a profile with their preferences. The app matches them and lets both sides like or dislike each other. Providers and searchers both see a match score and the details of each match.

> **Status:** archived. The project is no longer maintained and is not running anywhere. It is published for reference.

## Features

- Signup for searchers and providers, with a multi-step preferences questionnaire
- Email verification, password reset and email address change (via signed, expiring tokens)
- Matching between searchers and providers based on preferences and location
- Likes, dislikes and matches, each with a detail view
- Profile and flat images, with server-side resizing
- Admin dashboard for managing user accounts
- Installable as a PWA (manifest, service worker, offline page)
- German-language UI, with imprint and privacy pages

## Tech stack

| Part | Stack |
|---|---|
| Frontend | Node.js, Express, EJS templates, plain JavaScript and CSS |
| Backend (REST API) | Node.js, Express, Sequelize ORM |
| Database | PostgreSQL |
| Auth | JWT, bcrypt, `express-bouncer` against brute force |
| Email | Nodemailer with EJS email templates |
| Images | `sharp`, `express-fileupload` |

## Project structure

| Path | Purpose |
|---|---|
| `backend/` | REST API: routes, services (business logic), Sequelize models, email templates |
| `frontend/` | Server-rendered web app: routes, EJS views, static assets |
| `package.json` | Root scripts to start backend and frontend together |

### Routes

**Frontend** (port 3000)

| Route | Purpose |
|---|---|
| `/` | Logged out area: login, signup, forgot password, email verification, legal pages |
| `/user` | Everything for logged-in users |
| `/admin` | Admin dashboard |

**Backend API** (port 4000)

| Route | Purpose |
|---|---|
| `/accountService` | Accounts, including pictures |
| `/matchingService` | Matching, liking, disliking and fetching likes |
| `/adminService` | Admin dashboard data |

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org)
- [PostgreSQL](https://postgresql.org), with an empty database created for development
- `nodemon` (`npm install -g nodemon`), used by the development scripts

### Installation

1. Install dependencies in the root, `backend/` and `frontend/`:

   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. Create `backend/development.env`:

   | Variable | Description |
   |---|---|
   | `dbUserDev` | Dev database user |
   | `dbPassDev` | Password of that user |
   | `dbDev` | Dev database name |
   | `dbHostDev` | Dev database host (`localhost` if local) |
   | `jwtSecret` | Secret for signing JWTs |
   | `appUrl` | Frontend URL used in emails, e.g. `http://localhost:3000` |
   | `emailUser` | SMTP username (only needed to send emails) |
   | `emailPassword` | SMTP password (only needed to send emails) |
   | `emailUserName` | Sender address shown in emails |

3. Create `frontend/development.env`:

   | Variable | Description |
   |---|---|
   | `apiUrl` | `http://localhost:4000` |
   | `appUrl` | `http://localhost:3000` |
   | `jwtSecret` | Same value as in the backend |

   The `.env` files are git-ignored. Never commit them.

4. Start both apps in development mode, from the repository root:

   ```bash
   npm test
   ```

   On Windows use `npm run testWindows`. The database tables are created automatically on first start (Sequelize `sync`).

5. Open <http://localhost:3000>. The API runs on <http://localhost:4000>.

> **Note:** the root `package.json` scripts call `cd Backend` and `cd Frontend` with capital letters. On case-sensitive file systems (Linux) that fails. Either fix the casing or start each app yourself with `npm test` inside `backend/` and `frontend/`.

### Production

`npm start` runs both apps with `NODE_ENV=production`. The backend then reads `dbUser`, `dbPass`, `db` and `dbHost` instead of the `…Dev` variables. `PORT` can override the default ports.

The sender host `mail.nyv.ch` is hardcoded in `backend/services/mailer.js`, and the allowed CORS origins are listed in `backend/app.js`. Change both if you deploy your own instance.
