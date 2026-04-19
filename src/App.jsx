import { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import BacklinksPanel from './components/BacklinksPanel';
import GraphView from './components/GraphView';
import CommandPalette from './components/CommandPalette';
import Capture from './components/Capture';
import ProblemEditor from './components/ProblemEditor';
import { fetchItem } from './api';

export default function App() {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showGraph, setShowGraph] = useState(false);
  const [showProblemEditor, setShowProblemEditor] = useState(false);
  const [sidePanelCollapse, setSidePanelCollapse] = useState(false);
  const [rightPanelCollapse, setRightPanelCollapse] = useState(false);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const handleSelectItem = useCallback(async (id) => {
    const item = await fetchItem(id);
    setSelectedId(id);
    setSelectedItem(item);
    setShowGraph(false);
  }, []);

  const handleNavigate = useCallback((id) => {
    handleSelectItem(id);
  }, [handleSelectItem]);

  const handleMutate = useCallback(() => {
    refresh();
    if (selectedId) {
      fetchItem(selectedId).then(setSelectedItem);
    }
  }, [refresh, selectedId]);

  const handleCreated = useCallback(async (id) => {
    refresh();
    const item = await fetchItem(id);
    setSelectedId(id);
    setSelectedItem(item);
    setShowGraph(false);
  }, [refresh]);

  return (
    <div className="app-layout">
      <CommandPalette onSelectItem={handleSelectItem} onNavigate={handleNavigate} onGraphView={() => setShowGraph(true)} />

      <div className={`left-panel ${sidePanelCollapse ? 'collapsed' : ''}`}>
        <button className="panel-toggle left-toggle" onClick={() => setSidePanelCollapse(!sidePanelCollapse)}>
          {sidePanelCollapse ? '\u203A' : '\u2039'}
        </button>
        {!sidePanelCollapse && (
          <Sidebar
            onSelectItem={handleSelectItem}
            selectedId={selectedId}
            onMutate={handleMutate}
            refreshKey={refreshKey}
          />
        )}
      </div>

      <div className="center-panel">
        <Capture onCreated={handleCreated} />
        {showGraph ? (
          <GraphView onNavigate={handleNavigate} />
        ) : selectedItem ? (
          <div className="editor-wrapper">
            <Editor
              key={selectedItem.id}
              item={selectedItem}
              items={[]}
              onUpdate={handleMutate}
              onNavigate={handleNavigate}
            />
            {selectedItem.type === 'problem' && (
              <div className="problem-editor-trigger">
                <button className="btn btn-secondary" onClick={() => setShowProblemEditor(true)}>
                  Open Problem Framework
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state-main">
            <div className="empty-state-icon-lg">Second Brain</div>
            <div className="empty-state-desc">
              Select an item from the sidebar, use the capture bar above, or press <kbd>Ctrl+P</kbd> to search and create.
            </div>
            <div className="empty-state-hint">
              Use <strong>t:</strong> for tasks, <strong>n:</strong> for notes, <strong>i:</strong> for ideas
            </div>
          </div>
        )}
      </div>

      <div className={`right-panel ${rightPanelCollapse ? 'collapsed' : ''}`}>
        <button className="panel-toggle right-toggle" onClick={() => setRightPanelCollapse(!rightPanelCollapse)}>
          {rightPanelCollapse ? '\u2039' : '\u203A'}
        </button>
        {!rightPanelCollapse && selectedItem && (
          <>
            <div className="right-panel-section">
              <h4 className="panel-heading">Properties</h4>
              <div className="prop-row"><span>Type</span><span className={`meta-badge type-${selectedItem.type}`}>{selectedItem.type}</span></div>
              <div className="prop-row"><span>Mode</span><span className={`meta-badge mode-${selectedItem.mode}`}>{selectedItem.mode}</span></div>
              <div className="prop-row"><span>Status</span><span className={`status-badge status-${selectedItem.status}`}>{selectedItem.status}</span></div>
              <div className="prop-row"><span>Created</span><span className="prop-value">{new Date(selectedItem.createdAt).toLocaleDateString()}</span></div>
              <div className="prop-row"><span>Updated</span><span className="prop-value">{new Date(selectedItem.updatedAt).toLocaleDateString()}</span></div>
              {selectedItem.tags.length > 0 && (
                <div className="prop-tags">
                  {selectedItem.tags.map(tag => <span key={tag} className="prop-tag">{tag}</span>)}
                </div>
              )}
            </div>
            <BacklinksPanel itemId={selectedId} onNavigate={handleNavigate} />
          </>
        )}
        {!rightPanelCollapse && !selectedItem && (
          <div className="right-panel-empty">
            <p>Select an item to see properties and links</p>
          </div>
        )}
      </div>

      {showProblemEditor && selectedItem && (
        <ProblemEditor
          item={selectedItem}
          onClose={() => { setShowProblemEditor(false); handleMutate(); }}
        />
      )}
    </div>
  );
}