import React from 'react';
import './RouteFallback.css';

const RouteFallback = () => (
  <div className="route-fallback" role="status" aria-live="polite">
    <div className="route-fallback-spinner" />
    <div className="route-fallback-text">Loading…</div>
  </div>
);

export default RouteFallback;
