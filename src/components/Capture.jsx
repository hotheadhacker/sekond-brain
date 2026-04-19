import { useState, useRef } from 'react';
import { createItem } from '../api';

export default function Capture({ onCreated }) {
  const [value, setValue] = useState('');
  const [type, setType] = useState('note');
  const [mode, setMode] = useState('life');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = value.trim();
    if (!title || creating) return;

    setCreating(true);
    try {
      const item = await createItem({
        type,
        title,
        content: '',
        mode,
        tags: [],
        status: 'active',
        folder: '',
      });
      setValue('');
      if (onCreated) onCreated(item.id);
    } catch (e) {
      console.error('Capture failed:', e);
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
        placeholder="Quick capture..."
        disabled={creating}
      />
      <select value={type} onChange={(e) => setType(e.target.value)} className="meta-select-sm">
        <option value="note">Note</option>
        <option value="task">Task</option>
        <option value="idea">Idea</option>
        <option value="goal">Goal</option>
        <option value="problem">Problem</option>
        <option value="dream">Dream</option>
      </select>
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