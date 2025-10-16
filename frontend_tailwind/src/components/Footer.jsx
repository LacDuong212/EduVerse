import { assets } from '@/assets/assets'
import React from 'react'

const Footer = () => {
  return (
    <footer className='bg-gray-900 md:px-36 text-left w-full mt-10'>
        <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30'>
            <div className='flex flex-col md:items-start items-center w-full'>
                <img src={assets.logo} alt="logo" className="w-32 md:w-40" />
                <p className='mt-6 text-center md:text-left text-sm text-white/80'>Learn Anytime, Anywhere.</p>
            </div>
            <div className='flex flex-col md:items-start items-center w-full'>
                <h2 className='font-semibold text-white mb-5'>Company</h2>
                <ul className='flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2'>
                    <li>Home</li>
                    <li>About us</li>
                    <li>Contact us</li>
                    <li>Privacy policy</li>
                </ul>
            </div>
        </div>
        <p className='py-4 text-center text-xs md:text-sm text-white/60'>Copyright 2025 © EduVerse. All Right Reserved.</p>
    </footer>
  )
}

export default Footer
