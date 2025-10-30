import { BsBasket, BsCardChecklist, BsCreditCard2Front, BsGear, BsInfoCircle, BsPencilSquare, BsPeople, BsPerson, BsQuestionDiamond, BsTrash, BsStar, BsUiChecksGrid, BsWallet2 } from 'react-icons/bs';
import { FaRegFileAlt } from 'react-icons/fa';
import { MdDoNotDisturb } from 'react-icons/md';
import { RiBook2Line } from 'react-icons/ri';


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
export const STUDENT_ACCOUNT_DROPDOWN_ITEMS = [{
  key: 'account',
  label: 'My Account',
  icon: BsPerson,
  url: '/student/account'

}, {
  key: 'settings',
  label: 'Settings',
  icon: BsGear,
  url: '/student/settings'
}, {
  key: 'help',
  label: 'Help',
  icon: BsInfoCircle,
  url: '/help'
}];
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
  key: 'subscriptions',
  label: 'My Subscriptions',
  icon: BsCardChecklist,
  url: '/student/subscription',
  parentKey: 'student'
}, {
  key: 'courses',
  label: 'My Courses',
  icon: BsBasket,
  url: '/student/course-list',
  parentKey: 'student'
}, {
  key: 'resume',
  label: 'Course Resume',
  icon: FaRegFileAlt,
  url: '/student/course-resume',
  parentKey: 'student'
}, {
  key: 'quiz',
  label: 'Quiz',
  icon: BsQuestionDiamond,
  url: '/student/quiz',
  parentKey: 'student'
}, {
  key: 'paymentInfo',
  label: 'Payment Info',
  icon: BsCreditCard2Front,
  url: '/student/payment-info',
  parentKey: 'student'
}, {
  key: 'wishlist',
  label: 'Wishlist',
  icon: BsCardChecklist,
  url: '/student/bookmark',
  parentKey: 'student'
}, {
  key: 'profile',
  label: 'Edit Profile',
  icon: BsPencilSquare,
  url: '/student/edit-profile',
  parentKey: 'student'
}, {
  key: 'setting',
  label: 'Setting',
  icon: BsGear,
  url: '/student/setting',
  parentKey: 'student'
}, {
  key: 'delete',
  label: 'Delete Profile',
  icon: BsTrash,
  url: '/student/delete-account',
  parentKey: 'student'
}];

