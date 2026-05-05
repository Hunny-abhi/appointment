import React, { useContext, useState } from "react";
import { AdminContext } from "../context/AdminContext";
import { DoctorContext } from "../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [state, setState] = useState("Admin");
  const [isRegister, setIsRegister] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { setAToken, backendUrl } = useContext(AdminContext);
  const { setDToken } = useContext(DoctorContext);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === "Admin") {
        if (isRegister) {
          const { data } = await axios.post(
            backendUrl + "/api/admin/register",
            { name, email, password },
          );

          if (data.success) {
            toast.success("Admin Registered");
            setIsRegister(false);
          } else toast.error(data.message);
        } else {
          const { data } = await axios.post(backendUrl + "/api/admin/login", {
            email,
            password,
          });

          if (data.success) {
            localStorage.setItem("aToken", data.token);
            setAToken(data.token);
          } else toast.error(data.message);
        }
      } else {
        if (isRegister) {
          const { data } = await axios.post(
            backendUrl + "/api/doctor/register",
            { name, email, password },
          );

          if (data.success) {
            toast.success("Doctor Registered");
            setIsRegister(false);
          } else toast.error(data.message);
        } else {
          const { data } = await axios.post(backendUrl + "/api/doctor/login", {
            email,
            password,
          });

          if (data.success) {
            localStorage.setItem("dToken", data.token);
            setDToken(data.token);
          } else toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200">
      {/* Card */}
      <form
        onSubmit={onSubmitHandler}
        className="bg-white p-8 rounded-2xl shadow-xl w-[350px] transform transition-all duration-500 hover:scale-105"
      >
        {/* Title */}
        <h2 className="mb-6 text-2xl font-bold text-center">
          <span className="text-primary">{state}</span>{" "}
          {isRegister ? "Register" : "Login"}
        </h2>

        {/* Toggle Buttons */}
        <div className="flex justify-between p-1 mb-6 bg-gray-100 rounded-full">
          <button
            type="button"
            onClick={() => {
              setState("Admin");
              setIsRegister(false);
            }}
            className={`w-1/2 py-1 rounded-full transition ${
              state === "Admin" ? "bg-primary text-white" : ""
            }`}
          >
            Admin
          </button>

          <button
            type="button"
            onClick={() => {
              setState("Doctor");
              setIsRegister(false);
            }}
            className={`w-1/2 py-1 rounded-full transition ${
              state === "Doctor" ? "bg-primary text-white" : ""
            }`}
          >
            Doctor
          </button>
        </div>

        {/* Name (Animated) */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            isRegister ? "max-h-20 opacity-100 mb-3" : "max-h-0 opacity-0"
          }`}
        >
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded focus:outline-primary"
          />
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-3 border rounded focus:outline-primary"
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded focus:outline-primary"
          required
        />

        {/* Button */}
        <button className="w-full py-2 text-white transition rounded-lg bg-primary hover:opacity-90">
          {isRegister ? "Create Account" : "Login"}
        </button>

        {/* Switch Register/Login */}
        <p className="mt-4 text-sm text-center">
          {isRegister ? "Already have account?" : "New user?"}
          <span
            className="ml-1 cursor-pointer text-primary"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
