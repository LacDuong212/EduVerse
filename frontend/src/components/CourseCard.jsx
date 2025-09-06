import { assets } from '@/assets/assets'
import React from 'react'
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const CourseCard = ({course}) => {

    const currency = useSelector((state) => state.courses.currency);
    const avgRating = course.rating?.average || 0;

  return (
    <Link to={'/course/' + course._id} onClick={() => scrollTo(0,0,)}
        className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg'>
        <img className='w-full h-40 object-cover' src={course.thumbnail} alt="" />
        <div className='p-3 text-left'>
            <h3 className='text-base font-semibold'>{course.title}</h3>
            <p className='text-gray-500'>{course.instructor?.name}</p>
            <div className='flex items-center space-x-2'>
                <p>{avgRating.toFixed(1)}</p>
                <div className='flex'>
                    {[...Array(5)].map((_, i)=>(<img key={i} src={i < Math.floor(avgRating) ? assets.star : assets.star_blank} alt='' 
                    className='w-3.5 h-3.5'/>
                    ))}
                </div>
                <p className='text-gray-500'>{course.rating?.count || 0}</p>
            </div>
            <p className='text-base font-semibold text-gray-800'>
                {currency}
                {course.discountPrice !== null
                    ? course.discountPrice.toFixed(2)
                    : course.price.toFixed(2)}
            </p>
        </div>
    </Link>
  )
}

export default CourseCard
