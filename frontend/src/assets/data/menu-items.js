import { BsBasket, BsFolderCheck, BsGear, BsPencilSquare, BsPeople, BsStar, BsTrash, BsUiChecksGrid, BsWallet2 } from 'react-icons/bs';


//---ADMIN

//---INSTRUCTOR
export const INSTRUCTOR_APP_MENU_ITEMS = [{
  key: 'dashboard',
  label: 'Dashboard',
  url: '/instructor/dashboard'
}, {
  key: 'courses',
  label: 'My Courses',
  url: '/instructor/courses'
}, {
  key: 'students',
  label: 'Students',
  url: '/instructor/students'
}];
export const INSTRUCTOR_MENU_ITEMS = [{
  key: 'dashboard',
  label: 'Dashboard',
  icon: BsUiChecksGrid,
  url: '/instructor/dashboard',
  parentKey: 'instructor'
}, {
  key: 'courses',
  label: 'My Courses',
  icon: BsBasket,
  url: '/instructor/courses',
  parentKey: 'instructor'
}, {
  key: 'students',
  label: 'Students',
  icon: BsPeople,
  url: '/instructor/students',
  parentKey: 'instructor'
}, {
  key: 'orders',
  label: 'Orders',
  icon: BsFolderCheck,
  url: '/instructor/orders',
  parentKey: 'instructor'
}, {
  key: 'reviews',
  label: 'Reviews',
  icon: BsStar,
  url: '/instructor/reviews',
  parentKey: 'instructor'
}, {
  key: 'profile',
  label: 'My Profile',
  icon: BsPencilSquare,
  url: '/instructor/profile',
  parentKey: 'instructor'
}, {
  key: 'balance',
  label: 'Balance',
  icon: BsWallet2,
  url: '/instructor/balance',
  parentKey: 'instructor'
}, {
  key: 'settings',
  label: 'Settings',
  icon: BsGear,
  url: '/instructor/settings',
  parentKey: 'instructor'
}, {
  key: 'delete',
  label: 'Delete Profile',
  icon: BsTrash,
  url: '/instructor/delete-account',
  parentKey: 'instructor'
}];

//---STUDENT

//---OTHERS
