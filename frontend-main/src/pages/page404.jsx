import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CompassIcon } from '../components/Icons/Icons';
import './page404.css';

const Page404 = () => {
  const navigate = useNavigate();
  return (
    <div className="page404-container">
      <div className="page404-content">
        <div className="page404-brand">
          <img src="/BalanceBox.svg" alt="" aria-hidden="true" className="page404-logo" />
          <span className="page404-wordmark">BalanceBox</span>
        </div>
        <div className="page404-icon" aria-hidden="true">
          <CompassIcon />
        </div>
        <h1 className="page404-title">404</h1>
        <div className="page404-message">
          We couldn't find that page. It may have moved, or the link might be wrong.
        </div>
        <button className="page404-home-btn" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default Page404;
