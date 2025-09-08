import React, { useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useDispatch } from 'react-redux'
import { setLogin } from '../redux/authSlice'

const Login = () => {

    const navigate = useNavigate()
    const disPatch = useDispatch()

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const onSubmithandler = async (e) => {
        e.preventDefault();
        try {
            axios.defaults.withCredentials = true

            if (state === 'Sign Up') {
                const { data } = await axios.post(backendUrl + `/api/auth/register`, { name, email, password })

                if (data.success) {
                    disPatch(setLogin({ name, email }))
                    navigate('/email-verify', { state: { email } });
                } else {
                    toast.error(data.message)
                }
            } else {
                const { data } = await axios.post(backendUrl + `/api/auth/login`, { email, password })

                if (data.success) {
                    try {
                        const res = await axios.get(`${backendUrl}/api/user/profile`);
                        if (res.data.success) {
                            disPatch(setLogin(res.data.user));
                        } else {
                            disPatch(setLogout());
                        }
                    } catch (err) {
                        disPatch(setLogout());
                    }

                    navigate('/');
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            toast.error(data.message)
        }
    }

    return (
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0'>
            <div className='bg-slate-900 p-10  rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                <h2 className='text-3xl font-semibold text-white text-center mb-3'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</h2>
                <p className='text-center text-sm mb-6'>{state === 'Sign Up' ? 'Create your account' : 'Login to your account'}</p>

                <form onSubmit={onSubmithandler}>
                    {state === 'Sign Up' && (
                        <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                            <img src={assets.person_icon} alt="" />
                            <input onChange={e => setName(e.target.value)} value={name} className='bg-transparent outline-none text-white' type="text" placeholder='Full Name' required />
                        </div>
                    )}

                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.mail_icon} alt="" />
                        <input onChange={e => setEmail(e.target.value)} value={email} className='bg-transparent outline-none text-white' type="email" placeholder='Email' required />
                    </div>

                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <img src={assets.lock_icon} alt="" />
                        <input onChange={e => setPassword(e.target.value)} value={password} className='bg-transparent outline-none text-white' type="password" placeholder='Password' required />
                    </div>

                    <p onClick={() => navigate('/forgot-password')} className='mb-4 text-indigo-500 cursor-pointer'>Forgot password?</p>

                    <button className='w-full py-2.5 rounded-full bg-blue-600 text-white font-medium'>{state}</button>

                    {state === 'Sign Up' ? (
                        <p className='text-gray-400 text-center text-xs mt-4'>Already have an account?{' '}
                            <span onClick={() => setState('Login')} className='text-blue-400 cursor-pointer underline'>Login Here</span>
                        </p>
                    )
                        : (
                            <p className='text-gray-400 text-center text-xs mt-4'>Don't have an account?{' '}
                                <span onClick={() => setState('Sign Up')} className='text-blue-400 cursor-pointer underline'>Sign up</span>
                            </p>
                        )}

                </form>

            </div>
        </div>
    )
}

export default Login
