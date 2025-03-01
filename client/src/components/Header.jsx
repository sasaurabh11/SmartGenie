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
import { FaArrowUp } from "react-icons/fa";

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

  return (
    <div className="flex flex-col justify-center items-center text-center my-20">
      <div className="text-stone-500 inline-flex text-center gap-2 bg-white px-6 py-1 rounded-full border border-neutral-500">
        <p>Best genie for image generator and website summarize</p>
        <img src={startIcon} alt="" />
      </div>

      <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mt-5 font-extrabold">
        <h1>The Best Genie for</h1>
        <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <TypewriterComponent
            options={{
              strings: [
                "Image Generation",
                "Website Summarize",
                "Chatbot",
              ],
              autoStart: true,
              loop: true,
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

      <div className="flex flex-col justify-center items-center mt-[1.5rem]">
        <div className="flex items-center gap-1 sm:gap-3 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 tracking-wide">
          <span>Premium Features</span>
          <img
            src={premiumIcon}
            alt=""
            className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse drop-shadow-lg"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={imageClickHandler}
            className="sm:text-lg w-auto mt-8 px-12 py-2.5 flex items-center gap-2 rounded-full bg-pink-400 text-blue-900 cursor-pointer hover:scale-105 transition-all duration-500"
          >
            Generate Images
            <img className="h-6" src={starGroup} alt="" />
          </button>

          <button
            onClick={summarizeClickHandler}
            className="sm:text-lg w-auto mt-8 px-12 py-2.5 flex items-center gap-2 rounded-full bg-pink-300 text-blue-500 cursor-pointer hover:scale-105 transition-all duration-500"
          >
            Summarise Website
            <img className="h-6" src={startIcon} alt="" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center mt-16 gap-3">
        {[ginie1, ginie2, ginie3, ginie4, ginie5, ginie6].map((src, index) => (
          <img
            key={index}
            src={src}
            className="rounded hover:scale-105 transition-all duration-300 cursor-pointer w-20 h-20 object-cover"
            alt=""
          />
        ))}
      </div>

      <p className="mt-2 text-red-400">Generated Images from SmartGenie</p>
    </div>
  );
};

export default Header;
