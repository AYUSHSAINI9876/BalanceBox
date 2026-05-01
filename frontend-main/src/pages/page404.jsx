import React from 'react';
import { useNavigate } from 'react-router-dom';
import './page404.css';

const Page404 = () => {
  const navigate = useNavigate();
  return (
    <div className="page404-container">
      <div className="page404-content">
        <div className="page404-icon">🚫</div>
        <h1 className="page404-title">404</h1>
        <div className="page404-message">Sorry, the page you are looking for does not exist.</div>
        <button className="page404-home-btn" onClick={() => navigate('/')}>
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default Page404;
