import { useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const { backendUrl } = useContext(AppContext); // ✅ FIX
  const navigate = useNavigate();

  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    if (!emailInput) {
      return toast.error("Please enter email");
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${backendUrl}/api/user/forgot-password`, 
        { email: emailInput },
      );

      if (data.success) {
        toast.success("OTP sent to your email");

        // ✅ store email for next page
        // localStorage.setItem("otpEmail", emailInput);

        // navigate("/verify-otp");
        localStorage.setItem("otpEmail", emailInput);
        navigate("/reset-password");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="p-6 bg-white rounded-lg shadow-md w-80">
        <h2 className="mb-4 text-xl font-semibold text-center">
          Forgot Password
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="w-full px-3 py-2 mb-4 border rounded outline-none"
        />

        <button
          onClick={sendOtp}
          disabled={loading}
          className="w-full py-2 text-white rounded bg-primary"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
