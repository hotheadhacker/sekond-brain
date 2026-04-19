import { useState } from 'react';
import { createItem } from '../api';

const PREFIX_MAP = {
  't:': 'task',
  'n:': 'note',
  'i:': 'idea',
};

export default function Capture({ onCreated }) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('life');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) return;

    let type = 'note';
    let title = raw;
    for (const [prefix, t] of Object.entries(PREFIX_MAP)) {
      if (raw.startsWith(prefix)) {
        type = t;
        title = raw.slice(prefix.length).trim();
        break;
      }
    }

    await createItem({ type, title, content: '', mode, tags: [] });
    setValue('');
    onCreated();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="capture-form">
        <input
          className="capture-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Capture a thought... (t: task, n: note, i: idea)"
          autoFocus
        />
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="btn btn-secondary"
          style={{ minWidth: 0 }}
        >
          <option value="life">Life</option>
          <option value="learning">Learning</option>
          <option value="builder">Builder</option>
          <option value="money">Money</option>
          <option value="dream">Dream</option>
        </select>
      </div>
      <div className="capture-hints">
        <span className="capture-hint-prefix">t:</span> task &nbsp;
        <span className="capture-hint-prefix">n:</span> note &nbsp;
        <span className="capture-hint-prefix">i:</span> idea &nbsp;
        <span style={{ color: '#666' }}>— no prefix = note</span>
      </div>
    </form>
  );
}