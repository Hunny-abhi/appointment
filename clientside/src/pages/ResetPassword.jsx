import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();

  const email = localStorage.getItem("otpEmail");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleReset = async () => {
    if (!otp || !newPassword) {
      return alert("Fill all fields");
    }

    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/user/reset-password",
        {
          email,
          otp,
          newPassword,
        },
      );

      if (data.success) {
        alert("Password Reset Successful ✅");

        localStorage.removeItem("otpEmail");
        navigate("/login");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
      alert("Error resetting password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 bg-white rounded shadow w-80">
        <h2 className="mb-4 text-xl font-semibold">Reset Password</h2>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 mb-3 border rounded"
        />

        <button
          onClick={handleReset}
          className="w-full py-2 text-white bg-green-500 rounded"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
