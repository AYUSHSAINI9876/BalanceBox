import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './TripOverviewBarChart.css';

const COLORS = ["#2563eb", "#60a5fa", "#38bdf8", "#818cf8", "#fbbf24", "#f87171"];

const TripOverviewBarChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="trip-overview-chart-empty">No data</div>;
  return (
    <div className="trip-overview-chart-box bar">
      <div className="trip-overview-chart-title">Member-wise Expense</div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 30 }}>
          <XAxis dataKey="memberName" tick={{ fontSize: 13, fill: '#2563eb', fontWeight: 600 }} interval={0} angle={-15} dy={10} height={50}/>
          <YAxis tick={{ fontSize: 13, fill: '#2563eb', fontWeight: 600 }} />
          <Tooltip formatter={v => `₹${v}`}/>
          <Bar dataKey="totalExpenseByThatMember" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TripOverviewBarChart;
