# Second Brain

A structured thinking system — not a generic notes app. Built around **modes of life**, **dream goals**, and **problem-solving**.

## Quick Start

```bash
npm install
npm run build
npm start
```

Open [http://localhost:3001](http://localhost:3001)

### Development (hot reload)

```bash
npm run dev
```

Frontend runs on :5173 (proxies API to :3001). Backend runs on :3001.

### Seed sample data

```bash
npm run seed
```

## Features

### Capture
Prefix-based quick input:
- `t:` → task
- `n:` → note
- `i:` → idea
- No prefix → note

Select a mode (Life / Learning / Builder / Money / Dream) before capturing.

### Views
| View | Description |
|------|-------------|
| **Inbox** | All items, newest first. Includes search. |
| **Modes** | Filter by life mode (Learning, Builder, Money, Life, Dream). |
| **Focus** | Tasks + Problems only. |
| **Dream** | Visually distinct section for dream entries. |

### Problem-Solving Template
Items of type "problem" use a structured 5-field template:
1. Problem
2. Why it exists
3. Possible solutions
4. Chosen action
5. Outcome

Click the ☰ icon on a problem card to open the structured editor.

### Search
Full-text search across titles and content. Available in the Inbox view.

## Data Model

### Items

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| type | string | note, task, idea, goal, problem, dream |
| title | string | Item title |
| content | text | Item content (JSON for problems) |
| mode | string | learning, builder, money, life, dream |
| tags | string[] | Comma-separated tags |
| agent_id | UUID? | ID of the agent that created this item (nullable) |
| createdAt | timestamp | ISO date |
| updatedAt | timestamp | ISO date |

### Agents

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key (auto-generated if not provided) |
| name | string | Agent display name |
| created_at | timestamp | When the agent first registered |
| last_seen | timestamp | Updated on every registration call |

## API

### Items

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/items ?mode=&type=&q=&agent_id= | List items with optional filters |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |

### Agents

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/agents | Register or update an agent |
| GET | /api/agents | List all agents |
| GET | /api/agents/:id | Get agent by ID |

### Skills

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/skills | List all available skills (name, version, description) |
| GET | /api/skills/:name/manifest | Get full skill manifest (endpoints, schemas, examples) |
| GET | /api/skills/:name/docs | Get skill documentation in Markdown |
| GET | /api/skills/check-updates?versions={"name":"1.0.0"} | Check which skills have updates |

## Agent Skill System

Second Brain exposes an **agentic skill system** — any LLM agent can discover, register, and interact with the system through structured manifests and a standardized API.

### How It Works

1. **Agent registers** via `POST /api/agents` with a name (gets assigned an ID if not provided)
2. **Agent discovers skills** via `GET /api/skills` — lists all available skills with versions
3. **Agent reads a manifest** via `GET /api/sills/:name/manifest` — gets endpoints, schemas, and examples
4. **Agent reads docs** via `GET /api/skills/:name/docs` — gets Markdown usage guide
5. **Agent checks for updates** via `GET /api/skills/check-updates` — compares local versions to server versions
6. **Agent creates/queries items** using standard CRUD, optionally passing `agent_id` for attribution

### Agent Registration

```bash
# Register a new agent (auto-assigned ID)
curl -X POST http://localhost:3001/api/agents \
  -H 'Content-Type: application/json' \
  -d '{"name": "my-llm-agent"}'

# Or re-register with a specific ID (updates last_seen)
curl -X POST http://localhost:3001/api/agents \
  -H 'Content-Type: application/json' \
  -d '{"id": "your-uuid-here", "name": "my-llm-agent"}'
```

### Available Skills

| Skill | Version | Description |
|-------|---------|-------------|
| `second-brain` | 1.0.0 | Full CRUD management of items, modes, types |
| `capture` | 1.0.0 | Quick-capture with prefix parsing (t:/n:/i:) |
| `problem-solve` | 1.0.0 | Structured 5-field problem-solving framework |

### Version Checking

Agents should periodically check for skill updates:

```bash
# Send your known versions
curl "http://localhost:3001/api/skills/check-updates?versions=%7B%22second-brain%22%3A%221.0.0%22%7D"

# Response:
# {
#   "latest": [{"name": "capture", "version": "1.0.0"}, ...],
#   "updates_available": [{"name": "capture", "version": "1.1.0"}, ...]
# }
```

If `updates_available` is non-empty, the agent should re-fetch the manifest and docs.

### Skill Manifest Format

Each skill's `manifest.json` contains:
- `name`, `version`, `description`
- `base_url`, `auth` type
- `endpoints` — method, path, params, body schema, returns
- `item_schema` or `framework` — data format details
- `examples` — ready-to-use request bodies

### Adding New Skills

1. Create a directory under `skills/<skill-name>/`
2. Add `manifest.json` with the skill definition
3. Add `docs.md` with usage documentation
4. The skill automatically appears in `GET /api/skills`

No server restart needed — skills are read from disk on each request.

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Express
- **Database**: SQLite (better-sqlite3)
- **Routing**: React Router v6

Data is stored in `data.db` (SQLite) in the project root.

## Improvement Analysis

### Proposals

1. **Simple Full-Text Search** — Search across titles and content. **Implemented.**
2. **Tag-Based Filtering** — Click a tag to see all items with it.
3. **Weekly Review Generator** — Auto-aggregate past week's items into a summary.
4. **Lightweight Linking** — `[[note-id]]` syntax to connect items.
5. **Mode-Based Stats** — Item count per mode displayed as a simple chart.

### Selected: Simple Full-Text Search

- **Problem**: As items grow, finding anything requires manual scanning. A brain that can't retrieve is useless.
- **Why it matters**: Search is the most fundamental retrieval tool. Without it, the system degrades with scale.
- **Complexity**: Low — SQLite `LIKE` query + search input in UI.
- **Implementation**: Added `?q=` param to GET /api/items, debounced search input in Inbox view.