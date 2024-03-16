import React, { useState } from 'react';
import './SideNavigation.css';

const SideNavigation = ({ onSort }) => {
  const [selectedSort, setSelectedSort] = useState(null);

  const handleSort = (sortKey, sortOrder = '') => {
    setSelectedSort(sortKey + sortOrder);
    onSort(sortKey, sortOrder);
  };

  return (
    <div className="side-navigation">
      <h3>Sort By</h3>
      <hr></hr>
      <button
        className={selectedSort === 'datedesc' ? 'selected' : ''}
        onClick={() => handleSort('date', 'desc')}
      >
        Newest
      </button>
      <button
        className={selectedSort === 'dateasc' ? 'selected' : ''}
        onClick={() => handleSort('date', 'asc')}
      >
        Oldest
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
