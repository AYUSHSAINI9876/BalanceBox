import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import './HomePieChart.css';
import fetchWithAuth from '../../utils/fetchWihAuth';

const API_BASE = 'https://splitmate-zqda.onrender.com';
const COLORS = ["#2563eb", "#60a5fa", "#38bdf8", "#818cf8", "#fbbf24", "#f87171"];

const HomePieChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/users/categorySummary`);
        const json = await res.json();
        const arr = Object.entries(json.categorySummary || {}).map(([name, value], i) => ({
          name,
          value,
        }));
        setData(arr);
      } catch (err) {
        setData([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="home-chart-box home-piechart-box">
      <div className="home-chart-title">Category-wise Expense</div>
      {loading ? <div className="home-chart-loading">Loading...</div> :
        data.length === 0 ? <div className="home-chart-empty">No data</div> :
        <div style={{ width: '100%', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="home-chart-legend" style={{marginTop: 12}}>
            {data.map((entry, index) => (
              <span key={entry.name} className="home-chart-legend-item">
                <span className="home-chart-legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({((entry.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0)}%)
              </span>
            ))}
          </div>
        </div>
      }
    </div>
  );
};

export default HomePieChart;
