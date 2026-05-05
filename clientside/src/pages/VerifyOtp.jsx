import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || localStorage.getItem("otpEmail") || "";

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      localStorage.setItem("otpEmail", location.state.email);
    }
  }, [location.state]);

  useEffect(() => {
    if (!email) {
      console.log("No email found");
    }
  }, [email]);

  // TIMER
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const verifyOTP = async () => {
    if (!otp) return alert("Enter OTP");
    if (!email) return alert("Email missing");

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:4000/api/user/verify-otp",
        { email, otp },
      );

      if (data.success) {
        alert("Email Verified ✅");

        localStorage.removeItem("otpEmail");

        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (!email) return alert("Email missing");

    try {
      await axios.post("http://localhost:4000/api/user/send-otp", { email });

      alert("OTP Sent Again");
      setTimer(60);
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Error sending OTP");
    }
  };

  if (!email) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-3 text-red-500">Email not found</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-white bg-blue-500 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 text-center bg-white rounded-lg shadow-md w-80">
        <h2 className="mb-4 text-xl font-semibold">Verify OTP</h2>

        <p className="mb-3 text-sm text-gray-500">
          OTP sent to <b>{email}</b>
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full px-3 py-2 mb-3 border rounded outline-none"
        />

        <button
          onClick={verifyOTP}
          disabled={loading}
          className="w-full py-2 text-white bg-blue-500 rounded"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div className="mt-4 text-sm">
          {timer > 0 ? (
            <p>Resend in {timer}s</p>
          ) : (
            <button
              onClick={resendOTP}
              className="text-blue-500 hover:underline"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
