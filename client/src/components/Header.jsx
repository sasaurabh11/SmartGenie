import React, { useContext } from "react";
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

const Header = () => {
  const {user, setShowLogin} = useContext(AppContext)
  const navigate = useNavigate();
  const imageClickHandler = () => {
    if(user) {
      navigate('/result')
    }
    else {
      setShowLogin(true);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center text-center my-20">
      <div className="text-stone-500 inline-flex text-center gap-2 bg-white px-6 py-1 rounded-full border border-neutral-500">
        <p>Best genie for image generator</p>
        <img src={startIcon} alt="" />
      </div>

      <h1 className="text-4xl max-w-[450px] mx-auto mt-10 text-center">
        Turn Your Imagination Into{" "}
        <span className="text-yellow-300">Image</span>, In Seconds
      </h1>

      <p className="text-center max-w-xl mx-auto mt-5">
        Unleash your creativity with AI. Turn your Imagination into visual art
        in seconds - just type, and watch the magic happen
      </p>

      <button onClick={imageClickHandler} className="sm:text-lg w-auto mt-8 px-12 py-2.5 flex items-center gap-2 rounded-full bg-pink-400 text-blue-900 cursor-pointer hover:scale-105 transition-all duration-500">
        Generate Images
        <img className="h-6" src={starGroup} alt="" />
      </button>

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
