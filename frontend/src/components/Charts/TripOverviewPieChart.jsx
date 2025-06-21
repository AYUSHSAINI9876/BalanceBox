import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './TripOverviewPieChart.css';

const COLORS = ["#2563eb", "#60a5fa", "#38bdf8", "#818cf8", "#fbbf24", "#f87171"];

const TripOverviewPieChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="trip-overview-chart-empty">No data</div>;
  const total = data.reduce((sum, d) => sum + d.amount, 0) || 1;
  return (
    <div className="trip-overview-chart-box pie">
      <div className="trip-overview-chart-title">Category-wise Expense</div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#2563eb"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={v => `₹${v}`}/>
        </PieChart>
      </ResponsiveContainer>
      <div className="trip-overview-legend">
        {data.map((entry, index) => (
          <span key={entry.category} className="trip-overview-legend-item">
            <span className="trip-overview-legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
            {entry.category} ({((entry.amount / total) * 100).toFixed(0)}%)
          </span>
        ))}
      </div>
    </div>
  );
};

export default TripOverviewPieChart;
