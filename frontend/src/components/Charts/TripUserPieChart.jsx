import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import './TripUserPieChart.css';

const COLORS = ["#2563eb", "#60a5fa", "#38bdf8", "#818cf8", "#fbbf24", "#f87171"];

const TripUserPieChart = () => {
  const { tripId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const token = localStorage.getItem('token');
      try {
        const res = await fetch(`/api/trips/${tripId}/user/category-expenses`, { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        setData(json.categories || []);
      } catch {
        setData([]);
      }
      setLoading(false);
    }
    fetchData();
  }, [tripId]);

  const total = data.reduce((sum, d) => sum + d.amount, 0) || 1;

  return (
    <div className="trip-user-piechart-box">
      <div className="trip-user-piechart-title">Your Category-wise Expense</div>
      {loading ? <div className="trip-user-piechart-loading">Loading...</div> :
        data.length === 0 ? <div className="trip-user-piechart-empty">No data</div> :
        <>
          <ResponsiveContainer width={220} height={220}>
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
          <div className="trip-user-piechart-legend">
            {data.map((entry, index) => (
              <span key={entry.category} className="trip-user-piechart-legend-item">
                <span className="trip-user-piechart-legend-color" style={{ background: COLORS[index % COLORS.length] }}></span>
                {entry.category} ({((entry.amount / total) * 100).toFixed(0)}%)
              </span>
            ))}
          </div>
        </>
      }
    </div>
  );
};

export default TripUserPieChart;
