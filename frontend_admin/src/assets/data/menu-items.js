import { BsBasket, BsHouse } from 'react-icons/bs';
import { FaChartBar, FaRegCommentDots, FaUserCog } from 'react-icons/fa';
import { FaUserGraduate, FaUserTie } from 'react-icons/fa6';
import { BiSolidCoupon } from "react-icons/bi";

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
  icon: BsBasket,
  children: [{
    key: 'all-courses',
    label: 'All Courses',
    parentKey: 'courses',
    url: '/all-courses'
  }, {
    key: 'category',
    label: 'Category',
    parentKey: 'courses',
    url: '/category'
  }],
  // ,{
  //   key: 'course-detail',
  //   label: 'Course Detail',
  //   url: '/course-detail',
  //   parentKey: 'courses'
  // }]
},{
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
  url: '/instructors'
  // children: [{
  //   key: 'instructors',
  //   label: 'Instructors',
  //   url: '/instructors',
  //   parentKey: 'instructors'
  // }, {
  //   key: 'instructor-detail',
  //   label: 'Instructor Detail',
  //   url: '/instructor-detail',
  //   parentKey: 'instructors'
  // }]
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
//  {
//   key: 'reviews',
//   label: 'Reviews',
//   icon: FaRegCommentDots,
//   url: '/reviews'
// }, 
{
  key: 'earnings',
  label: 'Earnings',
  icon: FaChartBar,
  url: '/earnings'
}, {
  key: 'admin-settings',
  label: 'Admin Settings',
  icon: FaUserCog,
  url: '/admin-settings'
}];