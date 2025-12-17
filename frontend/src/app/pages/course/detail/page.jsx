import PageMetaData from '@/components/PageMetaData';
import CourseDetails from './components/CourseDetails';
import ListedCourses from './components/ListedCourses';
import PageIntro from './components/PageIntro';
import useCourseDetail from './useCourseDetail';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import useGuest from '@/hooks/useGuest';

const CourseDetail = () => {
  const {
    course,
    loading,
    error,
    refetch,
    owned,
    handleAddToCart,
  } = useCourseDetail();

  const { fetchInstructorBasicDetails } = useGuest();
  
  const [displayCourse, setDisplayCourse] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const resolveInstructor = async () => {
      if (!course) return;

      if (
        displayCourse?._id === course._id && 
        displayCourse?.instructor?._id === course.instructor?.ref
      ) {
        return;
      }

      if (course.instructor && course.instructor.ref) {
        try {
          const response = await fetchInstructorBasicDetails(course.instructor.ref);
          const fullInstructor = response?.data || response; 

          if (isMounted) {
            setDisplayCourse({
              ...course,
              instructor: fullInstructor
            });
          }
        } catch (err) {
          console.error("Failed to fetch instructor details", err);
          if (isMounted) setDisplayCourse(course);
        }
      } else {
        if (isMounted) setDisplayCourse(course);
      }
    };

    resolveInstructor();

    return () => { isMounted = false; };
  }, [course?._id, course?.instructor?.ref]); 

  useEffect(() => {
    if (error) {
      toast.error(error || "Cannot get course details", {
        toastId: 'course_detail_error'
      });
    }
  }, [error]);

  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center mt-5">
        <h3>Loading...</h3>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center mt-5">
        <h3>Error loading course</h3>
        <button onClick={refetch} className="btn btn-primary">Retry</button>
      </Container>
    );
  }

  const finalCourse = displayCourse || course;

  return (
    <>
      <PageMetaData title="Course Details" />
      <main>
        <PageIntro course={finalCourse} />
        <CourseDetails
          course={finalCourse}
          owned={owned}
          onAddToCart={handleAddToCart}
        />
        <ListedCourses />
      </main>
    </>
  );
};

export default CourseDetail;