import { BsBasket, BsBasketFill, BsCardChecklist, BsCartCheck, BsCartCheckFill, BsCreditCard2Front, BsCreditCard2FrontFill, BsFileCheckFill, BsFileEarmarkPlusFill, BsFolderCheck, BsGear, BsGraphUp, BsGridFill, BsHouse, BsLock, BsPencilSquare, BsPeople, BsQuestionDiamond, BsStar, BsStarFill, BsTrash, BsUiChecksGrid, BsUiRadiosGrid, BsWallet2 } from 'react-icons/bs';
import { FaBasketballBall, FaChartBar, FaCog, FaEdit, FaFacebook, FaLinkedinIn, FaRegCommentDots, FaRegFileAlt, FaTrashAlt, FaUserCog } from 'react-icons/fa';
import { FaChartLine, FaUserGraduate, FaUserTie, FaWallet } from 'react-icons/fa6';

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
  url: '/instructor/manage-course',
  parentKey: 'instructor'
}, {
  key: 'students',
  label: 'Students',
  icon: BsPeople,
  url: '/instructor/student-list',
  parentKey: 'instructor'
}, {
  key: 'orders',
  label: 'Orders',
  icon: BsFolderCheck,
  url: '/instructor/order',
  parentKey: 'instructor'
}, {
  key: 'reviews',
  label: 'Reviews',
  icon: BsStar,
  url: '/instructor/review',
  parentKey: 'instructor'
}, {
  key: 'edit-profile',
  label: 'Edit Profile',
  icon: BsPencilSquare,
  url: '/instructor/edit-profile',
  parentKey: 'instructor'
}, {
  key: 'balance',
  label: 'Balance',
  icon: BsWallet2,
  url: '/instructor/balance',
  parentKey: 'instructor'
}, {
  key: 'setting',
  label: 'Setting',
  icon: BsGear,
  url: '/instructor/setting',
  parentKey: 'instructor'
}, {
  key: 'delete',
  label: 'Delete Profile',
  icon: BsTrash,
  url: '/instructor/delete-account',
  parentKey: 'instructor'
}];

//---STUDENT
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
  icon: BsCartCheck,
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
//---OTHERS
