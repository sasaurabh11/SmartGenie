import React, { useContext, useState } from "react";
import sampleImage from "../assets/ginie-image1.jpg";
import { AppContext } from "../context/AppContext";
import genieAnimation from "../assets/ginei-animation1.gif";

const Result = () => {
  const [image, setImage] = useState(sampleImage);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [input, setInput] = useState("");

  const { generateImage } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (input) {
      const image = await generateImage(input);
      if (image) {
        setImage(image);
        setIsImageLoaded(true);
      }
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col min-h-[90vh] justify-center items-center"
    >
      {Loading && (
        <div className="genie-container">
          <img
            src={genieAnimation}
            alt="Flying Genie"
            className="genie-fly-animation"
          />
          <p className="funny-message">
            🧞 Hold on... The genie is working magic! ✨
          </p>
        </div>
      )}

      <div>
        <div className="relative">
          <img src={image} alt="" className="max-w-sm rounded object-cover shadow-2xl" />
        </div>
      </div>

      {!isImageLoaded ? (
        <div className="flex w-full max-w-xl bg-neutral-500 text-white text-sm  p-0.5 mt-10 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Describe SmartGenie to what you want to generate"
            className="flex-1 bg-transparent outline-none ml-8 max-sm:w-20 text-black
      "
          />
          <button
            type="submit"
            className="bg-zinc-700 text-amber-300 cursor-pointer px-10 sm:px-16 py-3 rounded-full"
          >
            Generate
          </button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap justify-center text-sm p-0.5 mt-10 rounded-full">
          <p
            onClick={() => {
              setIsImageLoaded(false);
            }}
            className="bg-transparent border border-amber-400 px-8 py-3 rounded-full text-amber-100 cursor-pointer"
          >
            Generate Another
          </p>
          <a
            href={image}
            download
            className="bg-amber-100 px-10 py-3 rounded-full cursor-pointer text-pink-600"
          >
            Download
          </a>
        </div>
      )}
    </form>
  );
};

export default Result;
