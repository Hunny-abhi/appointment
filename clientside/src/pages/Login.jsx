import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [state, setState] = useState("Sign Up");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const validateForm = () => {
    if (!email) {
      toast.error("Email is required");
      return false;
    }

    if (!password) {
      toast.error("Password is required");
      return false;
    }

    if (state === "Sign Up" && !name) {
      toast.error("Name is required");
      return false;
    }

    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      if (state === "Sign Up") {
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });

        if (data.success) {
          toast.success("OTP sent to your email");

          navigate("/verify-otp", { state: { email } });
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });

        if (data.success) {
          localStorage.setItem("token", data.token);
          setToken(data.token);

          toast.success("Login successful");
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/Login");
    }
  }, [token, navigate]);

  const handleVerifyClick = () => {
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }

    navigate("/verify-otp", { state: { email } });
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        {/* TITLE */}
        <p className="text-2xl font-semibold">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </p>

        <p>Please {state === "Sign Up" ? "sign up" : "log in"} to continue</p>

        {state === "Sign Up" && (
          <div className="w-full">
            <p>Full Name</p>
            <input
              className="w-full p-2 mt-1 border rounded"
              type="text"
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
        )}

        <div className="w-full">
          <p>Email</p>
          <input
            className="w-full p-2 mt-1 border rounded"
            type="email"
            placeholder="Enter your email"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </div>

        {/* PASSWORD */}
        <div className="w-full">
          <p>Password</p>
          <input
            className="w-full p-2 mt-1 border rounded"
            type="password"
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </div>

        {state === "Login" && (
          <div className="flex justify-between w-full text-sm">
            <span
              onClick={() => navigate("/forgot-password")}
              className="cursor-pointer text-primary"
            >
              Forgot Password?
            </span>

            <span
              onClick={handleVerifyClick}
              className="cursor-pointer text-primary"
            >
              Verify OTP
            </span>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 text-white rounded-md bg-primary"
        >
          {state === "Sign Up" ? "Create Account" : "Login"}
        </button>

        {state === "Sign Up" ? (
          <p>
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="underline cursor-pointer text-primary"
            >
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="underline cursor-pointer text-primary"
            >
              click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
