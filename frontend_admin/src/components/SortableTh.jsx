import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

/**
 * A <th> that shows a sort arrow on hover, or always when active.
 *
 * Props:
 *  - label        : string — visible column label
 *  - sortKey      : string — key passed to onSort / compared with currentSortKey
 *  - currentSortKey : string | null
 *  - currentDir   : 'asc' | 'desc'
 *  - onSort       : (key: string) => void
 *  - className    : extra classes forwarded to <th>
 */
const SortableTh = ({ label, sortKey, currentSortKey, currentDir, onSort, className = '', ...rest }) => {
  const isActive = currentSortKey === sortKey;

  return (
    <th
      scope="col"
      className={`sort-th${isActive ? ' sort-th--active' : ''} ${className}`}
      onClick={() => onSort(sortKey)}
      style={{ cursor: 'pointer', userSelect: 'none' }}
      {...rest}
    >
      <span className="d-inline-flex align-items-center gap-1">
        {label}
        <span className="sort-icon">
          {isActive
            ? (currentDir === 'asc' ? <FaArrowUp size={11} /> : <FaArrowDown size={11} />)
            : <FaArrowDown size={11} />}
        </span>
      </span>
    </th>
  );
};

export default SortableTh;
