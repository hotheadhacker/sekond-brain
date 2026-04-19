import { useEffect, useState } from 'react';
import { fetchItems, createItem } from '../api';
import ItemCard from './ItemCard';

export default function DreamLayer({ refreshKey, onMutate }) {
  const [items, setItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    fetchItems({ type: 'dream' }).then(setItems);
  }, [refreshKey]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await createItem({
      type: 'dream',
      title: title.trim(),
      content: content.trim(),
      mode: 'dream',
      tags: [],
    });
    setTitle('');
    setContent('');
    setShowAdd(false);
    onMutate();
  };

  return (
    <div>
      <div className="dream-hero">
        <h2>Dream Layer</h2>
        <p>Your north star. What you're building toward.</p>
        <button
          className="dream-add-btn"
          onClick={() => setShowAdd(!showAdd)}
        >
          {showAdd ? 'Cancel' : '+ Add Dream'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} style={{ marginBottom: 20 }}>
          <div className="modal-field">
            <label>Dream title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you dream of?"
              autoFocus
            />
          </div>
          <div className="modal-field">
            <label>Description</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe your dream in detail..."
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Add Dream
          </button>
        </form>
      )}

      {items.length === 0 && !showAdd ? (
        <div className="empty-state">
          <div className="empty-state-text">No dreams yet. Start dreaming big.</div>
        </div>
      ) : (
        <div className="item-list">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onMutate={onMutate} isDream />
          ))}
        </div>
      )}
    </div>
  );
}