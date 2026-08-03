import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './HomePieChart.css';

const COLORS = ["#2563eb", "#60a5fa", "#38bdf8", "#818cf8", "#fbbf24", "#f87171"];

const HomePieChart = ({ data = [], loading }) => {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <div className="home-chart-box home-piechart-box">
      <div className="home-chart-title">Category-wise Expense</div>
      {loading ? <div className="home-chart-loading">Loading…</div> :
        data.length === 0 ? <div className="home-chart-empty">No data yet</div> :
        <div className="home-piechart-inner">
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={v => `₹${Math.round(v).toLocaleString('en-IN')}`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="home-chart-legend">
            {data.map((entry, index) => (
              <span key={entry.name} className="home-chart-legend-item">
                <span className="home-chart-legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({total ? ((entry.value / total) * 100).toFixed(0) : 0}%)
              </span>
            ))}
          </div>
        </div>
      }
    </div>
  );
};

export default HomePieChart;
