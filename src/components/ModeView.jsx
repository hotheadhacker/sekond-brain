import { useEffect, useState } from 'react';
import { fetchItems } from '../api';
import ItemCard from './ItemCard';

const MODES = [
  { key: '', label: 'All' },
  { key: 'life', label: 'Life' },
  { key: 'learning', label: 'Learning' },
  { key: 'builder', label: 'Builder' },
  { key: 'money', label: 'Money' },
  { key: 'dream', label: 'Dream' },
];

export default function ModeView({ refreshKey, onMutate }) {
  const [mode, setMode] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    const filters = {};
    if (mode) filters.mode = mode;
    fetchItems(filters).then(setItems);
  }, [refreshKey, mode]);

  return (
    <div>
      <h2 className="section-title">Modes</h2>
      <div className="mode-selector">
        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-btn ${m.key === 'dream' ? 'mode-btn--dream' : ''} ${mode === m.key ? 'active' : ''}`}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">Modes</div>
          <div className="empty-state-text">No items in this mode yet.</div>
        </div>
      ) : (
        <div className="item-list">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onMutate={onMutate} />
          ))}
        </div>
      )}
    </div>
  );
}