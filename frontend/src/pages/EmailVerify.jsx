import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../redux/authSlice'

const EmailVerify = () => {
  axios.defaults.withCredentials = true;

  const disPatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const { isLoggedIn, userData } = useSelector((state) => state.auth)
  
  const [userEmail, setUserEmail] = useState('')
  const inputRefs = React.useRef([])

  const handleInput = (e, index)=>{
    if(e.target.value.length > 0 && index < inputRefs.current.length - 1){
      inputRefs.current[index + 1].focus();
    }
  }

  const handleKeyDown = (e, index) =>{
    if(e.key === "Backspace" && e.target.value === '' && index > 0){
      inputRefs.current[index - 1].focus();
    }
  }

  const handlePaste = (e) =>{
    const paste = e.clipboardData.getData('text')
    const pasteAray = paste.split('');
    pasteAray.forEach((char, index) =>{
      if(inputRefs.current[index]){
        inputRefs.current[index].value = char;
      }
    })
  }

  const onSubmithandler = async(e)=>{
    e.preventDefault();

    try {
      const otpArray = inputRefs.current.map(e => e.value)
      const otp = otpArray.join('')

      const backendUrl = import.meta.env.VITE_BACKEND_URL
      const { data } = await axios.post(backendUrl + '/api/auth/verify-otp', {
        email: userEmail,
        otp:  otp
      })

      if(data.success){
        toast.success(data.message)
        disPatch(setUserData(data.user))
        navigate('/')
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(data.message)
    }
  }

  useEffect(() => {
    if (location.state?.email) {
      setUserEmail(location.state.email);
    } else {
      if (userData && userData.email) {
        setUserEmail(userData.email);
      } else {
        toast.error('Không tìm thấy thông tin email');
        navigate('/register');
      }
    }
  }, [location.state, userData, navigate]);

  useEffect(() => {
    if (isLoggedIn && userData && userData.isVerified) {
      navigate('/')
    }
  }, [isLoggedIn, userData, navigate])

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <form onSubmit={onSubmithandler} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
        <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
        <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit code sen to your email.</p>
        <div className='flex justify-between mb-8' onPaste={handlePaste}>
          {Array(6).fill(0).map((_, index)=>(
            <input type="text" maxLength='1' key={index} required
            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
            ref={e => inputRefs.current[index] = e}
            onInput={(e) => handleInput(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}/>
          ))}
        </div>
        <button className='w-full py-3 bg-blue-600 text-white rounded-full'>Verify Email</button>
      </form>
    </div>
  )
}

export default EmailVerify
