import { BsGear, BsInfoCircle, BsPeople, BsPerson, BsStar, BsUiChecksGrid, BsWallet2 } from 'react-icons/bs';
import { RiBook2Line } from 'react-icons/ri';
import { MdDoNotDisturb } from 'react-icons/md';


//---ADMIN

//---INSTRUCTOR
export const INSTRUCTOR_ACCOUNT_DROPDOWN_ITEMS = [{
  key: 'account',
  label: 'My Account',
  icon: BsPerson,
  url: '/instructor/account'

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
  key: 'account',
  label: 'Account',
  icon: BsPerson,
  url: '/instructor/account',
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
  label: 'Students',
  icon: BsPeople,
  url: '/instructor/students',
  parentKey: 'instructor'
}, {
  key: 'reviews',
  label: 'Reviews',
  icon: BsStar,
  url: '/instructor/reviews',
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
  key: 'deactivate-account',
  label: 'Deactivate Account',
  icon: MdDoNotDisturb,
  url: '/instructor/deactivate-account',
  parentKey: 'instructor'
}];

//---STUDENT

//---OTHERS
