import { useState, useRef } from 'react';
import { createItem } from '../api';

const PREFIX_MAP = { 't:': 'task', 'n:': 'note', 'i:': 'idea' };

export default function Capture({ onCreated }) {
  const [value, setValue] = useState('');
  const [mode, setMode] = useState('life');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef(null);

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

    setCreating(true);
    try {
      const item = await createItem({ type, title, content: '', mode, tags: [], status: 'active' });
      setValue('');
      if (onCreated) onCreated(item.id);
    } finally {
      setCreating(false);
    }
  };

  return (
    <form className="capture-inline" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="capture-inline-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Quick capture... (t: task, n: note, i: idea)"
        disabled={creating}
      />
      <select value={mode} onChange={(e) => setMode(e.target.value)} className="meta-select-sm">
        <option value="life">Life</option>
        <option value="learning">Learning</option>
        <option value="builder">Builder</option>
        <option value="money">Money</option>
        <option value="dream">Dream</option>
      </select>
      <button type="submit" className="capture-submit" disabled={!value.trim() || creating}>
        {creating ? '...' : 'Add'}
      </button>
    </form>
  );
}