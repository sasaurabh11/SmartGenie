import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="w-full bg-[#322136] py-3 sm:-my-4 md:-my-6 lg:my-0 flex items-center justify-center">
      <p className="text-sm text-gray-400">Copyright {currentYear} © SmartGenie | All rights reserved.</p>
    </div>
  );
};

export default Footer;
