import { createItem, getAllItems } from './db.js';

const samples = [
  { type: 'note', title: 'Core Philosophy', content: '## What is Second Brain?\n\nA structured thinking system based on:\n\n- **Modes of life** — context for thinking\n- **Dream life** — your north star\n- **Problem-solving** — your decision engine\n\nThis is NOT a generic notes app. It is a system for **better thinking**.\n\n### Principles\n\n1. Capture everything\n2. Organize by mode\n3. Link ideas together\n4. Review regularly\n5. Decide with structure', mode: 'learning', tags: ['philosophy', 'system'], status: 'active' },
  { type: 'task', title: 'Set up project structure', content: 'Initialize Vite + Express + SQLite stack.\n\n- [x] Set up database schema\n- [x] Create CRUD API\n- [x] Build React frontend\n- [ ] Add wikilink support\n- [ ] Implement graph view', mode: 'builder', tags: ['setup', 'project'], status: 'done' },
  { type: 'idea', title: 'Weekly review generator', content: '**Idea**: Auto-aggregate items from the past week into a review summary.\n\nThis would:\n\n1. Pull all items modified in the last 7 days\n2. Group by mode\n3. Highlight completed tasks\n4. Surface unresolved problems\n5. Suggest next actions\n\nCould be triggered manually or on a schedule.', mode: 'builder', tags: ['feature', 'review'], status: 'someday' },
  { type: 'problem', title: 'Context switching friction', content: '{"problem":"Switching between life modes loses momentum","why":"No clear boundaries or transitions between contexts — everything blends together and nothing gets deep attention","solutions":"1. Mode-specific views with distinct visual themes\\n2. Ritual prompts when switching modes\\n3. Focus timers tied to modes\\n4. End-of-session summary prompts","action":"Build mode-specific views with distinct color coding and quick-switch sidebar","outcome":""}', mode: 'life', tags: ['meta', 'focus'], status: 'active' },
  { type: 'dream', title: 'Financial independence', content: '## The Vision\n\nBuild systems that generate **passive income**, freeing time for creative work and exploration.\n\n### Milestones\n\n- $5k/month recurring revenue\n- 3 automated income streams\n- No client dependency\n\n### Why it matters\n\nTime is the ultimate currency. Financial independence means **owning your schedule**.', mode: 'money', tags: ['finance', 'freedom', 'vision'], status: 'active' },
  { type: 'goal', title: 'Launch MVP by end of month', content: '## Goal\n\nShip the Second Brain app with all core features working.\n\n### Success criteria\n\n- [x] CRUD operations work\n- [x] Mode-based views\n- [x] Problem-solving template\n- [x] Wikilink support\n- [ ] Graph view\n- [ ] Command palette\n\n### Key decisions\n\nUsing SQLite for simplicity. TipTap for the editor. React Force Graph for visualization.', mode: 'builder', tags: ['milestone', 'launch'], status: 'active' },
];

async function seed() {
  const created = [];
  for (const s of samples) {
    const item = createItem(s);
    created.push(item);
  }

  // Create links between items
  const [philosophy, setup, review, contextSwitch, dream, goal] = created;

  // Update items to link to each other using [[id|title]] syntax
  const { updateItem } = await import('./db.js');

  updateItem(philosophy.id, {
    content: philosophy.content + `\n\nSee also: [[${setup.id}|Set up project structure]] and [[${contextSwitch.id}|Context switching friction]]`
  });

  updateItem(goal.id, {
    content: goal.content + `\n\nInspired by: [[${dream.id}|Financial independence]]`
  });

  updateItem(review.id, {
    content: review.content + `\n\nRelated: [[${philosophy.id}|Core Philosophy]]`
  });

  console.log(`Seeded ${created.length} items with cross-links.`);
}

seed();