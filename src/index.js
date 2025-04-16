import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Add this line to ensure theme works when app loads
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 