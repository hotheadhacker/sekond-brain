# Capture Skill

Quick-capture skill for instant thought entry. Optimized for low-friction capture with prefix-based type detection.

## How It Works

The capture skill uses a simple prefix system to determine item type:

| Prefix | Type | Example |
|--------|------|---------|
| `t:` | task | `t: Fix the deployment script` |
| `n:` | note | `n: SQLite WAL mode enables concurrent reads` |
| `i:` | idea | `i: Add a weekly digest email` |
| *(none)* | note | `Remember to review the PR tomorrow` |

## Workflow

1. Receive a quick thought from the user
2. Parse prefix: `t:` → task, `n:` → note, `i:` → idea, no prefix → note
3. Strip prefix from title
4. POST `/api/items` with type, title, and optional mode/tags/agent_id
5. Return confirmation

## Examples

### Capture a task

```bash
curl -X POST http://localhost:3001/api/items \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "task",
    "title": "Ship the landing page by Friday",
    "content": "",
    "mode": "builder",
    "tags": [],
    "agent_id": "YOUR_AGENT_ID"
  }'
```

### Capture a note

```bash
curl -X POST http://localhost:3001/api/items \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "note",
    "title": "API rate limits are 100/min",
    "content": "",
    "mode": "learning",
    "tags": ["api"],
    "agent_id": "YOUR_AGENT_ID"
  }'
```

### Capture an idea

```bash
curl -X POST http://localhost:3001/api/items \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "idea",
    "title": "Add weekly digest email",
    "content": "",
    "mode": "builder",
    "tags": ["feature"],
    "agent_id": "YOUR_AGENT_ID"
  }'
```

## Programmatic Parsing

For agents implementing capture parsing:

```python
def parse_capture(raw_text: str) -> dict:
    prefixes = {"t:": "task", "n:": "note", "i:": "idea"}
    item_type = "note"
    title = raw_text.strip()
    for prefix, type_name in prefixes.items():
        if raw_text.startswith(prefix):
            item_type = type_name
            title = raw_text[len(prefix):].strip()
            break
    return {"type": item_type, "title": title}
```