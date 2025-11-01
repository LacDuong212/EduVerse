import HomePage from "../app/home/page";
import CourseDetails from "../app/pages/course/detail/page";
import CartDetails from "../app/shop/cart/page";

// INSTRUCTOR
import Account from "../app/instructor/account";
import InstructorDashboard from "../app/instructor/dashboard";
import InstructorMyCourses from "../app/instructor/my-courses";
import InstructorMyStudents from "../app/instructor/my-students";
import CreateCoursePage from "../app/instructor/create-course";


export const guestRoutes = [{
  path: '/home',
  name: 'Home',
  element: <HomePage />
}, {
  path: '/courses/:id',
  name: 'CourseDetails',
  element: <CourseDetails />
}];

export const instructorRoutes = [{
  path: '/instructor/dashboard',
  name: 'Dashboard',
  isNested: false,
  element: <InstructorDashboard />
}, {
  path: '/instructor/courses',
  name: 'My Courses',
  isNested: false,
  element: <InstructorMyCourses />
}, {
  path: '/instructor/students',
  name: 'Students',
  isNested: false,
  element: <InstructorMyStudents />
}, {
  path: '/instructor/account',
  name: 'Account',
  isNested: true,
  element: <Account />
}, {
  path: '/instructor/settings',
  name: 'Settings',
  isNested: true,
  element: null
}, {
  path: '/instructor/balance',
  name: 'My Balance',
  isNested: true,
  element: null
}, {
  path: '/instructor/reviews',
  name: 'Reviews',
  isNested: true,
  element: null
}, {
  path: '/instructor/deactivate-account',
  name: 'Deactivate Account',
  isNested: true,
  element: null
}, {
  path: '/instructor/create-course',
  name: 'Create Course',
  isNested: false,
  element: <CreateCoursePage />
}, {
  path: '/instructor/update-course',
  name: 'Update Course',
  isNested: true,
  element: null
}];

export const studentRoutes = [{
  path: '/student/my-courses',
  name: 'My Courses',
  isNested: true,
  element: null
}, {
  path: '/student/cart',
  name: 'My Cart',
  isNested: false,
  element: <CartDetails />
}, {
  path: '/student/orders',
  name: 'Orders',
  isNested: true,
  element: null
}];
