import React, { useMemo, useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import HomeCards from '../../components/Cards/HomeCards';
import HomePieChart from '../../components/Charts/HomePieChart';
import HomeBarChart from '../../components/Charts/HomeBarChart';
import fetchWithAuth, { API_BASE } from '../../utils/fetchWihAuth';
import './Home.css';

const QUOTES = [
  "Adventure is worthwhile.",
  "Travel is the only thing you buy that makes you richer.",
  "Jobs fill your pocket, but adventures fill your soul.",
  "Life is short and the world is wide.",
  "To travel is to live.",
  "The journey, not the arrival, matters.",
  "Collect moments, not things.",
  "Travel far enough, you meet yourself.",
  "Wander often, wonder always.",
  "Let’s find some beautiful place to get lost.",
  "Take only memories, leave only footprints.",
  "Adventure may hurt you, but monotony will kill you."
];

const Home = () => {
  const randomQuote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // One request feeds the cards and both charts.
  useEffect(() => {
    let cancelled = false;

    async function fetchDashboard() {
      setLoading(true);
      setError('');
      try {
        const res = await fetchWithAuth(`${API_BASE}/api/users/dashboard`);
        if (!res.ok) throw new Error('Could not load your dashboard');
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();
    return () => { cancelled = true; };
  }, []);

  const categoryData = useMemo(() => {
    if (!data?.categorySummary) return [];
    return Object.entries(data.categorySummary).map(([name, value]) => ({ name, value }));
  }, [data]);

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="home-main-content">
        <div className="home-quote-box">{randomQuote}</div>
        {error && <div className="home-error" role="alert">{error}</div>}
        <HomeCards
          loading={loading}
          totalTrips={data?.totalTrips}
          totalExpense={data?.totalExpense}
          totalFriends={data?.totalFriends}
        />
        <div className="home-charts-row">
          <HomePieChart data={categoryData} loading={loading} />
          <HomeBarChart data={data?.recentTrips || []} loading={loading} />
        </div>
      </main>
    </div>
  );
};

export default Home;
