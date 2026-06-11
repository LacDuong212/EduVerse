import { useState, useMemo } from 'react';

const getValue = (obj, key) => {
  if (typeof key === 'function') return key(obj);
  return key.split('.').reduce((o, k) => o?.[k], obj);
};

const useSortableData = (data, initialKey = null, initialDir = 'desc') => {
  const [sortKey, setSortKey] = useState(initialKey);
  const [sortDir, setSortDir] = useState(initialDir);

  const requestSort = (key) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !data) return data;
    return [...data].sort((a, b) => {
      const aVal = getValue(a, sortKey);
      const bVal = getValue(b, sortKey);

      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      // Date strings
      if (
        typeof aVal === 'string' &&
        typeof bVal === 'string' &&
        !isNaN(Date.parse(aVal)) &&
        (aVal.includes('-') || aVal.includes('T') || aVal.includes('Z'))
      ) {
        const diff = new Date(aVal) - new Date(bVal);
        return sortDir === 'asc' ? diff : -diff;
      }

      // Numbers
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }

      // Strings
      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDir]);

  return { sortedData, sortKey, sortDir, requestSort };
};

export default useSortableData;
