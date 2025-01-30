import React, { useContext } from 'react';
import ginieImage from '../assets/ginie-image.jpg';
import creditstar from '../assets/credit_star.svg';
import profileIcon from '../assets/profile_icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

function Navbar() {
  const { user, setShowLogin } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between py-4 px-6 shadow-md rounded-full bg-[#322136]">

      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-3">
        <img
          src={ginieImage}
          alt="Ginie"
          className="w-20 sm:w-28 lg:w-36 rounded-full shadow-lg"
        />
        <h1 className="text-xl sm:text-2xl font-bold text-amber-100">Smart Genie</h1>
      </Link>

      {/* User Section */}
      <div>
        {user ? (
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-3">
            <button
              onClick={() => navigate('/buy-credit')}
              className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-3 rounded-full hover:scale-105 transition-all duration-700 cursor-pointer bg-amber-50 text-amber-600"
            >
              <img className="w-5" src={creditstar} alt="" />
              <p className="text-xs sm:text-sm font-medium">Credit left: 50</p>
            </button>
            <p className="hidden sm:block pl-4 text-zinc-100">Hi, Saurabh</p>
            <div className="relative group">
              <img src={profileIcon} alt="" className="w-10 drop-shadow" />
              <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-amber-100 rounded pt-12 cursor-pointer">
                <ul className="list-none m-0 p-2 rounded-md border text-sm bg-pink-100 text-amber-900">
                  <li className="py-1 px-2 cursor-pointer pr-10">Logout</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col-reverse sm:flex-row items-center gap-2 sm:gap-5">
            <p
              onClick={() => navigate('/buy-credit')}
              className="cursor-pointer"
            >
              Pricing
            </p>
            <button onClick={() => setShowLogin(true)} className="text-zinc-900 bg-amber-50 px-7 py-2 sm:px-10 text-sm rounded-full font-medium cursor-pointer">
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Navbar;
