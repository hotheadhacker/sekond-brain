import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const MODE_COLORS = {
  life: '#22c55e',
  learning: '#60a5fa',
  builder: '#f59e0b',
  money: '#4ade80',
  dream: '#a855f7',
};

export default function GraphView({ onNavigate }) {
  const [data, setData] = useState({ nodes: [], links: [] });
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/graph');
      const graph = await res.json();
      const nodes = graph.nodes.map(n => ({
        id: n.id,
        name: n.title || 'Untitled',
        type: n.type,
        mode: n.mode,
        color: MODE_COLORS[n.mode] || '#6c8aff',
      }));
      const links = graph.edges.map(e => ({
        source: e.source,
        target: e.target,
      }));
      setData({ nodes, links });
    }
    load();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  const handleNodeClick = (node) => {
    if (onNavigate) onNavigate(node.id);
  };

  return (
    <div className="graph-view" ref={containerRef}>
      <div className="graph-header">
        <h3>Knowledge Graph</h3>
        <div className="graph-legend">
          {Object.entries(MODE_COLORS).map(([mode, color]) => (
            <span key={mode} className="graph-legend-item">
              <span className="graph-legend-dot" style={{ background: color }}></span>
              {mode}
            </span>
          ))}
        </div>
      </div>
      <div className="graph-container">
        <ForceGraph2D
          graphData={data}
          nodeLabel="name"
          nodeColor="color"
          nodeVal={1}
          nodeRelSize={6}
          linkColor={() => '#444'}
          linkWidth={1}
          backgroundColor="#111"
          width={dimensions.width || 800}
          height={(dimensions.height || 600) - 60}
          onNodeClick={handleNodeClick}
          cooldownTicks={100}
        />
      </div>
    </div>
  );
}