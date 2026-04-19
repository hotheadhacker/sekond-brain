import { useState, useEffect } from 'react';
import { fetchBacklinks, fetchOutlinks } from '../api';

export default function BacklinksPanel({ itemId, onNavigate }) {
  const [backlinks, setBacklinks] = useState([]);
  const [outlinks, setOutlinks] = useState([]);

  useEffect(() => {
    if (!itemId) return;
    fetchBacklinks(itemId).then(setBacklinks);
    fetchOutlinks(itemId).then(setOutlinks);
  }, [itemId]);

  if (!itemId) return null;

  return (
    <div className="backlinks-panel">
      <div className="panel-section">
        <h4 className="panel-heading">Backlinks ({backlinks.length})</h4>
        {backlinks.length === 0 ? (
          <div className="panel-empty">No items link here</div>
        ) : (
          <div className="panel-links">
            {backlinks.map(link => (
              <div key={link.id} className="panel-link" onClick={() => onNavigate(link.source_id)}>
                <span className={`panel-link-type type-${link.type}`}>{typeIcon(link.type)}</span>
                <span className="panel-link-title">{link.title}</span>
                <span className="panel-link-context">{link.context}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="panel-section">
        <h4 className="panel-heading">Outgoing ({outlinks.length})</h4>
        {outlinks.length === 0 ? (
          <div className="panel-empty">No outgoing links</div>
        ) : (
          <div className="panel-links">
            {outlinks.map(link => (
              <div key={link.id} className="panel-link" onClick={() => onNavigate(link.target_id)}>
                <span className={`panel-link-type type-${link.type}`}>{typeIcon(link.type)}</span>
                <span className="panel-link-title">{link.title}</span>
                <span className="panel-link-context">{link.context}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function typeIcon(type) {
  const icons = { note: '\u{1F4DD}', task: '\u2611', idea: '\u{1F4A1}', goal: '\u{1F3AF}', problem: '\u26A0', dream: '\u2728' };
  return icons[type] || '\u{1F4DD}';
}