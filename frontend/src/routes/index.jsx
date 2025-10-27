
// INSTRUCTOR
import Account from "../app/instructor/account";
import InstructorDashboard from "../app/instructor/dashboard";
import InstructorMyCourses from "../app/instructor/my-courses";
import InstructorMyStudents from "../app/instructor/my-students";


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
  element: null
}, {
  path: '/instructor/update-course',
  name: 'Update Course',
  isNested: true,
  element: null
}];
