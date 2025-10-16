import React, { useEffect } from 'react'
import Hero from '@/components/Hero'
import CoursesSection from '@/components/CoursesSection'
import Footer from '@/components/Footer'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { setHomeCourses } from '@/redux/coursesSlice'
import { toast } from 'react-toastify'
import { data } from 'react-router-dom'

const Home = () => {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  useEffect(() => {
    const fetchHomeCourses = async () => {
      try {
        const res = await axios.get(backendUrl + `/api/courses/home`)
        dispatch(setHomeCourses(res.data));
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching home courses");
      }
    };
    fetchHomeCourses();
  }, [dispatch]);

  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
      <Hero />
      <CoursesSection />
      <Footer />
    </div>
  )
}

export default Home