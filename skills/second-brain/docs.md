# Second Brain Skill

Full Second Brain management. Query, create, update, and delete items across all modes and types.

## Registration

Before using any skill, register your agent:

```bash
curl -X POST http://localhost:3001/api/agents \
  -H 'Content-Type: application/json' \
  -d '{"name": "my-agent"}'
```

Response:
```json
{ "id": "a1b2c3d4-...", "name": "my-agent", "created_at": "...", "last_seen": "..." }
```

Use the returned `id` as `agent_id` in subsequent requests.

## List Items

```bash
# All items
curl http://localhost:3001/api/items

# Filter by mode
curl http://localhost:3001/api/items?mode=builder

# Filter by type (comma-separated)
curl http://localhost:3001/api/items?type=task,idea

# Search
curl http://localhost:3001/api/items?q=philosophy

# Filter by agent
curl http://localhost:3001/api/items?agent_id=a1b2c3d4-...
```

## Create Item

```bash
curl -X POST http://localhost:3001/api/items \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "note",
    "title": "Key insight from today",
    "content": "SQLite WAL mode allows concurrent reads",
    "mode": "learning",
    "tags": ["database", "perf"],
    "agent_id": "YOUR_AGENT_ID"
  }'
```

## Update Item

```bash
curl -X PUT http://localhost:3001/api/items/ITEM_ID \
  -H 'Content-Type: application/json' \
  -d '{"title": "Updated title", "tags": ["database", "perf", "sqlite"]}'
```

## Delete Item

```bash
curl -X DELETE http://localhost:3001/api/items/ITEM_ID
```

## Item Types

| Type | Description |
|------|-------------|
| `note` | General knowledge or observation |
| `task` | Actionable item to complete |
| `idea` | Creative thought or possibility |
| `goal` | Medium/long-term objective |
| `problem` | Structured problem-solving entry (uses JSON content) |
| `dream` | North star / aspirational vision |

## Modes

| Mode | Description |
|------|-------------|
| `learning` | Knowledge acquisition, study, research |
| `builder` | Making, creating, shipping |
| `money` | Financial, business, career |
| `life` | Personal, health, relationships |
| `dream` | Long-term vision, aspirations |