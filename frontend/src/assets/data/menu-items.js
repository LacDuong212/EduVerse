import { BsBasket, BsBook, BsGear, BsInfoCircle, BsPerson, BsUiChecksGrid, BsBagCheck  } from 'react-icons/bs';
import { IoWalletOutline } from 'react-icons/io5'
import { PiStudent } from 'react-icons/pi';
import { RiBook2Line } from 'react-icons/ri';

//--GUEST
export const GUEST_APP_MENU_ITEMS = [{
  key: 'home',
  label: 'Home',
  url: '/home'
}, {
  key: 'courses',
  label: 'Courses',
  url: '/courses'
}];

//---INSTRUCTOR
export const INSTRUCTOR_ACCOUNT_DROPDOWN_ITEMS = [{
  key: 'account',
  label: 'My Profile',
  icon: BsPerson,
  url: '/instructor/profile'
}, {
  key: 'earnings',
  label: 'Earnings',
  icon: IoWalletOutline,
  url: '/instructor/earnings'
}, {
  key: 'settings',
  label: 'Settings',
  icon: BsGear,
  url: '/instructor/settings'
}, {
  key: 'help',
  label: 'Help',
  icon: BsInfoCircle,
  url: '/help'
}];
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
  key: 'profile',
  label: 'My Profile',
  icon: BsPerson,
  url: '/instructor/profile',
  parentKey: 'instructor'
}, {
  key: 'dashboard',
  label: 'Dashboard',
  icon: BsUiChecksGrid,
  url: '/instructor/dashboard',
  parentKey: 'instructor'
}, {
  key: 'courses',
  label: 'My Courses',
  icon: RiBook2Line,
  url: '/instructor/courses',
  parentKey: 'instructor'
}, {
  key: 'students',
  label: 'My Students',
  icon: PiStudent,
  url: '/instructor/students',
  parentKey: 'instructor'
}, {
  key: 'earnings',
  label: 'Earnings',
  icon: IoWalletOutline,
  url: '/instructor/earnings',
  parentKey: 'instructor'
}, {
  key: 'settings',
  label: 'Settings',
  icon: BsGear,
  url: '/instructor/settings',
  parentKey: 'instructor'
}];

//---STUDENT
export const STUDENT_ACCOUNT_DROPDOWN_ITEMS = [{
  key: 'profile',
  label: 'My Profile',
  icon: BsPerson,
  url: '/student/profile'
}, {
  key: 'courses',
  label: 'My Courses',
  icon: BsBook,
  url: '/student/courses'
}, {
  key: 'orders',
  label: 'My Orders',
  icon: BsBagCheck,
  url: '/student/orders'
}, {
  key: 'settings',
  label: 'Settings',
  icon: BsGear,
  url: '/student/settings'
}
// , {
//   key: 'help',
//   label: 'Help',
//   icon: BsInfoCircle,
//   url: '/help'
// }
];
export const STUDENT_APP_MENU_ITEMS = [{
  key: 'home',
  label: 'Home',
  url: '/home'
}, {
  key: 'courses',
  label: 'Courses',
  url: '/courses'
}];
export const STUDENT_MENU_ITEMS = [{
  key: 'dashboard',
  label: 'Dashboard',
  icon: BsUiChecksGrid,
  url: '/student/dashboard',
  parentKey: 'student'
}, {
  key: 'profile',
  label: 'My Profile',
  icon: BsPerson,
  url: '/student/profile',
  parentKey: 'student'
}, 

{
  key: 'courses',
  label: 'My Courses',
  icon: BsBasket,
  url: '/student/courses',
  parentKey: 'student'
}, 
{
  
  key: 'orders',
  label: 'My Orders',
  icon: BsUiChecksGrid,
  url: '/student/orders',
  parentKey: 'student'
}, 
// {
//   key: 'payment-info',
//   label: 'Payment Info',
//   icon: BsCreditCard2Front,
//   url: '/student/payment-info',
//   parentKey: 'student'
// }, {
//   key: 'wish-list',
//   label: 'Wish List',
//   icon: BsCardChecklist,
//   url: '/student/wish-list',
//   parentKey: 'student'
// }, 
{
  key: 'settings',
  label: 'Settings',
  icon: BsGear,
  url: '/student/settings',
  parentKey: 'student'
}
// , {
//   key: 'deactivate-account',
//   label: 'Deactivate Account',
//   icon: MdDoNotDisturb,
//   url: '/student/deactivate-account',
//   parentKey: 'student'
// }
];
