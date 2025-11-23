import { BsBasket, BsBook, BsCardChecklist, BsCreditCard2Front, BsGear, BsHouse, BsInfoCircle, BsPencilSquare, BsPeople, BsPerson, BsQuestionDiamond, BsTrash, BsStar, BsUiChecksGrid, BsWallet2 } from 'react-icons/bs';
import { FaChartBar, FaRegCommentDots, FaRegFileAlt, FaUserCog } from 'react-icons/fa';
import { FaUserGraduate, FaUserTie } from 'react-icons/fa6';
import { MdDoNotDisturb } from 'react-icons/md';
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

//---ADMIN
export const ADMIN_MENU_ITEMS = [{
  key: 'admin',
  label: 'Dashboard',
  icon: BsHouse,
  url: '/admin/dashboard'
}, {
  key: 'pages',
  isTitle: true,
  label: 'Pages'
}, {
  key: 'courses',
  label: 'Courses',
  icon: BsBasket,
  children: [{
    key: 'all-courses',
    label: 'All Courses',
    parentKey: 'courses',
    url: '/admin/all-courses'
  }, 
  // {
  //   key: 'course-category',
  //   label: 'Course Category',
  //   url: '/admin/course-category',
  //   parentKey: 'courses'
  // },
   {
    key: 'course-detail',
    label: 'Course Detail',
    url: '/admin/course-detail',
    parentKey: 'courses'
  }]
}, {
  key: 'students',
  label: 'Students',
  icon: FaUserGraduate,
  url: '/admin/students'
}, {
  key: 'instructors',
  label: 'Instructors',
  icon: FaUserTie,
  children: [{
    key: 'instructors',
    label: 'Instructors',
    url: '/admin/instructors',
    parentKey: 'instructors'
  }, {
    key: 'instructor-detail',
    label: 'Instructor Detail',
    url: '/admin/instructor-detail',
    parentKey: 'instructors'
  }]
  //  {
  //   key: 'instructor-requests',
  //   label: 'Instructor Requests',
  //   url: '/admin/instructor-requests',
  //   parentKey: 'instructors',
  //   badge: '2'
  // }]
},
//  {
//   key: 'administrators',
//   label: 'Administrators',
//   icon: FaUserCog,
//   url: '/admin/administrators'
// },
 {
  key: 'reviews',
  label: 'Reviews',
  icon: FaRegCommentDots,
  url: '/admin/reviews'
}, {
  key: 'earnings',
  label: 'Earnings',
  icon: FaChartBar,
  url: '/admin/earnings'
}, {
  key: 'admin-settings',
  label: 'Admin Settings',
  icon: FaUserCog,
  url: '/admin/admin-settings'
}];

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
  key: 'courses',
  label: 'My Courses',
  icon: BsBook,
  url: '/student/courses'
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
  key: 'account',
  label: 'Account',
  icon: BsPerson,
  url: '/student/account',
  parentKey: 'student'
}, {
  key: 'dashboard',
  label: 'Dashboard',
  icon: BsUiChecksGrid,
  url: '/student/dashboard',
  parentKey: 'student'
}, {
  key: 'courses',
  label: 'My Courses',
  icon: BsBasket,
  url: '/student/courses',
  parentKey: 'student'
}, {
  key: 'payment-info',
  label: 'Payment Info',
  icon: BsCreditCard2Front,
  url: '/student/payment-info',
  parentKey: 'student'
}, {
  key: 'wish-list',
  label: 'Wish List',
  icon: BsCardChecklist,
  url: '/student/wish-list',
  parentKey: 'student'
}, {
  key: 'settings',
  label: 'Settings',
  icon: BsGear,
  url: '/student/settings',
  parentKey: 'student'
}, {
  key: 'deactivate-account',
  label: 'Deactivate Account',
  icon: MdDoNotDisturb,
  url: '/student/deactivate-account',
  parentKey: 'student'
}];
