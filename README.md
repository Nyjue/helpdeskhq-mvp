# HelpDeskHQ

A lightweight IT help desk ticket tracker. Users submit tickets, and help desk staff can track them from **open** to **in progress** to **closed**.

Built as the final project for my Software Development course (Sprint 1 MVP).

**Live app (Google Cloud Run):** _add your Cloud Run URL here_
**Jira:** https://nyjue.atlassian.net (project key `HEL`)
**Confluence:** _add your space URL here_

---

## Project status: Sprint 1 MVP ✅

| Feature | Status |
|---|---|
| Submit a ticket (title, description, priority, requester) | ✅ Done |
| View all tickets, newest first | ✅ Done |
| Update a ticket's status (open / in progress / closed) | ✅ Done |
| Filter tickets by status | ✅ Done |
| Delete a ticket | ✅ Done |
| Input validation + error messages | ✅ Done |
| Automated API tests (9 tests) | ✅ Done |
| Dockerized | ✅ Done |
| CI with GitHub Actions (tests + Docker build on every PR) | ✅ Done |
| Deployed to Google Cloud Run | ✅ Manual deploy |
| Persistent database | ⏭️ Sprint 2 (tickets are stored in memory for now and reset on restart) |
| Login / user roles | ⏭️ Sprint 2 |
| Automated deploy to Cloud Run from GitHub Actions | ⏭️ Sprint 2 |

## Tech stack

- **Backend:** Node.js 20 + Express
- **Frontend:** Plain HTML, CSS, JavaScript (served by Express)
- **Testing:** Node's built-in test runner (`node --test`)
- **Containerization:** Docker
- **CI:** GitHub Actions
- **Hosting:** Google Cloud Run
- **Project management:** Jira (sprints, stories) + Confluence (docs)

## Project structure

```
helpdeskhq/
├── src/
│   ├── app.js            # Express app setup + routes
│   ├── server.js         # Starts the server (reads PORT)
│   ├── store.js          # In-memory ticket storage
│   └── routes/
│       └── tickets.js    # /api/tickets endpoints + validation
├── public/               # Frontend (index.html, styles.css, app.js)
├── tests/                # API tests
├── .github/workflows/    # CI pipeline
├── Dockerfile
└── docker-compose.yml
```

## Setup

### Run locally

Requires Node.js 20+.

```bash
git clone https://github.com/Nyjue/helpdeskhq.git
cd helpdeskhq
npm install
npm start
```

Open http://localhost:8080

### Run the tests

```bash
npm test
```

### Run with Docker

```bash
docker build -t helpdeskhq .
docker run -p 8080:8080 helpdeskhq
```

Or with Compose:

```bash
docker compose up --build
```

Open http://localhost:8080

### Deploy to Google Cloud Run

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
gcloud run deploy helpdeskhq --source . --region us-east1 --allow-unauthenticated
```

`--source .` uses Cloud Build to build the Dockerfile, so you don't need Docker installed for the deploy.

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/tickets` | List tickets (optional `?status=open\|in-progress\|closed`) |
| GET | `/api/tickets/:id` | Get one ticket |
| POST | `/api/tickets` | Create a ticket: `{ title, description?, priority?, requester? }` |
| PATCH | `/api/tickets/:id` | Update fields, e.g. `{ status: "closed" }` |
| DELETE | `/api/tickets/:id` | Delete a ticket |

Example:

```bash
curl -X POST http://localhost:8080/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Cannot connect to VPN","priority":"high","requester":"jsmith"}'
```

## Git workflow

- `main` is protected. All work happens on feature branches and goes in through pull requests.
- Branches are named after their Jira work: `feature/HEL-ticket-api`, `feature/HEL-docker`, etc.
- CI runs the tests and a Docker build on every PR before it's merged.

## AI tool usage

AI tools were used throughout development. Here's what each one was used for:

| Tool | What I used it for |
|---|---|
| **Claude** | Generated the initial project scaffold, the Express API, input validation, the frontend, the Dockerfile, the test suite and the GitHub Actions workflow. Also drafted this README and the Confluence documentation. |
| **GitHub Copilot** | _fill in if you use it, e.g. autocomplete while editing in VS Code_ |

**How I used it responsibly:**
- I reviewed every file before committing and ran the tests (`npm test`) to confirm behavior.
- I kept work split into small feature branches and PRs so every AI-assisted change was reviewed on its own.
- Commits made with AI help include a `Co-Authored-By` trailer so the history shows where AI was involved.

**What AI got wrong / what I had to fix:**
- The first test script used `node --test tests/`, which fails on Node 22 (it treats the folder as a file). I changed it to `node --test`, which finds `*.test.js` files automatically.

## Author

Nyjuel Bennett, Newberry College
