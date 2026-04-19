import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { fetchItems, createItem } from '../api';

const ACTIONS = [
  { id: 'new-note', label: 'New Note', type: 'note', mode: 'life' },
  { id: 'new-task', label: 'New Task', type: 'task', mode: 'life' },
  { id: 'new-idea', label: 'New Idea', type: 'idea', mode: 'life' },
  { id: 'new-goal', label: 'New Goal', type: 'goal', mode: 'life' },
  { id: 'new-problem', label: 'New Problem', type: 'problem', mode: 'life' },
  { id: 'new-dream', label: 'New Dream', type: 'dream', mode: 'dream' },
  { id: 'goto-graph', label: 'Open Graph View', type: 'nav' },
];

export default function CommandPalette({ onSelectItem, onNavigate, onGraphView }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        setOpen(o => !o);
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchItems().then(setItems);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(ACTIONS);
      return;
    }
    const fuse = new Fuse(items, { keys: ['title', 'content'], threshold: 0.4 });
    const itemResults = fuse.search(query).map(r => ({ ...r.item, _resultType: 'item' }));
    const actionResults = ACTIONS.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));
    setResults([...actionResults, ...itemResults]);
    setSelectedIndex(0);
  }, [query, items]);

  const handleSelect = (result, idx) => {
    if (result.id === 'goto-graph') {
      onGraphView();
    } else if (result._resultType === 'item') {
      onSelectItem(result.id);
    } else if (result.type) {
      createItem({ type: result.type, title: 'Untitled', content: '', mode: result.mode, tags: [] }).then((item) => {
        onSelectItem(item.id);
      });
    }
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex], selectedIndex);
    }
  };

  if (!open) return null;

  return (
    <div className="command-palette-overlay" onClick={() => setOpen(false)}>
      <div className="command-palette" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="command-palette-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search notes, create, navigate..."
        />
        <div className="command-palette-results">
          {results.map((result, idx) => (
            <div
              key={result.id || result._resultType + idx}
              className={`command-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(result, idx)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span className="cmd-type-badge">
                {result._resultType === 'item' ? result.type : 'action'}
              </span>
              <span className="cmd-label">{result.label || result.title}</span>
              {result.mode && <span className="cmd-mode">{result.mode}</span>}
            </div>
          ))}
          {results.length === 0 && (
            <div className="command-palette-empty">No results</div>
          )}
        </div>
      </div>
    </div>
  );
}