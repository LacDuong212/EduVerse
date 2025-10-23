
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import axios from "axios";
import CourseCard from "./CourseCard";
import { Navigation }   from "swiper/modules";   // thêm module Navigation


const RelatedCourses = ({ courseId }) => {
    const [relatedCourses, setRelatedCourses] = useState([]);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const fetchRelated = async () => {
            try {
                const { data } = await axios.get(
                    `${backendUrl}/api/courses/${courseId}/related`
                );
                if (data.success) {
                    setRelatedCourses(data.courses);
                }
            } catch (err) {
                console.error("Failed to fetch related courses", err);
            }
        };
        fetchRelated();
    }, [courseId]);

    if (!relatedCourses.length) return null;

    return (
        <section
            aria-label="Carousel"
            className="relative max-w-7xl mx-auto px-4 carousel_container"
        >
            <Swiper
                spaceBetween={16}
                slidesPerView={1}
                loop={true}
                slidesPerGroup={1} // default mobile
                modules={[Navigation]}
                navigation={{
                    nextEl: ".swiper-button-next-custom",
                    prevEl: ".swiper-button-prev-custom",
                }}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                        slidesPerGroup: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                        slidesPerGroup: 3,
                    },
                    1280: {
                        slidesPerView: 4,
                        slidesPerGroup: 4,
                    },
                }}
            >
                {relatedCourses.map((course) => (
                    <SwiperSlide key={course._id}>
                        <CourseCard course={course} />
                    </SwiperSlide>
                ))}
            </Swiper>


            {/* Nút điều hướng kiểu Udemy */}
            <button className="swiper-button-prev-custom absolute top-1/2 -translate-y-1/2 left-0 z-10 bg-white border border-gray-300 shadow-md w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition hover:bg-gray-100 hover:border-gray-400">
                {"<"}
            </button>
            <button className="swiper-button-next-custom absolute top-1/2 -translate-y-1/2 right-0 z-10 bg-white border border-gray-300 shadow-md w-12 h-12 flex items-center justify-center rounded-full cursor-pointer transition hover:bg-gray-100 hover:border-gray-400">
                {">"}
            </button>
        </section>

    );
};

export default RelatedCourses;
