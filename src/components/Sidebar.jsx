import { useState, useEffect, useRef } from 'react';
import { fetchItems, createItem } from '../api';

const MODES = [
  { key: 'all', label: 'All', color: '#e8e8e8' },
  { key: 'life', label: 'Life', color: '#22c55e' },
  { key: 'learning', label: 'Learn', color: '#60a5fa' },
  { key: 'builder', label: 'Build', color: '#f59e0b' },
  { key: 'money', label: 'Money', color: '#4ade80' },
  { key: 'dream', label: 'Dream', color: '#a855f7' },
];

const TYPES = ['all', 'note', 'task', 'idea', 'goal', 'problem', 'dream'];
const STATUSES = ['all', 'active', 'done', 'someday', 'archived'];

export default function Sidebar({ onSelectItem, selectedId, onMutate, refreshKey }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [modeFilter, setModeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('note');
  const [newMode, setNewMode] = useState('life');
  const inputRef = useRef(null);

  useEffect(() => {
    const filters = {};
    if (modeFilter !== 'all') filters.mode = modeFilter;
    if (typeFilter !== 'all') filters.type = typeFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (search.trim()) filters.q = search.trim();
    fetchItems(filters).then(setItems);
  }, [refreshKey, modeFilter, typeFilter, statusFilter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const item = await createItem({
      type: newType,
      title: newTitle.trim(),
      content: '',
      mode: newMode,
      tags: [],
      status: newType === 'task' ? 'active' : 'active',
    });
    setNewTitle('');
    setShowNewForm(false);
    onMutate();
    onSelectItem(item.id);
  };

  const groupedItems = {};
  const modeOrder = ['life', 'learning', 'builder', 'money', 'dream'];
  for (const m of modeOrder) { groupedItems[m] = []; }
  for (const item of items) {
    if (!groupedItems[item.mode]) groupedItems[item.mode] = [];
    groupedItems[item.mode].push(item);
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Second Brain</h2>
        <button className="sidebar-new-btn" onClick={() => { setShowNewForm(!showNewForm); setNewTitle(''); }} title="New item">+</button>
      </div>

      {showNewForm && (
        <form className="sidebar-new-form" onSubmit={handleCreate}>
          <input
            ref={inputRef}
            className="sidebar-new-input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Title..."
            autoFocus
          />
          <div className="sidebar-new-row">
            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="meta-select-sm">
              <option value="note">Note</option>
              <option value="task">Task</option>
              <option value="idea">Idea</option>
              <option value="goal">Goal</option>
              <option value="problem">Problem</option>
              <option value="dream">Dream</option>
            </select>
            <select value={newMode} onChange={(e) => setNewMode(e.target.value)} className="meta-select-sm">
              <option value="life">Life</option>
              <option value="learning">Learning</option>
              <option value="builder">Builder</option>
              <option value="money">Money</option>
              <option value="dream">Dream</option>
            </select>
            <button type="submit" className="sidebar-new-submit">Create</button>
          </div>
        </form>
      )}

      <div className="sidebar-search">
        <input
          className="sidebar-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <div className="sidebar-filters">
        <div className="filter-row">
          {MODES.map(m => (
            <button
              key={m.key}
              className={`filter-btn ${modeFilter === m.key ? 'active' : ''}`}
              onClick={() => setModeFilter(m.key)}
              style={modeFilter === m.key ? { borderColor: m.color, color: m.color } : {}}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="filter-row-sm">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="meta-select-xs">
            {TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="meta-select-xs">
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All status' : s}</option>)}
          </select>
        </div>
      </div>

      <div className="sidebar-items">
        {modeOrder.map(mode => {
          const modeItems = groupedItems[mode] || [];
          if (modeItems.length === 0 && modeFilter !== 'all') return null;
          return (
            <div key={mode} className="sidebar-group">
              <div className="sidebar-group-label">
                <span className="mode-dot" style={{ background: MODES.find(m => m.key === mode)?.color }}></span>
                {MODES.find(m => m.key === mode)?.label} <span className="sidebar-group-count">{modeItems.length}</span>
              </div>
              {modeItems.map(item => (
                <div
                  key={item.id}
                  className={`sidebar-item ${selectedId === item.id ? 'active' : ''} ${item.status === 'done' ? 'done' : ''}`}
                  onClick={() => onSelectItem(item.id)}
                >
                  <span className={`sidebar-item-type type-${item.type}`}>{typeIcon(item.type)}</span>
                  <span className="sidebar-item-title">{item.title}</span>
                  {item.status === 'done' && <span className="sidebar-item-check">&#10003;</span>}
                </div>
              ))}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="sidebar-empty">No items found</div>
        )}
      </div>
    </div>
  );
}

function typeIcon(type) {
  const icons = { note: '\u{1F4DD}', task: '\u2611', idea: '\u{1F4A1}', goal: '\u{1F3AF}', problem: '\u26A0', dream: '\u2728' };
  return icons[type] || '\u{1F4DD}';
}