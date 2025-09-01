import React, { useContext } from 'react';
import ginieImage from '../assets/ginie-image.jpg';
import creditstar from '../assets/credit_star.svg';
import profileIcon from '../assets/profile_icon.png';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

function Navbar() {
  const { user, setShowLogin, logout, credit } = useContext(AppContext);
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className="flex items-center justify-between py-4 px-6 bg-gradient-to-r from-purple-900/80 to-pink-800/80 backdrop-blur-md border-b border-purple-500/30 sticky top-0 z-40"
    >
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-3">
        <motion.div whileHover={{ rotate: 10 }} transition={{ type: "spring", stiffness: 300 }}>
          <img
            src={ginieImage}
            alt="Ginie"
            className="w-12 sm:w-14 lg:w-16 rounded-full shadow-lg border-2 border-purple-400"
          />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-200 to-pink-300 bg-clip-text text-transparent"
        >
          Smart Genie
        </motion.h1>
      </Link>

      {/* User Section */}
      <div>
        {user ? (
          <div className="flex items-center gap-3 sm:gap-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/buy-credit')}
              className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
            >
              <img className="w-5" src={creditstar} alt="" />
              <p className="text-xs sm:text-sm font-medium">{credit} Credits</p>
            </motion.button>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden sm:block text-zinc-200"
            >
              Hi, <span className="font-semibold text-amber-200">{user.name}</span>
            </motion.p>
            
            <div className="relative group">
              <motion.div whileHover={{ scale: 1.1 }} className="cursor-pointer">
                <img src={profileIcon} alt="" className="w-10 drop-shadow border-2 border-purple-400 rounded-full" />
              </motion.div>
              <div className="absolute hidden group-hover:block right-0 z-10 mt-2 w-48 rounded-md shadow-lg bg-purple-900/95 backdrop-blur-md border border-purple-500/50 overflow-hidden">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-purple-500/30">
                    <p className="text-sm text-amber-100">{user.name}</p>
                    <p className="text-xs text-purple-300">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-pink-100 hover:bg-purple-700/50 transition-colors duration-200"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 sm:gap-5">
            <motion.p
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate('/buy-credit')}
              className="cursor-pointer text-amber-100 hover:text-white transition-colors duration-200 hidden sm:block"
            >
              Pricing
            </motion.p>
            
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowLogin(true)} 
              className="bg-gradient-to-r from-amber-400 to-orange-500 text-purple-900 px-5 py-2 sm:px-6 text-sm rounded-full font-semibold cursor-pointer shadow-lg hover:shadow-amber-400/30 transition-all duration-300"
            >
              Get Started
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default Navbar;