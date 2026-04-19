import { useEffect, useState, useRef } from 'react';
import { fetchItems } from '../api';
import ItemCard from './ItemCard';

export default function Inbox({ refreshKey, onMutate }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const timer = useRef(null);

  useEffect(() => {
    const filters = {};
    if (search.trim()) filters.q = search.trim();
    fetchItems(filters).then(setItems);
  }, [refreshKey, search]);

  const handleSearchChange = (e) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSearch(e.target.value), 200);
  };

  return (
    <div>
      <h2 className="section-title">
        Inbox <span className="section-subtitle">{items.length} items</span>
      </h2>
      <input
        className="search-input"
        type="text"
        placeholder="Search..."
        defaultValue={search}
        onChange={handleSearchChange}
      />
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">Inbox</div>
          <div className="empty-state-text">
            {search ? 'No results found.' : 'Capture your first thought above.'}
          </div>
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