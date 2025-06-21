import React, { useMemo } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import HomeCards from '../../components/Cards/HomeCards';
import HomePieChart from '../../components/Charts/HomePieChart';
import HomeBarChart from '../../components/Charts/HomeBarChart';
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

  return (
    <div className="home-layout">
      <Sidebar />
      <main className="home-main-content">
        <div className="home-quote-box">{randomQuote}</div>
        <HomeCards />
        <div className="home-charts-row">
          <HomePieChart />
          <HomeBarChart />
        </div>
      </main>
    </div>
  );
};

export default Home;
