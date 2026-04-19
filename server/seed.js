import { getAllItems, createItem } from './db.js';

const samples = [
  { type: 'task', title: 'Set up project structure', content: 'Initialize Vite + Express + SQLite', mode: 'builder', tags: ['setup'] },
  { type: 'note', title: 'Core philosophy', content: 'Modes of life, dream life, problem-solving — not a generic notes app.', mode: 'learning', tags: ['philosophy'] },
  { type: 'idea', title: 'Weekly review generator', content: 'Auto-aggregate items from the past week into a review summary.', mode: 'builder', tags: ['feature'] },
  { type: 'problem', title: 'Context switching friction', content: JSON.stringify({ problem: 'Switching between life modes loses momentum', why: 'No clear boundaries or transitions between contexts', solutions: '1. Mode-specific views\n2. Ritual prompts\n3. Focus timers', action: 'Build mode-specific views first', outcome: '' }), mode: 'life', tags: ['meta'] },
  { type: 'dream', title: 'Financial independence', content: 'Build systems that generate passive income, freeing time for creative work.', mode: 'money', tags: ['finance', 'freedom'] },
  { type: 'goal', title: 'Launch MVP by end of month', content: 'Ship the Second Brain app with all core features working.', mode: 'builder', tags: ['milestone'] },
];

for (const s of samples) {
  createItem(s);
}

console.log(`Seeded ${samples.length} items.`);