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
import { FaArrowUp, FaMagic, FaSearch, FaStar, FaRocket, FaCrown, FaLightbulb } from "react-icons/fa";
import { motion } from "framer-motion";
import Features from "../components/Features";

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
      boxShadow: "0px 5px 20px rgba(159, 122, 234, 0.5)",
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.98
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center py-16 px-4 relative">
        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl"></div>
        
        <motion.div 
          className="flex flex-col justify-center items-center text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-purple-900/30 backdrop-blur-sm px-6 py-2 rounded-full border border-purple-500/30 mb-6">
            <FaRocket className="text-amber-400 animate-pulse" />
            <p className="text-amber-100 text-sm">AI-Powered Creativity Platform</p>
            <img src={startIcon} alt="" className="h-4" />
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <div className="text-white mb-2">Unleash Your</div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
              <TypewriterComponent
                options={{
                  strings: [
                    "Creativity",
                    "Imagination",
                    "Potential",
                    "Innovation"
                  ],
                  autoStart: true,
                  loop: true,
                  deleteSpeed: 40,
                  delay: 100,
                  cursor: "|",
                  cursorClassName: "text-pink-500 text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
                }}
              />
            </div>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-center max-w-2xl mx-auto mt-5 text-lg text-purple-100">
            SmartGenie transforms your ideas into reality with cutting-edge AI. Generate stunning visuals, summarize content, and engage with our intelligent chatbot - all in one platform.
          </motion.p>

          <motion.div variants={itemVariants} className="w-full max-w-2xl px-4 py-2 mt-8 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-2xl shadow-2xl flex items-center space-x-3 border border-purple-500/30 backdrop-blur-sm">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What would you like to create today?"
              className="flex-1 px-4 py-3 bg-transparent border-none rounded-lg focus:outline-none text-white placeholder-purple-300 shadow-sm resize-none max-h-24"
              rows="1"
              style={{ overflowY: "auto", wordWrap: "break-word" }}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEnter}
              className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
            >
              <FaArrowUp className="text-lg" />
            </motion.button>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-4 mt-8">
            <span className="text-xs text-purple-300 bg-purple-900/30 px-3 py-1 rounded-full">Best Experience</span>
            <span className="text-xs text-purple-300 bg-purple-900/30 px-3 py-1 rounded-full">Free trial available</span>
            <span className="text-xs text-purple-300 bg-purple-900/30 px-3 py-1 rounded-full">Instant results</span>
          </motion.div>
        </motion.div>

        <motion.div 
          className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <div className="animate-bounce flex flex-col items-center">
            <span className="text-sm text-purple-300 mb-2">Explore Features</span>
            <div className="w-6 h-10 border-2 border-purple-500 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-purple-500 rounded-full mt-2"></div>
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Premium Features Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-purple-900/20 to-purple-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Unlock Premium Features</h2>
            <p className="text-purple-200 max-w-2xl mx-auto">Experience the full power of SmartGenie with our premium capabilities</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={imageClickHandler}
              className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 backdrop-blur-sm cursor-pointer group hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-700/30 rounded-xl group-hover:bg-purple-700/50 transition-colors duration-300">
                  <FaMagic className="text-2xl text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">AI Image Generation</h3>
              </div>
              <p className="text-purple-200 mb-6">Transform your text descriptions into stunning, high-quality images with our advanced AI model.</p>
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-medium">Generate Now</span>
                <img className="h-5 opacity-70 group-hover:opacity-100 transition-opacity duration-300" src={starGroup} alt="" />
              </div>
            </motion.div>

            <motion.div 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={summarizeClickHandler}
              className="p-8 rounded-2xl bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-purple-500/30 backdrop-blur-sm cursor-pointer group hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-cyan-700/30 rounded-xl group-hover:bg-cyan-700/50 transition-colors duration-300">
                  <FaSearch className="text-2xl text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Content Summarization</h3>
              </div>
              <p className="text-purple-200 mb-6">Quickly extract key information from websites and videos with our intelligent summarization tool.</p>
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-medium">Summarize Now</span>
                <img className="h-5 opacity-70 group-hover:opacity-100 transition-opacity duration-300" src={startIcon} alt="" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
      {/* Features Preview */}
      <Features />

      {/* Gallery Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Created with SmartGenie</h2>
            <p className="text-purple-200 max-w-2xl mx-auto">Explore these stunning images generated by our AI technology</p>
          </motion.div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-4">
            {[ginie1, ginie2, ginie3, ginie4, ginie5, ginie6].map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer"
              >
                <img
                  src={src}
                  className="w-full h-32 object-cover hover:brightness-110 transition-all duration-300"
                  alt={`AI generated image ${index + 1}`}
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={imageClickHandler}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-medium shadow-lg hover:shadow-purple-500/40 transition-all duration-300"
            >
              Create Your Own
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Header;