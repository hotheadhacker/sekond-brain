import { useState } from 'react';
import { updateItem } from '../api';

export default function ProblemEditor({ item, onClose }) {
  const parseContent = () => {
    try {
      return JSON.parse(item.content);
    } catch {
      return {
        problem: '',
        why: '',
        solutions: '',
        action: '',
        outcome: '',
      };
    }
  };

  const [fields, setFields] = useState(parseContent);

  const handleChange = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    await updateItem(item.id, { content: JSON.stringify(fields) });
    onClose();
  };

  const labels = [
    { key: 'problem', label: 'Problem' },
    { key: 'why', label: 'Why it exists' },
    { key: 'solutions', label: 'Possible solutions' },
    { key: 'action', label: 'Chosen action' },
    { key: 'outcome', label: 'Outcome' },
  ];

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Problem-Solving</h2>
        {labels.map(({ key, label }) => (
          <div className="modal-field" key={key}>
            <label>{label}</label>
            {key === 'solutions' ? (
              <textarea
                value={fields[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                rows={4}
              />
            ) : (
              <input
                value={fields[key]}
                onChange={(e) => handleChange(key, e.target.value)}
              />
            )}
          </div>
        ))}
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}