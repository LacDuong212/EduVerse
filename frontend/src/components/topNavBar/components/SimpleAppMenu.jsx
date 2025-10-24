import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';


const SimpleAppMenu = ({ mobileMenuOpen, menuClassName, topMenuItems }) => {
  const [activeKey, setActiveKey] = useState(null);
  const { pathname } = useLocation();

  // find current active item
  useEffect(() => {
    const current = topMenuItems.find(
      (item) => item.url === pathname
    );
    if (current) setActiveKey(current.key);
  }, [pathname]);

  return (
    <Collapse in={mobileMenuOpen} className="navbar-collapse collapse">
      <div className="d-flex align-items-center gap-3 flex-wrap justify-content-center">
        {/* Main nav */}
        <ul className={clsx('navbar-nav d-flex flex-row gap-3', menuClassName)}>
          {topMenuItems.map((item) => (
            <li key={item.key} className="nav-item">
              <Link
                to={item.url}
                className={clsx(
                  'nav-link px-2 py-1',
                  activeKey === item.key && 'active'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search input */}
        <div className="nav my-3 my-xl-0 px-4 flex-nowrap align-items-center">
          <div className="nav-item w-100">
            <form className="position-relative">
              <input className="form-control pe-5 bg-transparent" type="search" placeholder="Search" aria-label="Search" />
              <button className="bg-transparent p-2 position-absolute top-50 end-0 translate-middle-y border-0 text-primary-hover text-reset" type="button">
                <FaSearch className="fs-6 " />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Collapse>
  );
};

export default SimpleAppMenu;
