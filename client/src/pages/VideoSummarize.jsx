import React, { useContext, useState } from "react";
import { FaPlay } from "react-icons/fa";
import genieAnimation from "../assets/ginei-animation1.gif";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const VideoSummarize = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);

  const { generatecontentsForVideo, prepareVideoFromAssets } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading("Generating assets...");
      const path = await generatecontentsForVideo(url);

      if(path) {
        setLoading("Preparing Video...");
        const video = await prepareVideoFromAssets(path);

        setVideoUrl(video);
      }
      setLoading("");
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-8 lg:px-16 xl:px-24 pt-4 lg:mt-[-3rem]">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-10 z-50 mt-[-20rem]">
          <div className="genie-container flex flex-col items-center">
            <img
              src={genieAnimation}
              alt="Flying Genie"
              className="genie-fly-animation w-32 h-32"
            />
            <p className="funny-message text-white text-lg font-semibold mt-4">
              🧞 Hold on... <span className="text-blue-500">{loading}</span> ✨
            </p>
          </div>
        </div>
      )}

      <main className="max-w-6xl w-full bg-gray-800 shadow-2xl rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16 text-white flex flex-col md:flex-row items-center gap-6 lg:gap-12">
        <div className="flex flex-col text-center md:text-left w-full md:w-1/2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase leading-tight">
            <span className="text-cyan-300 block">URL to Video</span>
            <span className="text-2xl sm:text-4xl md:text-4xl lg:text-4xl font-extrabold uppercase leading-tight">
              with Power of SmartGenie
            </span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm sm:text-base md:text-lg lg:text-xl">
            Enter a URL and generate a summarized video powered by SmartGenie
            AI.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 w-full flex flex-col sm:flex-row gap-4"
          >
            <input
              className="border-2 border-cyan-400 bg-transparent px-4 py-3 w-full sm:flex-1 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setVideoUrl(null);
              }}
              type="url"
              placeholder="https://..."
            />
            <button className="bg-emerald-500 text-white px-6 py-3 rounded-full hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg cursor-pointer">
              <FaPlay /> Generate
            </button>
          </form>
        </div>

        <div className="w-full md:w-1/2 flex justify-center">
          {videoUrl ? (
            <video
              controls
              className="w-64 sm:w-72 md:w-80 lg:w-96 h-64 sm:h-72 md:h-80 lg:h-96 rounded-2xl shadow-inner border-4 border-gray-600"
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-64 sm:w-72 md:w-80 lg:w-96 h-64 sm:h-72 md:h-80 lg:h-96 bg-gray-700 rounded-2xl flex items-center justify-center shadow-inner border-4 border-gray-600">
              <p className="text-gray-400 text-sm sm:text-base md:text-lg">
                Video Preview
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default VideoSummarize;
