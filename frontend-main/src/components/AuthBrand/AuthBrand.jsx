import React from 'react';

/**
 * The BalanceBox lockup used at the top of the auth screens: circular mark
 * followed by the wordmark, with the second half of the name de-emphasised.
 */
const AuthBrand = () => (
  <div className="login-logo-container">
    <img src="/BalanceBox.svg" alt="" aria-hidden="true" className="login-logo" />
    <span className="login-logo-wordmark">
      Balance<span className="wordmark-accent">Box</span>
    </span>
  </div>
);

export default AuthBrand;
