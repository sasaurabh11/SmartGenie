import React, { useContext, useState } from "react";
import startIcon from "../assets/star_icon.svg";
import starGroup from "../assets/star_group.png";
import ginie1 from "../assets/ginie-image1.jpg";
import ginie2 from "../assets/ginie-image2.jpg";
import ginie3 from "../assets/ginie-image3.webp";
import ginie4 from "../assets/ginie-image4.jpg";
import ginie5 from "../assets/ginie-image5.jpg";
import ginie6 from "../assets/ginie-image6.jpg";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import premiumIcon from "../assets/premium-icon.png";
import TypewriterComponent from 'typewriter-effect'
import { FaArrowUp, FaMagic, FaSearch, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";

const Header = () => {
  const { user, setShowLogin } = useContext(AppContext);
  const [input, setInput] = useState("");

  const navigate = useNavigate();
  const imageClickHandler = () => {
    if (user) {
      navigate("/result");
    } else {
      setShowLogin(true);
    }
  };

  const summarizeClickHandler = () => {
    if (user) {
      navigate("/summarize");
    } else {
      setShowLogin(true);
    }
  };

  const handleEnter = () => {
    if(user) {
      if (input.trim()) {
        navigate("/chat", { state: { input } });
      }
    } else {
      setShowLogin(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleEnter();
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <motion.div 
      className="flex flex-col justify-center items-center text-center py-16 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="text-stone-500 inline-flex text-center gap-2 bg-white px-6 py-1 rounded-full border border-neutral-500">
        <p>Best genie for image generator and website summarize</p>
        <img src={startIcon} alt="" />
      </div>

      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-5 font-extrabold">
        <h1 className="text-5xl">The Best Genie for</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <TypewriterComponent
            options={{
              strings: [
                "Image Generation",
                "Website Summarize",
                "Smart Chatbot",
                "Creative Ideas"
              ],
              autoStart: true,
              loop: true,
              deleteSpeed: 50,
              delay: 70,
              cursor: "|",
              cursorClassName: "text-pink-500 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            }}
          />
        </div>
      </div>

      <p className="text-center max-w-xl mx-auto mt-5">
        Unleash your creativity with SmartGenie. Turn your Imagination into
        visual art in seconds - just type, and watch the magic happen
      </p>

      <div className="w-full max-w-2xl px-4 py-1 mt-6 bg-cyan-300 rounded-full shadow-lg flex items-center space-x-3 border border-gray-300">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="SmartGenie is here for you..."
          className="flex-1 px-3 py-2 border-none rounded-lg focus:outline-none text-black shadow-sm resize-none max-h-24"
          rows="1"
          style={{ overflowY: "auto", wordWrap: "break-word" }}
        />
        <button
          onClick={handleEnter}
          className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full hover:opacity-80 transition-all duration-300 shadow-sm"
        >
          <FaArrowUp className="text-lg" />
        </button>
      </div>

      <motion.div 
        variants={containerVariants}
        className="flex flex-col justify-center items-center mt-12"
      >
        <motion.div 
          variants={itemVariants}
          className="flex items-center gap-2 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 tracking-tight"
        >
          <FaMagic className="text-blue-500" />
          <span>Premium Features</span>
          <img
            src={premiumIcon}
            alt="Premium"
            className="w-8 h-8 animate-pulse"
          />
        </motion.div>

        <motion.div 
          variants={containerVariants}
          className="flex flex-col sm:flex-row gap-4 mt-6"
        >
          <motion.button
            onClick={imageClickHandler}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="text-lg font-medium w-auto px-8 py-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white cursor-pointer transition-all duration-300 shadow-md"
          >
            <FaMagic />
            Generate Images
            <img className="h-5" src={starGroup} alt="" />
          </motion.button>

          <motion.button
            onClick={summarizeClickHandler}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="text-lg font-medium w-auto px-8 py-3 flex items-center gap-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white cursor-pointer transition-all duration-300 shadow-md"
          >
            <FaSearch />
            Summarize Website
            <img className="h-5" src={startIcon} alt="" />
          </motion.button>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="mt-16 w-full max-w-6xl"
      >
        <motion.h3 
          variants={itemVariants}
          className="text-xl font-semibold text-gray-700 mb-6"
        >
          Generated by SmartGenie
        </motion.h3>
        
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-4"
        >
          {[ginie1, ginie2, ginie3, ginie4, ginie5, ginie6].map((src, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <img
                src={src}
                className="w-full h-32 object-cover hover:brightness-110 transition-all duration-300"
                alt={`Generated image ${index + 1}`}
                loading="lazy"
              />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Header;
