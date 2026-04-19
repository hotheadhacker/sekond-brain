import { useState, useEffect, useRef } from 'react';
import { fetchItems, createItem } from '../api';

const MODES = [
  { key: 'life', label: 'Life', color: '#22c55e' },
  { key: 'learning', label: 'Learning', color: '#60a5fa' },
  { key: 'builder', label: 'Builder', color: '#f59e0b' },
  { key: 'money', label: 'Money', color: '#4ade80' },
  { key: 'dream', label: 'Dream', color: '#a855f7' },
];

const TYPE_ICONS = {
  note: '\uD83D\uDCDD', task: '\u2611', idea: '\uD83D\uDCA1',
  goal: '\uD83C\uDFAF', problem: '\u26A0', dream: '\u2728',
};

const FOLDER_ICON = '\uD83D\uDCC2';

function buildTree(items) {
  const tree = {};
  for (const mode of MODES) {
    tree[mode.key] = { folders: {}, items: [] };
  }

  for (const item of items) {
    const mode = item.mode || 'life';
    if (!tree[mode]) tree[mode] = { folders: {}, items: [] };

    if (!item.folder) {
      tree[mode].items.push(item);
    } else {
      const parts = item.folder.split('/').filter(Boolean);
      let current = tree[mode].folders;
      for (const part of parts) {
        if (!current[part]) current[part] = { folders: {}, items: [] };
        current = current[part].folders;
      }
      current._items = current._items || [];
      current._items.push(item);
    }
  }

  return tree;
}

function FolderNode({ name, node, depth, selectedId, onSelect, expanded, onToggle }) {
  const folderItems = node.items || [];
  const folderKeys = Object.keys(node.folders || {}).filter(k => k !== '_items');
  const allItems = [...folderItems, ...(node._items || [])];
  const isExpanded = expanded.has(name);

  return (
    <div className="tree-node">
      <div
        className="tree-folder"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onToggle(name)}
      >
        <span className={`tree-arrow ${isExpanded ? 'expanded' : ''}`}>›</span>
        <span className="tree-folder-icon">{FOLDER_ICON}</span>
        <span className="tree-folder-name">{name}</span>
        <span className="tree-folder-count">{allItems.length}</span>
      </div>
      {isExpanded && (
        <div className="tree-children">
          {folderKeys.map(key => (
            <FolderNode
              key={key}
              name={key}
              node={node.folders[key]}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expanded={expanded}
              onToggle={onToggle}
            />
          ))}
          {(node._items || []).map(item => (
            <TreeItem
              key={item.id}
              item={item}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TreeItem({ item, depth, selectedId, onSelect }) {
  return (
    <div
      className={`tree-item ${selectedId === item.id ? 'active' : ''} ${item.status === 'done' ? 'done' : ''}`}
      style={{ paddingLeft: `${12 + depth * 16}px` }}
      onClick={() => onSelect(item.id)}
    >
      <span className="tree-item-icon">{TYPE_ICONS[item.type] || '\u{1F4DD}'}</span>
      <span className="tree-item-title">{item.title}</span>
      {item.status === 'done' && <span className="tree-item-check">\u2713</span>}
    </div>
  );
}

export default function Sidebar({ onSelectItem, selectedId, onMutate, refreshKey }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(new Set(MODES.map(m => m.key)));
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('note');
  const [newMode, setNewMode] = useState('life');
  const [newFolder, setNewFolder] = useState('');
  const [creating, setCreating] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    const filters = {};
    if (search.trim()) filters.q = search.trim();
    fetchItems(filters).then(setItems);
  }, [refreshKey, search]);

  useEffect(() => {
    if (showNewForm && inputRef.current) inputRef.current.focus();
  }, [showNewForm]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || creating) return;
    setCreating(true);
    try {
      const item = await createItem({
        type: newType,
        title: newTitle.trim(),
        content: '',
        mode: newMode,
        tags: [],
        status: 'active',
        folder: newFolder.trim(),
      });
      setNewTitle('');
      setNewFolder('');
      setShowNewForm(false);
      onMutate();
      onSelectItem(item.id);
    } finally {
      setCreating(false);
    }
  };

  const toggleExpanded = (key) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const tree = buildTree(items);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-logo">Second Brain</h2>
        <button
          className="sidebar-new-btn"
          onClick={() => { setShowNewForm(!showNewForm); setNewTitle(''); setNewFolder(''); }}
          title="New item"
        >
          +
        </button>
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
            disabled={creating}
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
          </div>
          <input
            className="sidebar-new-input sidebar-folder-input"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="Folder (optional, e.g. projects/my-app)"
            disabled={creating}
          />
          <button type="submit" className="sidebar-new-submit" disabled={!newTitle.trim() || creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
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

      <div className="sidebar-tree">
        {MODES.map(mode => {
          const modeData = tree[mode.key];
          if (!modeData) return null;
          const totalItems = modeData.items.length + countFolderItems(modeData.folders);
          if (totalItems === 0 && search) return null;
          const isExpanded = expanded.has(mode.key);

          return (
            <div key={mode.key} className="tree-mode-group">
              <div
                className="tree-mode-label"
                onClick={() => toggleExpanded(mode.key)}
              >
                <span className={`tree-arrow ${isExpanded ? 'expanded' : ''}`}>›</span>
                <span className="mode-dot" style={{ background: mode.color }}></span>
                <span className="tree-mode-name">{mode.label}</span>
                <span className="tree-mode-count">{totalItems}</span>
              </div>
              {isExpanded && (
                <div className="tree-children">
                  {Object.keys(modeData.folders).map(folderKey => (
                    <FolderNode
                      key={folderKey}
                      name={folderKey}
                      node={modeData.folders[folderKey]}
                      depth={1}
                      selectedId={selectedId}
                      onSelect={onSelectItem}
                      expanded={expanded}
                      onToggle={toggleExpanded}
                    />
                  ))}
                  {modeData.items.map(item => (
                    <TreeItem
                      key={item.id}
                      item={item}
                      depth={1}
                      selectedId={selectedId}
                      onSelect={onSelectItem}
                    />
                  ))}
                  {totalItems === 0 && (
                    <div className="tree-empty" style={{ paddingLeft: '28px' }}>Empty</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="sidebar-empty">
            <div>No items yet</div>
            <div style={{ fontSize: '0.75rem', marginTop: 4 }}>Click <strong>+</strong> above to create one</div>
          </div>
        )}
      </div>
    </div>
  );
}

function countFolderItems(folders) {
  let count = 0;
  for (const key of Object.keys(folders)) {
    if (key === '_items') {
      count += folders._items.length;
    } else {
      count += (folders[key]._items || []).length;
      count += countFolderItems(folders[key].folders || {});
    }
  }
  return count;
}