import { useEffect, useState } from 'react';
import { fetchItems } from '../api';
import ItemCard from './ItemCard';

export default function FocusView({ refreshKey, onMutate }) {
  const [tasks, setTasks] = useState([]);
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    fetchItems({ type: 'task' }).then(setTasks);
    fetchItems({ type: 'problem' }).then(setProblems);
  }, [refreshKey]);

  return (
    <div>
      <div className="focus-section">
        <div className="focus-section-header">
          Tasks <span>{tasks.length}</span>
        </div>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">No tasks. Add one with t: in the capture bar.</div>
          </div>
        ) : (
          <div className="item-list">
            {tasks.map((item) => (
              <ItemCard key={item.id} item={item} onMutate={onMutate} />
            ))}
          </div>
        )}
      </div>

      <div className="focus-section">
        <div className="focus-section-header">
          Problems <span>{problems.length}</span>
        </div>
        {problems.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-text">No problems tracked. Change type to "problem" to track decisions.</div>
          </div>
        ) : (
          <div className="item-list">
            {problems.map((item) => (
              <ItemCard key={item.id} item={item} onMutate={onMutate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}