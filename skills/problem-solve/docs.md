# Problem-Solve Skill

Structured problem-solving skill using a 5-field decision framework. Create, update, and track problems with clear thinking discipline.

## The Framework

Every problem item uses a structured JSON content format with 5 fields:

| Field | Purpose | When to fill |
|-------|---------|-------------|
| `problem` | Clear statement of the problem | Immediately |
| `why` | Root cause analysis — why does this problem exist? | Immediately |
| `solutions` | Brainstormed possible solutions (numbered list) | Immediately or later |
| `action` | Chosen action — which solution and why | After deliberation |
| `outcome` | What happened after executing the action | After resolution |

## Create a Problem

```bash
curl -X POST http://localhost:3001/api/items \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "problem",
    "title": "Context switching friction",
    "content": "{\"problem\":\"Switching between life modes loses momentum\",\"why\":\"No clear boundaries or transitions between contexts\",\"solutions\":\"1. Mode-specific views\\n2. Ritual prompts\\n3. Focus timers\",\"action\":\"Build mode-specific views first\",\"outcome\":\"\"}",
    "mode": "life",
    "tags": ["meta"],
    "agent_id": "YOUR_AGENT_ID"
  }'
```

## Update a Problem (add outcome)

```bash
curl -X PUT http://localhost:3001/api/items/ITEM_ID \
  -H 'Content-Type: application/json' \
  -d '{
    "content": "{\"problem\":\"Switching between life modes loses momentum\",\"why\":\"No clear boundaries or transitions\",\"solutions\":\"1. Mode-specific views\\n2. Ritual prompts\\n3. Focus timers\",\"action\":\"Build mode-specific views first\",\"outcome\":\"Mode views reduced switch time by ~40%\"}"
  }'
```

## Query Problems

```bash
# All problems
curl http://localhost:3001/api/items?type=problem

# Problems in a specific mode
curl http://localhost:3001/api/items?type=problem&mode=life
```

## Agent Workflow

1. When a user describes a problem, create a problem entry with at least `problem` and `why` filled
2. Help brainstorm `solutions` — list 3-5 options
3. Discuss and decide on `action` — which solution to try
4. After the user has tried the action, update `outcome`
5. If the outcome is negative, consider creating a new problem or updating solutions

## Content JSON Template

```json
{
  "problem": "<clear, specific problem statement>",
  "why": "<root cause analysis>",
  "solutions": "<numbered list of possible solutions>",
  "action": "<chosen solution and reasoning>",
  "outcome": "<result after executing action, or empty string>"
}
```

Always send `content` as a JSON **string** (not a nested object) when creating or updating problem items.