import { Routes, Route, NavLink } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Capture from './components/Capture';
import Inbox from './components/Inbox';
import ModeView from './components/ModeView';
import FocusView from './components/FocusView';
import DreamLayer from './components/DreamLayer';

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  return (
    <div className="app">
      <header className="header">
        <h1 className="logo">Second Brain</h1>
        <nav className="nav">
          <NavLink to="/" end className="nav-link">Inbox</NavLink>
          <NavLink to="/modes" className="nav-link">Modes</NavLink>
          <NavLink to="/focus" className="nav-link">Focus</NavLink>
          <NavLink to="/dream" className="nav-link nav-link--dream">Dream</NavLink>
        </nav>
      </header>
      <div className="capture-bar">
        <Capture onCreated={refresh} />
      </div>
      <main className="main">
        <Routes>
          <Route path="/" element={<Inbox refreshKey={refreshKey} onMutate={refresh} />} />
          <Route path="/modes" element={<ModeView refreshKey={refreshKey} onMutate={refresh} />} />
          <Route path="/focus" element={<FocusView refreshKey={refreshKey} onMutate={refresh} />} />
          <Route path="/dream" element={<DreamLayer refreshKey={refreshKey} onMutate={refresh} />} />
        </Routes>
      </main>
    </div>
  );
}