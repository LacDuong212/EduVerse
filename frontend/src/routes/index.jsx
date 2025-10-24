
// INSTRUCTOR
import InstructorDashboard from "../app/instructor/dashboard";


export const instructorRoutes = [{
  path: '/instructor/dashboard',
  name: 'Dashboard',
  isNested: false,
  element: <InstructorDashboard />
}, {
  path: '/instructor/courses',
  name: 'My Courses',
  isNested: false,
  element: null
}, {
  path: '/instructor/students',
  name: 'Students',
  isNested: false,
  element: null
}, {
  path: '/instructor/profile',
  name: 'My Profile',
  isNested: true,
  element: null
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
  path: '/instructor/orders',
  name: 'Orders',
  isNested: true,
  element: null
}];
