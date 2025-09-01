import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaHome, FaImage, FaFileAlt, FaRobot, FaCreditCard } from "react-icons/fa";

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/result", label: "Generate Images", icon: <FaImage /> },
    { path: "/summarize", label: "Summarize", icon: <FaFileAlt /> },
    { path: "/chat", label: "ChatBot", icon: <FaRobot /> },
    { path: "/buy-credit", label: "Buy Credits", icon: <FaCreditCard /> },
  ];

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="hidden md:flex fixed left-0 top-16 h-[calc(100vh-4rem)] w-20 flex-col items-center py-6 bg-purple-900/80 backdrop-blur-md border-r border-purple-500/30 z-30"
    >
      <div className="flex flex-col space-y-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`p-3 rounded-xl transition-all duration-300 ${
              location.pathname === item.path
                ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg"
                : "text-purple-300 hover:bg-purple-800/50 hover:text-white"
            }`}
          >
            <div className="flex justify-center">
              {item.icon}
            </div>
            <span className="text-xs mt-1 block text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

export default Sidebar;