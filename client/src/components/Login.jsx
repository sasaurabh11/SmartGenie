import React, { useContext, useEffect, useState } from "react";
import userIcon from "../assets/profile_icon.png";
import EmailIcon from "../assets/email_icon.svg";
import LockIcon from "../assets/lock_icon.svg";
import CrossIcon from "../assets/cross_icon.svg";
import { AppContext } from "../context/AppContext";
import { loginUser, signupUser } from "../services/api";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setState] = useState("Login");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { setShowLogin, setToken, setUser, showLogin } = useContext(AppContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === "Login") {
        const data = {
          email,
          password,
        };

        const response = await loginUser(data);

        if (response.success) {
          setToken(response.token);
          setUser(response.user);
          localStorage.setItem("token", response.token);
          setShowLogin(false);
        } else {
          toast.error(response.message);
        }
      } else {
        const data = {
          name,
          email,
          password,
        };

        const response = await signupUser(data);

        if (response.success) {
          setToken(response.token);
          setUser(response.user);
          localStorage.setItem("token", response.token);
          setShowLogin(false);
        } else {
          toast.error(response.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const validatePassword = (pwd) => {
    let errors = [];
    if (pwd.length < 8) errors.push("⚠ Must be at least 8 characters.");
    if (!/[A-Z]/.test(pwd)) errors.push("⚠ Must include an uppercase letter.");
    if (!/[a-z]/.test(pwd)) errors.push("⚠ Must include a lowercase letter.");
    if (!/\d/.test(pwd)) errors.push("⚠ Must include a number.");
    if (!/[@$!%*?&]/.test(pwd))
      errors.push("⚠ Must include a special character.");
    setPasswordError(errors);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center">
      <form
        onSubmit={onSubmitHandler}
        className="relative bg-cyan-200 p-10 rounded-xl text-slate-500"
      >
        <h1 className="text-center text-2xl text-neutral-700 font-medium">
          {state}
        </h1>
        <p className="text-sm">Welcome back! Please sign in to continue</p>

        {state !== "Login" && (
          <div className="border px-5 py-2 flex items-center gap-2 rounded-full mt-5 h-14">
            <img src={userIcon} alt="" width={40} />
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type="text"
              className=" outline-none text-sm"
              placeholder="Your Awesome Name"
              required
            />
          </div>
        )}

        <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4 h-14">
          <img src={EmailIcon} alt="" width={30} />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type="email"
            className=" outline-none text-sm ml-1"
            placeholder="your@gmail.com"
            required
          />
        </div>

        <div className="border px-6 py-2 flex items-center gap-2 rounded-full mt-4 h-14">
          <img src={LockIcon} alt="" width={30} />
          <input
            type="password"
            className=" outline-none text-sm ml-1"
            placeholder="Super Secret Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
            required
          />
        </div>

        {passwordError.length > 0 && (
          <div className="mt-2 ml-2 text-xs text-red-500">
            {passwordError.map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        )}

        <p className="text-sm text-blue-600 my-4 cursor-pointer">
          {" "}
          {state === "Login" ? "Forgot password?" : ""}
        </p>

        <button
          className="bg-blue-600 w-full text-white py-2 rounded-full cursor-pointer"
          disabled={passwordError.length > 0}
        >
          {state === "Login" ? "login" : "create account"}
        </button>

        {state === "Login" ? (
          <p className="mt-5 text-center">
            Don't have an account?
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-600 cursor-pointer"
            >
              Sign up
            </span>
          </p>
        ) : (
          <p className="mt-5 text-center">
            Already have an account?
            <span
              onClick={() => setState("Login")}
              className="text-blue-600 cursor-pointer"
            >
              Login
            </span>
          </p>
        )}

        <img
          onClick={() => setShowLogin(false)}
          src={CrossIcon}
          alt=""
          className="absolute top-5 right-5 cursor-pointer"
        />
      </form>
    </div>
  );
};

export default Login;
