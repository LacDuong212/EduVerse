import { lazy } from 'react';

// AUTH
const SignIn = lazy(() => import('@/app/auth/sign-in/page'));
const SignUp = lazy(() => import('@/app/auth/sign-up/page'));
const ForgotPassword = lazy(() => import('@/app/auth/forgot-password/page'));
const ResetPassword = lazy(() => import('@/app/auth/reset-password/page'));

// INSTRUCTOR
import InstructorAccount from "../app/instructor/account";
import InstructorCourseDetail from "../app/instructor/course-detail";
import InstructorDashboard from "../app/instructor/dashboard";
import InstructorEarnings from '../app/instructor/earnings';
import InstructorManageCoursePage from "../app/instructor/manage-course";
import InstructorMyCourses from "../app/instructor/my-courses";
import InstructorMyStudents from "../app/instructor/my-students";

// STUDENT
const Checkout = lazy(() => import('@/app/shop/checkout/page'));
const PaymentSuccess = lazy(() => import('@/app/shop/payment-result/success/page'));
const PaymentFailed = lazy(() => import('@/app/shop/payment-result/failed/page'));
import CartDetails from "../app/shop/cart/page";
import WishList from "../app/shop/wishlist/page";
import StudentMyCourses from '../app/student/my-courses';
import StudentAccount from '../app/student/account';
import LearningCourse from '../app/student/learning/page';
import OrderListPage from '../app/student/my-orders/OrderListPage';
import OrderDetailPage from '../app/student/my-orders/detail/OrderDetailPage';
import AccountSettingsPage from '../app/pages/accountSettings';
import StudentDashboard from '../app/student/dashboard';
import CourseResultPage from "../app/pages/course/video-player/components/CourseResultPage";

// PUBLIC
import HomePage from "../app/pages/home/page";
import CoursesPage from "../app/pages/course/grid/page";
import BecomeInstructorPage from '../app/student/become-instructor';
import CourseDetails from "../app/pages/course/detail/page";
import InstructorDetailsPage from "../app/pages/instructors/detail";
import VideoPlayer from "../app/pages/course/video-player/page";
import NotFoundPage from '../app/not-found';


export const publicRoutes = [{
  path: '/home',
  name: 'Home',
  element: <HomePage />
},{
  path: '/courses',
  name: 'Courses',
  element: <CoursesPage />
}, {
  path: '/courses/:courseId/watch/:lectureId?',
  name: 'My Video Player',
  isNested: false,
  element: <VideoPlayer />
}, {
  path: '/course/:courseId/result',
  name: 'Course Result',
  isNested: false,
  element: <CourseResultPage />
}, {
  path: '/courses/:id',
  name: 'CourseDetails',
  element: <CourseDetails />
}, {
  path: '/instructors',
  name: 'All Instructors',
  element: <NotFoundPage />
}, {
  path: '/instructors/:id',
  name: 'Instructor Details',
  element: <InstructorDetailsPage />
}, {
  path: '/student/become-instructor',
  name: 'Become Instructor',
  element: <BecomeInstructorPage />
}, {
  path: '/*',
  name: 'Not Found',
  element: <NotFoundPage />
}];

export const authRoutes = [{
  path: '/auth/sign-in',
  name: 'Sign In',
  element: <SignIn />
}, {
  path: '/auth/sign-up',
  name: 'Sign Up',
  element: <SignUp />
}, {
  path: '/auth/forgot-password',
  name: 'Forgot Password',
  element: <ForgotPassword />
}, {
  path: '/auth/reset-password',
  name: 'Reset Password',
  element: <ResetPassword />
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
  name: 'My Students',
  isNested: false,
  element: <InstructorMyStudents />
}, {
  path: '/instructor/profile',
  name: 'My Profile',
  isNested: true,
  element: <InstructorAccount />
}, {
  path: '/instructor/settings',
  name: 'Settings',
  isNested: true,
  element: <AccountSettingsPage />
}, {
  path: '/instructor/earnings',
  name: 'Earnings',
  isNested: true,
  element: <InstructorEarnings />
}, {
  path: '/instructor/courses/create',
  name: 'Create Course',
  isNested: false,
  element: <InstructorManageCoursePage isEdit={false} />
}, {
  path: '/instructor/courses/edit/:id',
  name: 'Update Course',
  isNested: false,
  element: <InstructorManageCoursePage isEdit={true} />
}, {
  path: '/instructor/courses/:id',
  name: 'Update Course',
  isNested: false,
  element: <InstructorCourseDetail />
}];

export const studentRoutes = [{
  path: '/student/courses',
  name: 'My Courses',
  isNested: true,
  element: <StudentMyCourses />
}, {
  path: '/student/cart',
  name: 'My Cart',
  isNested: false,
  element: <CartDetails />
}, {
  path: '/student/wishlist',
  name: 'Wishlist',
  isNested: false,
  element: <WishList />
},{
   path: '/student/courses/:courseId',
  name: 'Learning Course',
  isNested: false,
  element: <LearningCourse />
},{
  path: '/student/checkout',
  name: 'Checkout',
  isNested: false,
  element: <Checkout />
}, {
  path: '/student/profile',
  name: 'Profile',
  isNested: true,
  element: <StudentAccount />
}, {
  path: '/student/orders',
  name: 'My Orders',
  isNested: true,
  element: <OrderListPage />
}, {
  path: '/student/orders/:id',
  name: 'Order Detail',
  isNested: true,
  element: <OrderDetailPage />
}, {
  path: '/student/payment-success',
  name: 'Payment Success',
  isNested: false,
  element: <PaymentSuccess />
}, {
  path: '/student/payment-failed',
  name: 'Failed',
  isNested: false,
  element: <PaymentFailed />
}, {
  path: '/student/payment-info',
  name: 'Payment Info',
  isNested: true,
  element: null
}, {
  path: '/student/dashboard',
  name: 'dashboard',
  isNested: true,
  element: <StudentDashboard />
}, {
  path: '/student/settings',
  name: 'Settings',
  isNested: true,
  element: <AccountSettingsPage />
}, {
  path: '/student/wish-list',
  name: 'Wish List',
  isNested: true,
  element: null
}, {
  path: '/student/deactivate-account',
  name: 'Deactivate Account',
  isNested: true,
  element: null
}];
