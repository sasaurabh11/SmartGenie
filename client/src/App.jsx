import React, { useContext } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Result from "./pages/Result";
import BuyCredit from "./pages/BuyCredit";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import { AppContext } from "./context/AppContext";
import { ToastContainer } from "react-toastify";

const App = () => {
  const { showLogin, user } = useContext(AppContext);
  return (
    <>
    <div className="px-4 sm:px-10 md:px-14 lg:px-28 min-h-screen bg-gradient-to-b from-[#3d3041] via-[#4a374e] to-[#432d44]">
      <ToastContainer position="bottom-right" />
      <Navbar />

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
      </Routes>
    </div>
      <Footer />
      </>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useContext(AppContext);

  if (user === null) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/" />;
};

export default App;
