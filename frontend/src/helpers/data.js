import { blogsData, courseResumeData, eventScheduleData, playListData, pricingPlans, studentData, studentReviewData, testimonialData, userReviewData } from '@/assets/data/other';
import { booksData, collegesData, courseCategories, coursesData, eventsData, instructorsData } from '@/assets/data/products';
import { sleep } from '@/utils/promise';
export const getAllCourses = async () => {
  await sleep();
  return coursesData;
};
export const getAllEvents = async () => {
  await sleep();
  return eventsData;
};
export const getAllInstructors = async () => {
  await sleep();
  return instructorsData;
};
export const getInstructorById = async id => {
  const data = instructorsData.find(instructor => instructor.id == id);
  await sleep();
  return data;
};
export const getAllColleges = async () => {
  await sleep();
  return collegesData;
};
export const getAllBooks = async () => {
  await sleep();
  return booksData;
};
export const getProductById = async id => {
  const data = booksData.find(product => product.id == id);
  await sleep();
  return data;
};
export const getAllEventSchedule = async () => {
  await sleep();
  return eventScheduleData;
};
export const getAllStudents = async () => {
  const data = studentData.map(student => {
    const course = coursesData.find(course => course.id === student.courseId);
    return {
      ...student,
      course
    };
  });
  await sleep();
  return data;
};
export const getAllCategories = async () => {
  await sleep();
  return courseCategories;
};
export const getAllUserReviews = async () => {
  await sleep();
  return userReviewData;
};
export const getAllStudentsReviews = async () => {
  await sleep();
  return studentReviewData;
};
export const getAllPlaylist = async () => {
  await sleep();
  return playListData;
};
export const getAllBlogs = async () => {
  await sleep();
  return blogsData;
};
export const getAllPricingPlans = async () => {
  await sleep();
  return pricingPlans;
};
export const getBlogById = async id => {
  const data = blogsData.find(blog => blog.id == id);
  await sleep();
  return data;
};
export const getAllTestimonials = async () => {
  const data = testimonialData.map(testimonial => {
    const course = coursesData.find(course => course.id === testimonial.courseId);
    return {
      ...testimonial,
      course
    };
  });
  await sleep();
  return data;
};
export const getAllCourseResume = async () => {
  const data = courseResumeData.map(courseResume => {
    const course = coursesData.find(course => course.id === courseResume.courseId);
    return {
      ...courseResume,
      course
    };
  });
  await sleep();
  return data;
};
