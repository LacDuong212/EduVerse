import useScrollEvent from '@/hooks/useScrollEvent';
import clsx from 'clsx';
import { useRef } from 'react';


const TopNavbar = ({ children, className }) => {
  const { scrollY } = useScrollEvent();
  const headerRef = useRef(null);

  return (
    <>
      <header ref={headerRef} className={clsx('navbar-light navbar-sticky header-static', className, { 'navbar-sticky-on': scrollY >= 400 })}>
        <nav className="navbar navbar-expand-xl transition-all" style={{ height: scrollY >= 400 }}>
          {children}
        </nav>
      </header>
      <div style={{ height: scrollY >= 400 ? `${headerRef.current?.offsetHeight}px` : 0 }} />
    </>
  );
};

export default TopNavbar;
