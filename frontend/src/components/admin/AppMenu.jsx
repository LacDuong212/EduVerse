import { findAllParent, findMenuItem, getAdminMenuItems, getMenuItemFromURL } from '@/helpers/menu';
import useToggle from '@/hooks/useToggle';
import clsx from 'clsx';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Badge, Collapse } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
const MenuItemWithChildren = ({
  item,
  activeMenuItems,
  itemClassName,
  linkClassName
}) => {
  const {
    isTrue: isOpen,
    toggle
  } = useToggle();
  const Icon = item.icon;
  return <div className={itemClassName}>
      <div className={linkClassName} data-bs-toggle="collapse" role="button" aria-expanded={isOpen} onClick={() => toggle()}>
        {Icon && <Icon className="me-2" />} {item.label}
      </div>

      <Collapse in={isOpen} className="nav flex-column">
        <div>
          {(item.children ?? []).map((child, index) => <Fragment key={index + child.key + index}>
              {child.children ? <MenuItemWithChildren item={child} activeMenuItems={activeMenuItems} itemClassName={itemClassName} linkClassName={clsx('nav-link', {
            active: activeMenuItems?.includes(child.key)
          })} /> : <MenuItem item={child} itemClassName="nav-item" linkClassName={clsx('nav-link', {
            active: activeMenuItems?.includes(child.key)
          })} />}
            </Fragment>)}
        </div>
      </Collapse>
    </div>;
};
const MenuItem = ({
  item,
  itemClassName,
  linkClassName
}) => {
  const Icon = item.icon;
  return <li className={itemClassName}>
      <Link className={linkClassName} to={item.url ?? ''} target={item.target}>
        {Icon && <Icon className="me-2" />} {item.label}
        {item.badge && <Badge className="ms-2 rounded-circle" bg="success">
            {item.badge}
          </Badge>}
      </Link>
    </li>;
};
const AdminMenu = () => {
  const [activeMenuItems, setActiveMenuItems] = useState([]);
  const menuItems = getAdminMenuItems();
  const {
    pathname
  } = useLocation();

  const activeMenu = useCallback(() => {
    const trimmedURL = pathname?.replaceAll('', '');
    const matchingMenuItem = getMenuItemFromURL(menuItems, trimmedURL);
    if (matchingMenuItem) {
      const activeMt = findMenuItem(menuItems, matchingMenuItem.key);
      if (activeMt) {
        setActiveMenuItems([activeMt.key, ...findAllParent(menuItems, activeMt)]);
      }
    }
  }, [pathname, menuItems]);
  useEffect(() => {
    activeMenu();
  }, [activeMenu, menuItems]);
  return <ul className="navbar-nav flex-column">
      {(menuItems ?? []).map((item, idx) => {
      return <Fragment key={idx + item.key}>
            {item.isTitle ? <li className="nav-item ms-2 my-2">{item.label}</li> : item.children ? <MenuItemWithChildren item={item} activeMenuItems={activeMenuItems} itemClassName="nav-item" linkClassName={clsx('nav-link', {
          active: activeMenuItems.includes(item.key)
        })} /> : <MenuItem item={item} activeMenuItems={activeMenuItems} itemClassName="nav-item" linkClassName={clsx('nav-link', {
          active: activeMenuItems.includes(item.key)
        })} />}
          </Fragment>;
    })}
    </ul>;
};
export default AdminMenu;
