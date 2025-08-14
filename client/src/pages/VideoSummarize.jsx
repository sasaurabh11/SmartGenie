import React, { useContext, useState, useRef, useEffect } from "react";
import { FaPlay, FaPaperPlane, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { IoMdInformationCircle } from "react-icons/io";
import genieAnimation from "../assets/ginei-animation1.gif";
import { AppContext } from "../context/AppContext";
import sampleImage from "../assets/ginie-image1.jpg";
import { ragChat } from "../services/api";

const VideoSummarize = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [sending, setSending] = useState(false);
  const [docId, setDocId] = useState();
  const [isMuted, setIsMuted] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { generatecontentsForVideo, prepareVideoFromAssets } =
    useContext(AppContext);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    try {
      setLoading("Generating assets...");
      const path = await generatecontentsForVideo(url);

      if (path) {
        setDocId(path.docId);
        setLoading("Preparing Video...");
        const video = await prepareVideoFromAssets(path);

        setVideoUrl(video);
      }
      setLoading("");
    } catch (error) {
      console.error(error.message);
      setLoading("");
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !docId) return;
    const question = userInput.trim();

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setUserInput("");
    setSending(true);

    try {
      const data = await ragChat(question, docId);
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: data.message },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: "❌ Failed to get response from AI." },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Server error, please try again." },
      ]);
    } finally {
      setSending(false);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center px-4 md:px-8 lg:px-16 xl:px-24 pt-4 lg:pt-8 pb-10">
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 bg-opacity-90 z-50">
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

      <div className="max-w-7xl w-full space-y-8">
        <main className="w-full bg-gray-800/80 backdrop-blur-sm shadow-2xl rounded-3xl p-6 sm:p-10 md:p-12 lg:p-16 text-white flex flex-col md:flex-row items-center gap-6 lg:gap-12 border border-gray-700/50 hover:border-cyan-400/30 transition-all duration-300">
          <div className="flex flex-col text-center md:text-left w-full md:w-1/2">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-extrabold uppercase leading-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-500">
                URL to Video
              </h1>
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <IoMdInformationCircle size={20} />
              </button>
            </div>
            
            {showInfo && (
              <div className="mb-4 p-3 bg-gray-700/50 rounded-lg text-sm text-gray-300 animate-fadeIn">
                <p>Enter any article URL and SmartGenie will transform it into an engaging video summary. After generation, you can chat with the AI about the content.</p>
              </div>
            )}

            <p className="text-gray-400 mt-2 text-sm sm:text-base md:text-lg lg:text-xl">
              Transform articles into videos with the power of SmartGenie AI.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 w-full flex flex-col sm:flex-row gap-4"
            >
              <input
                className="border-2 border-cyan-400/50 bg-gray-900/50 px-4 py-3 w-full sm:flex-1 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent transition-all duration-200 hover:border-cyan-400/80"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setVideoUrl(null);
                }}
                type="url"
                placeholder="https://example.com/article..."
                required
              />
              <button 
                type="submit"
                className="bg-gradient-to-r from-emerald-500 to-cyan-600 text-white px-6 py-3 rounded-full hover:from-emerald-600 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg cursor-pointer shadow-lg hover:shadow-cyan-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={!url}
              >
                <FaPlay /> Generate
              </button>
            </form>
          </div>

          <div className="w-full md:w-1/2 flex justify-center relative group">
            {videoUrl ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  controls
                  className="w-64 sm:w-72 md:w-80 lg:w-96 h-64 sm:h-72 md:h-80 lg:h-96 rounded-2xl shadow-lg border-4 border-gray-600/50 hover:border-cyan-400/50 transition-all duration-300"
                  autoPlay
                  muted={isMuted}
                  loop
                >
                  <source src={videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <button
                  onClick={toggleMute}
                  className="absolute bottom-4 right-4 bg-gray-900/70 p-2 rounded-full text-white hover:bg-gray-800 transition-all"
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
              </div>
            ) : (
              <div className="w-64 sm:w-72 md:w-80 lg:w-96 h-64 sm:h-72 md:h-80 lg:h-96 bg-gray-900/50 rounded-2xl flex flex-col gap-10 items-center justify-center shadow-lg border-4 border-dashed border-gray-600/50 hover:border-cyan-400/30 transition-all duration-300">
                <p className="text-gray-400 text-sm sm:text-base md:text-lg font-bold">
                  Video Preview
                </p>
                <div className="relative group">
                  <img
                    src={sampleImage}
                    alt="Video Preview"
                    className="w-40 sm:w-52 md:w-64 lg:w-72 max-h-40 sm:max-h-52 md:max-h-64 lg:max-h-72 rounded-xl object-cover shadow-2xl transition-all transform group-hover:scale-105 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>
            )}
          </div>
        </main>

        {videoUrl && (
          <div className="w-full bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg flex flex-col border border-gray-700/50 hover:border-cyan-400/30 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                💬 Ask About Your Content
              </h2>
              <div className="text-sm text-gray-400">
                {messages.length > 0 && `${messages.length} messages`}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-64 md:max-h-80 mb-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Ask questions about the video content...</p>
                  <p className="text-sm mt-2">Try: "Summarize the key points"</p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl max-w-xs md:max-w-md lg:max-w-lg ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-cyan-600 to-cyan-700 text-white self-end ml-auto"
                        : "bg-gray-700/80 text-gray-200 self-start"
                    } transition-all duration-200 hover:scale-[1.02]`}
                  >
                    {msg.text}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask about the video content..."
                className="flex-1 px-4 py-3 bg-gray-900/50 rounded-full text-white focus:outline-none border border-gray-600/50 focus:border-cyan-400/50 transition-all duration-200"
              />
              <button
                onClick={sendMessage}
                disabled={sending || !userInput.trim()}
                className={`p-3 rounded-full transition-all duration-200 ${
                  sending || !userInput.trim()
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:from-cyan-600 hover:to-emerald-600"
                }`}
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default VideoSummarize;