import clsx from 'clsx';
import { useRef } from 'react';


const TopNavbar = ({ children, className }) => {
  const headerRef = useRef(null);

  return (
    <header
      ref={headerRef}
      className={clsx(
        'navbar-light sticky-top',  // ensure it sticks to the top, even on scroll
        className
      )}
      style={{
        zIndex: 99, // ensure it stays above content
      }}
    >
      <nav className="navbar navbar-expand-xl py-3 transition-all">
        {children}
      </nav>
    </header>
  );
};

export default TopNavbar;
