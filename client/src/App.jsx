import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Result from "./pages/Result";
import BuyCredit from "./pages/BuyCredit";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import { AppContext } from "./context/AppContext";
import { ToastContainer } from "react-toastify";
import VideoSummarize from "./pages/VideoSummarize";
import ChatBot from "./pages/ChatBot";
import LoadingScreen from "./components/LoadingScreen";
import Sidebar from "./components/Sidebar";

const App = () => {
  const { showLogin, user } = useContext(AppContext);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Animated Background */}
      <div className="fixed inset-0 z-[-3] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800"></div>
      
      {/* Particle Background */}
      <div className="fixed inset-0 z-[-2] opacity-30">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 10 + 2 + 'px',
              height: Math.random() * 10 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Cursor Motion Effect */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 100, 255, 0.4) 0%, rgba(0, 0, 0, 0) 70%)",
          mixBlendMode: "screen",
        }}
        animate={{
          x: cursorPos.x - 15,
          y: cursorPos.y - 15,
          transition: { type: "spring", stiffness: 500, damping: 28 },
        }}
      />
      
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50"
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "rgba(255, 100, 255, 0.7)",
        }}
        animate={{
          x: cursorPos.x - 4,
          y: cursorPos.y - 4,
          transition: { type: "spring", stiffness: 1000, damping: 30 },
        }}
      />

      <div className="min-h-screen flex flex-col">
        <ToastContainer 
          position="top-right" 
          theme="dark"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        
        <Navbar />
        
        {user && <Sidebar />}

        <div className={`flex-grow relative ${user ? 'ml-0 md:ml-20' : ''}`}>
          <AnimatePresence>
            {showLogin && <Login />}
          </AnimatePresence>
          
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/result"
              element={
                <ProtectedRoute>
                  <Result />
                </ProtectedRoute>
              }
            />
            <Route path="/buy-credit" element={<BuyCredit />} />
            <Route
              path="/summarize"
              element={
                <ProtectedRoute>
                  <VideoSummarize />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatBot />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>

        <Footer />
      </div>
    </>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AppContext);
  return user ? children : <Navigate to="/" />;
};

export default App;