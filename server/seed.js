import { createItem, getAllItems } from './db.js';

const samples = [
  { type: 'note', title: 'Core Philosophy', content: '## What is Second Brain?\n\nA structured thinking system based on:\n\n- **Modes of life** — context for thinking\n- **Dream life** — your north star\n- **Problem-solving** — your decision engine\n\nThis is NOT a generic notes app. It is a system for **better thinking**.\n\n### Principles\n\n1. Capture everything\n2. Organize by mode\n3. Link ideas together\n4. Review regularly\n5. Decide with structure', mode: 'learning', tags: ['philosophy', 'system'], status: 'active', folder: 'meta' },
  { type: 'task', title: 'Set up project structure', content: 'Initialize Vite + Express + SQLite stack.\n\n- [x] Set up database schema\n- [x] Create CRUD API\n- [x] Build React frontend\n- [x] Add wikilink support\n- [ ] Implement graph view\n- [ ] Polish tree sidebar', mode: 'builder', tags: ['setup', 'project'], status: 'done', folder: 'projects/second-brain' },
  { type: 'task', title: 'Write documentation', content: 'Add README docs for the skill system and API endpoints.\n\n- [ ] Skill manifest format\n- [ ] Agent registration flow\n- [ ] Wikilink syntax guide', mode: 'builder', tags: ['docs'], status: 'active', folder: 'projects/second-brain' },
  { type: 'idea', title: 'Weekly review generator', content: '**Idea**: Auto-aggregate items from the past week into a review summary.\n\nThis would:\n\n1. Pull all items modified in the last 7 days\n2. Group by mode\n3. Highlight completed tasks\n4. Surface unresolved problems\n5. Suggest next actions\n\nCould be triggered manually or on a schedule.', mode: 'builder', tags: ['feature', 'review'], status: 'someday', folder: 'ideas' },
  { type: 'idea', title: 'Tag-based filtering', content: 'Click any tag in the sidebar or on a card to instantly filter items by that tag. Should work across all views.', mode: 'builder', tags: ['feature', 'ux'], status: 'someday', folder: 'ideas' },
  { type: 'problem', title: 'Context switching friction', content: '{"problem":"Switching between life modes loses momentum","why":"No clear boundaries or transitions between contexts — everything blends together and nothing gets deep attention","solutions":"1. Mode-specific views with distinct visual themes\\n2. Ritual prompts when switching modes\\n3. Focus timers tied to modes\\n4. End-of-session summary prompts","action":"Build mode-specific views with distinct color coding and quick-switch sidebar","outcome":""}', mode: 'life', tags: ['meta', 'focus'], status: 'active', folder: '' },
  { type: 'dream', title: 'Financial independence', content: '## The Vision\n\nBuild systems that generate **passive income**, freeing time for creative work and exploration.\n\n### Milestones\n\n- $5k/month recurring revenue\n- 3 automated income streams\n- No client dependency\n\n### Why it matters\n\nTime is the ultimate currency. Financial independence means **owning your schedule**.', mode: 'money', tags: ['finance', 'freedom', 'vision'], status: 'active', folder: '' },
  { type: 'goal', title: 'Launch MVP by end of month', content: '## Goal\n\nShip the Second Brain app with all core features working.\n\n### Success criteria\n\n- [x] CRUD operations work\n- [x] Mode-based views\n- [x] Problem-solving template\n- [x] Wikilink support\n- [x] Graph view\n- [x] Command palette\n- [x] Edit/Preview toggle\n\n### Key decisions\n\nUsing SQLite for simplicity. TipTap for the editor. React Force Graph for visualization.', mode: 'builder', tags: ['milestone', 'launch'], status: 'active', folder: 'projects/second-brain' },
  { type: 'note', title: 'Learning Log Template', content: '## What I Learned Today\n\nDate: ---\n\n### Key Concepts\n- \n\n### Connections to Previous Knowledge\n- \n\n### Questions\n- \n\n### Action Items\n- ', mode: 'learning', tags: ['template', 'learning'], status: 'active', folder: 'templates' },
  { type: 'note', title: 'Meeting Notes Template', content: '## Meeting: ---\nDate: ---\nAttendees: ---\n\n### Discussion Points\n1. \n\n### Decisions\n- \n\n### Action Items\n- [ ] \n\n### Next Meeting\nDate: ---\nAgenda: ---', mode: 'life', tags: ['template', 'meetings'], status: 'active', folder: 'templates' },
];

async function seed() {
  const created = [];
  for (const s of samples) {
    const item = createItem(s);
    created.push(item);
  }

  const [philosophy, setup, docs, review, tagFilter, contextSwitch, dream, goal, learningTemplate, meetingTemplate] = created;

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

  updateItem(setup.id, {
    content: setup.content + `\n\nPart of: [[${goal.id}|Launch MVP by end of month]]`
  });

  console.log(`Seeded ${created.length} items with cross-links and folders.`);
}

seed();