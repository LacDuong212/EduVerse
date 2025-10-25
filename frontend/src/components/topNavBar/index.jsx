import useScrollEvent from '@/hooks/useScrollEvent';
import clsx from 'clsx';
import { useRef } from 'react';


const TopNavbar = ({ children, className }) => {
  const { scrollY } = useScrollEvent();
  const headerRef = useRef(null);

  return (
    <>
      <header 
        ref={headerRef} 
        className={clsx(
          'navbar-light header-static', 
          className, 
          'sticky-top', // always sticky on small screens, scroll-based on large screens
          { 'navbar-sticky-on': scrollY >= 400 }
        )}
      >
        <nav 
          className="navbar navbar-expand-xl py-2 transition-all" 
          style={{ height: scrollY >= 400 }}
        >
          {children}
        </nav>
      </header>
      <div style={{ height: scrollY >= 400 ? `${headerRef.current?.offsetHeight}px` : 0 }} />
    </>
  );
};

export default TopNavbar;
