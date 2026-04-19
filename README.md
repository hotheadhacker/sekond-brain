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

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| type | string | note, task, idea, goal, problem, dream |
| title | string | Item title |
| content | text | Item content (JSON for problems) |
| mode | string | learning, builder, money, life, dream |
| tags | string[] | Comma-separated tags |
| createdAt | timestamp | ISO date |
| updatedAt | timestamp | ISO date |

## API

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/items ?mode=&type=&q= | List items with optional filters |
| GET | /api/items/:id | Get single item |
| POST | /api/items | Create item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |

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