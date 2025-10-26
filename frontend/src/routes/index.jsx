import HomePage from "../app/home/page";
import CourseDetails from "../app/pages/course/detail/page";


export const instructorRoutes = [{
  path: '/instructor/dashboard',
  name: 'Dashboard',
  isNested: false,
  element: null
}, {
  path: '/instructor/courses',
  name: 'My Courses',
  isNested: false,
  element: null
}, {
  path: '/instructor/student-list',
  name: 'Students',
  isNested: false,
  element: null
}, {
  path: '/instructor/profile',
  name: 'My Profile',
  isNested: true,
  element: null
}, {
  path: '/instructor/balance',
  name: 'My Balance',
  isNested: true,
  element: null
}, {
  path: '/instructor/orders',
  name: 'Orders',
  isNested: true,
  element: null
}];

export const studentRoutes = [{
  path: '/home',
  name: 'Home',
  isNested: false,
  element: <HomePage />
}, {
  path: '/courses/:id',
  name: 'CourseDetails',
  isNested: true,
  element: <CourseDetails />
}, {
  path: '/student/my-courses',
  name: 'My Courses',
  isNested: true,
  element: null
}, {
  path: '/student/cart',
  name: 'My Cart',
  isNested: false,
  element: null
}, {
  path: '/student/orders',
  name: 'Orders',
  isNested: true,
  element: null
}];
