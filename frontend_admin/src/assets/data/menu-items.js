import { BiSolidCategory, BiSolidCoupon } from "react-icons/bi";
import { BsHouse } from 'react-icons/bs';
import { FaBook, FaCertificate, FaCheckSquare, FaClipboardList, FaList, FaMoneyBill, FaMoneyBillWave } from 'react-icons/fa';
import { FaUserGraduate, FaUserTie } from 'react-icons/fa6';

export const ADMIN_MENU_ITEMS = [{
  key: 'admin',
  label: 'Dashboard',
  icon: BsHouse,
  url: '/dashboard'
}, {
  key: 'pages',
  isTitle: true,
  label: 'Pages'
}, {
  key: 'courses',
  label: 'Courses',
  icon: FaBook,
  url: '/courses'
  // children: [{
  //   key: 'all-courses',
  //   label: 'All Courses',
  //   parentKey: 'courses',
  //   url: '/courses'
  // }, {
  //   key: 'category',
  //   label: 'Category',
  //   parentKey: 'courses',
  //   url: '/category'
  // }],
  // ,{
  //   key: 'course-detail',
  //   label: 'Course Detail',
  //   url: '/course-detail',
  //   parentKey: 'courses'
  // }]
}, {
  key: 'categories',
  label: 'Categories',
  icon: BiSolidCategory,
  url: '/categories'
}, {
  key: 'coupons',
  label: 'Coupons',
  icon: BiSolidCoupon,
  url: '/coupons'
}, {
  key: 'students',
  label: 'Students',
  icon: FaUserGraduate,
  url: '/students'
}, {
  key: 'instructors',
  label: 'Instructors',
  icon: FaUserTie,
  children: [{
    key: 'instructors-list',
    label: 'List',
    icon: FaList,
    url: '/instructors',
    parentKey: 'instructors'
  },
  // {
  //   key: 'instructor-detail',
  //   label: 'Instructor Detail',
  //   url: '/instructor-detail',
  //   parentKey: 'instructors'
  // }]
  {
    key: 'instructor-requests',
    label: 'Requests',
    icon: FaCheckSquare,
    url: '/instructor-requests',
    parentKey: 'instructors',
  }]
},
//  {
//   key: 'administrators',
//   label: 'Administrators',
//   icon: FaUserCog,
//   url: '/admin/administrators'
// },
//  {
//   key: 'reviews',
//   label: 'Reviews',
//   icon: FaRegCommentDots,
//   url: '/reviews'
// }, 
{
  key: 'payouts',
  label: 'Payouts',
  icon: FaMoneyBillWave,
  url: '/payouts'
}, {
  key: 'certificates',
  label: 'Certificates',
  icon: FaCertificate,
  url: '/certificates'
}, {
  key: 'earnings',
  label: 'Earnings',
  icon: FaMoneyBill,
  url: '/earnings'
}, {
  key: 'audit-logs',
  label: 'Audit Logs',
  icon: FaClipboardList,
  url: '/audit-logs'
// }, {
//   key: 'settings',
//   label: 'Settings',
//   icon: IoSettingsSharp ,
//   url: '/settings'
}];