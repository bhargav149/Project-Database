import React, { useState } from 'react';
import './SideNavigation.css';

const SideNavigation = ({ onSort, theme }) => {
  const [selectedSort, setSelectedSort] = useState(null);

  const handleSort = (sortKey, sortOrder = '') => {
    setSelectedSort(sortKey + sortOrder);
    onSort(sortKey, sortOrder);
  };

  const themeClass = theme === 'dark' ? 'dark-theme' : 'light-theme';

  return (
    <div className={`side-navigation ${themeClass}`}>
      <h3>Sort By</h3>
      <hr></hr>
      <button
        className={selectedSort === 'semesterasc' ? 'selected' : ''}
        onClick={() => handleSort('semester', 'asc')}
      >
        Semester ↑
      </button>
      <button
        className={selectedSort === 'semesterdesc' ? 'selected' : ''}
        onClick={() => handleSort('semester', 'desc')}
      >
        Semester ↓
      </button>
      <button
        className={selectedSort === 'status' ? 'selected' : ''}
        onClick={() => handleSort('status')}
      >
        Status
      </button>
    </div>
  );
};

export default SideNavigation;
