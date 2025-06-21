import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './HomeBarchart.css';
import fetchWithAuth from '../../utils/fetchWihAuth';

const API_BASE = 'https://splitmate-zqda.onrender.com';
const COLORS = ["#2563eb", "#60a5fa", "#38bdf8", "#818cf8", "#fbbf24", "#f87171"];

const HomeBarChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/users/recentTripsSummary`);
        const json = await res.json();
        setData(json.summary || []);
      } catch (err) {
        setData([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <div className="home-chart-box home-barchart-box">
      <div className="home-chart-title">Recent Trips Expense Comparison</div>
      {loading ? <div className="home-chart-loading">Loading...</div> :
        data.length === 0 ? <div className="home-chart-empty">No data</div> :
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
            <XAxis dataKey="tripTitle" tick={{ fontSize: 13, fill: '#2563eb', fontWeight: 600 }} interval={0} angle={-15} dy={10} height={50}/>
            <YAxis tick={{ fontSize: 13, fill: '#2563eb', fontWeight: 600 }} />
            <Tooltip formatter={v => `₹${Math.round(v)}`}/>
            <Bar dataKey="totalUserExpense" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      }
    </div>
  );
};

export default HomeBarChart;
