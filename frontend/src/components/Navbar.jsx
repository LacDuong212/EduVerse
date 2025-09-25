import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch, useSelector } from 'react-redux'
import { setLogout } from '../redux/authSlice'
import { ShoppingCart } from 'lucide-react'

const Navbar = () => {

    const navigate = useNavigate()
    const disPatch = useDispatch()
    const { userData } = useSelector((state) => state.auth)
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const itemCount = useSelector((state) => state.cart.items || []).length;

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
        <div className="w-full flex items-center px-4 sm:px-6 md:px-12 lg:px-24 py-4 top-0 left-0 bg-white shadow z-50">
            {/* Logo */}
            <div className='flex-1'>
                <img src={assets.logo} alt='logo'
                    className='w-32 sm:w-40 md:w-48 cursor-pointer object-contain'
                    onClick={() => navigate('/')} />
            </div>

            {/* Navigation Menu */}
            <div className="flex-1 flex justify-center">
                <ul className="flex flex-wrap gap-x-4 gap-y-2 text-gray-700 font-medium text-sm lg:text-base justify-center">
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
            <div className="flex-1 flex justify-end items-center gap-4">
                {userData ? (
                    <div className="flex items-center gap-6">
                        {/* Cart Icon */}
                        <div
                            onClick={() => navigate('/my-cart')}
                            className="relative cursor-pointer"
                        >
                            <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-black transition" />

                            {/* Item count badge */}
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                                    {itemCount}
                                </span>
                            )}
                        </div>

                        {/* Profile */}
                        <div className="relative group cursor-pointer">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex items-center justify-center text-white text-lg">
                                {userData?.pfpImg ? (
                                    <img
                                        src={userData.pfpImg}
                                        alt="User avatar"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    (userData?.name?.[0] || "U").toUpperCase()
                                )}
                            </div>

                            {/* Dropdown */}
                            <div className="absolute hidden group-hover:block top-full right-0 z-10 text-black rounded pt-2">
                                <ul className="list-none m-0 p-2 bg-gray-100 text-sm shadow-md rounded min-w-[105px]">
                                    <li
                                        onClick={() => navigate('/account')}
                                        className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded"
                                    >
                                        Account
                                    </li>
                                    <li
                                        onClick={() => navigate('/my-courses')}
                                        className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded"
                                    >
                                        My Courses
                                    </li>
                                    <li
                                        onClick={() => navigate('/viewed-courses')}
                                        className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded"
                                    >
                                        Viewed Courses
                                    </li>
                                    <li
                                        onClick={logout}
                                        className="py-1 px-2 hover:bg-gray-200 cursor-pointer rounded"
                                    >
                                        Logout
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2 border border-gray-500 rounded-full px-5 py-2 text-gray-800 hover:bg-gray-100 transition-all text-sm sm:text-base"
                    >
                        Login
                        <img src={assets.arrow_icon} alt="arrow icon" className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

export default Navbar
