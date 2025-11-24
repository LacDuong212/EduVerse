import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';


const SimpleAppMenu = ({ mobileMenuOpen, menuClassName, topMenuItems }) => {
  const [activeKey, setActiveKey] = useState(null);
  const { pathname } = useLocation();

  topMenuItems = topMenuItems || [];

  const current = useMemo(() => {
    return (
      topMenuItems.find(item => item.url === pathname) ||
      topMenuItems.find(item => pathname.startsWith(item.url))
    );
  }, [pathname, topMenuItems]);

  useEffect(() => {
    if (current) setActiveKey(current.key);
    else setActiveKey(null);
  }, [current]);

  return (
    <Collapse in={mobileMenuOpen} className="navbar-collapse collapse mx-3 rounded-3">
      <div>
        {/* Main nav */}
        <ul className={clsx('nav d-flex flex-row gap-3 py-2 justify-content-center', menuClassName)}>
          {topMenuItems.map((item) => (
            <li key={item.key} className="nav-item">
              <Link
                to={item.url}
                className={clsx(
                  'nav-link fw-medium px-2 py-1',
                  activeKey === item.key && 'active text-primary'
                )}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Collapse>
  );
};

export default SimpleAppMenu;
