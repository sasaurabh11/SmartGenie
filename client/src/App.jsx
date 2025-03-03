import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
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

const App = () => {
  const { showLogin } = useContext(AppContext);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {/* Hard Grid Background */}
      <div className="fixed inset-0 z-[-2] bg-grid-pattern opacity-60"></div>

      {/* Cursor Motion Effect (Smoother Glow) */}
      <motion.div
        className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
        style={{
          position: "fixed",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          filter: "blur(120px)",
          background: "radial-gradient(circle, rgba(255, 0, 150, 0.4) 20%, rgba(0, 0, 0, 0.1) 80%)",
          mixBlendMode: "screen",
          willChange: "transform",
        }}
        animate={{
          x: cursorPos.x - 250,
          y: cursorPos.y - 250,
          transition: { type: "spring", stiffness: 80, damping: 10 },
        }}
      />

      <div className="min-h-screen flex flex-col">
        <ToastContainer position="bottom-right" />
        <Navbar />

        <div className="flex-grow relative">
          {showLogin && <Login />}
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
