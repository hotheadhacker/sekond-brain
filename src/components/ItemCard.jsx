import { useState } from 'react';
import { deleteItem, updateItem } from '../api';
import ProblemEditor from './ProblemEditor';

export default function ItemCard({ item, onMutate, isDream }) {
  const [showEditor, setShowEditor] = useState(false);
  const [showProblemEditor, setShowProblemEditor] = useState(false);

  const handleDelete = async () => {
    await deleteItem(item.id);
    onMutate();
  };

  const isProblem = item.type === 'problem';
  const parsedContent = (() => {
    if (isProblem) {
      try {
        return JSON.parse(item.content);
      } catch {
        return null;
      }
    }
    return null;
  })();

  const cardClass = [
    'item-card',
    isDream ? 'item-card--dream' : '',
    isProblem ? 'item-card--problem' : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={cardClass}>
        <div className="item-header">
          <span className="item-title">{item.title}</span>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {item.agent_id && (
              <span className="item-agent" title={`Agent: ${item.agent_id}`}>
                &#129302;
              </span>
            )}
            <span className={`item-type-badge item-type-badge--${item.type}`}>
              {item.type}
            </span>
          </div>
        </div>

        {isProblem && parsedContent ? (
          <div className="item-content">
            {parsedContent.problem && (
              <div><strong>Problem:</strong> {parsedContent.problem}</div>
            )}
            {parsedContent.action && (
              <div><strong>Action:</strong> {parsedContent.action}</div>
            )}
          </div>
        ) : item.content ? (
          <div className="item-content">
            {item.content.length > 200
              ? item.content.slice(0, 200) + '...'
              : item.content}
          </div>
        ) : null}

        <div className="item-meta">
          <div className="item-tags">
            {item.tags.map((tag) => (
              <span key={tag} className="item-tag">{tag}</span>
            ))}
          </div>
          <div className="item-actions">
            {isProblem && (
              <button
                className="btn-icon"
                onClick={() => setShowProblemEditor(true)}
                title="Edit problem"
              >
                &#9776;
              </button>
            )}
            <button
              className="btn-icon"
              onClick={() => setShowEditor(!showEditor)}
              title="Edit"
            >
              &#9998;
            </button>
            <button
              className="btn-icon btn-icon--danger"
              onClick={handleDelete}
              title="Delete"
            >
              &#10005;
            </button>
          </div>
        </div>
      </div>

      {showEditor && (
        <EditModal
          item={item}
          onClose={() => { setShowEditor(false); onMutate(); }}
        />
      )}

      {showProblemEditor && (
        <ProblemEditor
          item={item}
          onClose={() => { setShowProblemEditor(false); onMutate(); }}
        />
      )}
    </>
  );
}

function EditModal({ item, onClose }) {
  const [title, setTitle] = useState(item.title);
  const [content, setContent] = useState(item.content);
  const [type, setType] = useState(item.type);
  const [mode, setMode] = useState(item.mode);
  const [tags, setTags] = useState(item.tags.join(', '));

  const handleSave = async () => {
    await updateItem(item.id, {
      title,
      content,
      type,
      mode,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Edit Item</h2>
        <div className="modal-field">
          <label>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="note">Note</option>
            <option value="task">Task</option>
            <option value="idea">Idea</option>
            <option value="goal">Goal</option>
            <option value="problem">Problem</option>
            <option value="dream">Dream</option>
          </select>
        </div>
        <div className="modal-field">
          <label>Content</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} />
        </div>
        <div className="modal-field">
          <label>Mode</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="life">Life</option>
            <option value="learning">Learning</option>
            <option value="builder">Builder</option>
            <option value="money">Money</option>
            <option value="dream">Dream</option>
          </select>
        </div>
        <div className="modal-field">
          <label>Tags (comma-separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}