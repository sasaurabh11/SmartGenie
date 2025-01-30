import React from 'react'

const Footer = () => {
    const currentYear = new Date().getFullYear();
  return (
    <div className='flex items-center justify-between gap-4 mt-20'>
        <p className='flex-1 text-sm text-gray-400 max-sm:hidden'>Copyright {currentYear}  © SmartGenie | All right reserved.</p>
    </div>
  )
}

export default Footer