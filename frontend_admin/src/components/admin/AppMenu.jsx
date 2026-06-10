import {
  findAllParent,
  findMenuItem,
  getAdminMenuItems,
  getMenuItemFromURL,
} from '@/helpers/menu';
import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';


const MenuItemWithChildren = ({
  item,
  activeMenuItems,
  itemClassName,
  linkClassName,
  openKey,
  setOpenKey,
}) => {
  const isOpen = openKey === item.key;
  const Icon = item.icon;

  // Auto-expand when a child of this item is active
  useEffect(() => {
    if (activeMenuItems?.includes(item.key)) {
      setOpenKey(item.key);
    }
  }, [activeMenuItems, item.key, setOpenKey]);

  const handleToggle = () => {
    setOpenKey(isOpen ? null : item.key);
  };

  return (
    <div className={itemClassName}>
      <div
        className={linkClassName}
        data-bs-toggle="collapse"
        role="button"
        aria-expanded={isOpen}
        onClick={handleToggle}
      >
        {Icon && <Icon className="me-2" />} {item.label}
      </div>

      <Collapse in={isOpen} className="nav flex-column">
        <div>
          {(item.children ?? []).map((child, index) => (
            <Fragment key={child.key ?? index}>
              {child.children ? (
                <MenuItemWithChildren
                  item={child}
                  activeMenuItems={activeMenuItems}
                  itemClassName={itemClassName}
                  linkClassName={clsx('nav-link', {
                    active: activeMenuItems?.includes(child.key),
                  })}
                  openKey={openKey}
                  setOpenKey={setOpenKey}
                />
              ) : (
                <MenuItem
                  item={child}
                  itemClassName="nav-item"
                  linkClassName={clsx('nav-link', {
                    active: activeMenuItems?.includes(child.key),
                  })}
                />
              )}
            </Fragment>
          ))}
        </div>
      </Collapse>
    </div>
  );
};

const MenuItem = ({ item, itemClassName, linkClassName }) => {
  const Icon = item.icon;
  return (
    <li className={itemClassName}>
      <Link
        className={linkClassName}
        to={item.url ?? ''}
        target={item.target}
      >
        {Icon && <Icon className="me-2" />} {item.label}
        {item.badge && (
          <Badge className="ms-2 rounded-circle" bg="success">
            {item.badge}
          </Badge>
        )}
      </Link>
    </li>
  );
};

const AdminMenu = () => {
  const [activeMenuItems, setActiveMenuItems] = useState([]);
  // Track which parent menu is currently open — only one at a time
  const [openKey, setOpenKey] = useState(null);
  const { pathname } = useLocation();

  const menuItems = useMemo(() => getAdminMenuItems(), []);

  const activeMenu = useCallback(() => {
    const trimmedURL = pathname;
    const matchingMenuItem = getMenuItemFromURL(menuItems, trimmedURL);

    if (matchingMenuItem) {
      const activeMt = findMenuItem(menuItems, matchingMenuItem.key);
      if (activeMt) {
        const parents = findAllParent(menuItems, activeMt);
        setActiveMenuItems([activeMt.key, ...parents]);
        // Auto-open the parent of the active item
        if (parents.length > 0) {
          setOpenKey(parents[0]);
        } else {
          // Navigated to a top-level item — collapse all sub-menus
          setOpenKey(null);
        }
      }
    }
  }, [pathname, menuItems]);

  useEffect(() => {
    activeMenu();
  }, [activeMenu]);

  return (
    <ul className="navbar-nav flex-column" style={{ minWidth: 140 }}>
      {(menuItems ?? []).map((item, idx) => {
        return (
          <Fragment key={item.key ?? idx}>
            {item.isTitle ? (
              <li className="nav-item ms-2 my-2 fw-bold text-uppercase small text-secondary">
                {item.label}
              </li>
            ) : item.children ? (
              <MenuItemWithChildren
                item={item}
                activeMenuItems={activeMenuItems}
                itemClassName="nav-item"
                linkClassName={clsx('nav-link', {
                  active: activeMenuItems.includes(item.key),
                })}
                openKey={openKey}
                setOpenKey={setOpenKey}
              />
            ) : (
              <MenuItem
                item={item}
                itemClassName="nav-item"
                linkClassName={clsx('nav-link', {
                  active: activeMenuItems.includes(item.key),
                })}
              />
            )}
          </Fragment>
        );
      })}
    </ul>
  );
};

export default AdminMenu;