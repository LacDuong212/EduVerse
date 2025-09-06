import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { setLogout } from '../redux/authSlice'

const Navbar = () => {

    const navigate = useNavigate()
    const disPatch = useDispatch()
    const { userData } = useSelector((state) => state.auth)
    const backendUrl  = import.meta.env.VITE_BACKEND_URL

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true
            const { data } = await axios.post(backendUrl + '/api/auth/logout')
            if (data.success) {
                disPatch(setLogout())
                navigate('/')
            }

        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='w-full flex items-center p-4 sm:px-12 md:px-24 fixed top-0 left-0 bg-white shadow z-50'>
            {/* Logo */}
            <div className='flex-1'>
                <img src={assets.logo} alt='logo' 
                    className='w-32 sm:w-40 md:w-48 cursor-pointer object-contain' 
                    onClick={() => navigate('/')}/>
            </div>
            
            {/* Navigation Menu */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
                <ul className="hidden md:flex gap-8 text-gray-700 font-medium text-sm lg:text-base">
                    <li
                        onClick={() => navigate('/')}
                        className="cursor-pointer hover:text-blue-600 transition"
                    >
                        Home
                    </li>
                    <li
                        onClick={() => navigate('/courses')}
                        className="cursor-pointer hover:text-blue-600 transition"
                    >
                        Courses
                    </li>
                    <li
                        onClick={() => navigate('/about')}
                        className="cursor-pointer hover:text-blue-600 transition"
                    >
                        About
                    </li>
                    <li
                        onClick={() => navigate('/contact')}
                        className="cursor-pointer hover:text-blue-600 transition"
                    >
                        Contact
                    </li>
                </ul>
            </div>

            {/* Right Section */}
            <div className="flex-1 flex justify-end">
                {userData ? (
                    <div className='w-10 h-10 flex justify-center items-center rounded-full bg-black text-white text-lg font-semibold cursor-pointer'>
                        {userData.name[0].toUpperCase()}
                        {/* Dropdown */}
                        <div className='absolute hidden group-hover:block right-0 mt-2 z-10 text-black rounded'>
                            <ul className='list-none m-0 p-2 bg-gray-100 text-sm shadow-md rounded w-32'>
                                <li
                                    onClick={() => navigate('/profile')}
                                    className='py-2 px-3 hover:bg-gray-200 cursor-pointer rounded'
                                >
                                    Profile
                                </li>
                                <li
                                    onClick={logout}
                                    className='py-2 px-3 hover:bg-gray-200 cursor-pointer rounded'
                                >
                                    Logout
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className='flex items-center gap-2 border border-gray-500 rounded-full px-5 py-2 text-gray-800 hover:bg-gray-100 transition-all text-sm sm:text-base'
                    >
                        Login
                        <img src={assets.arrow_icon} alt='arrow icon' className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

export default Navbar
