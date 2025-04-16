import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import '../styles/ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <input
        type="checkbox"
        id="theme-toggle"
        className="theme-toggle-input"
        onChange={toggleTheme}
        checked={theme === 'dark'}
      />
      <label htmlFor="theme-toggle" className="theme-toggle-label">
        <span className="theme-toggle-icon">
          {theme === 'dark' ? <FaMoon /> : <FaSun />}
        </span>
        <span className="theme-toggle-text">
          {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
        </span>
      </label>
    </div>
  );
};

export default ThemeToggle; 