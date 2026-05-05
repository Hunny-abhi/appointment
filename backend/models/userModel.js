import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dzcmadjlq/image/upload/v1700000000/default-profile-picture-1_oyh8l7.png",
    },

    // ✅ ADDRESS
    address: {
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
    },

    gender: { type: String, default: "Not Selected" },
    dob: { type: String, default: "Not Selected" },
    phone: { type: String, default: "0000000000" },

    
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: "" },
    otpExpire: { type: Number, default: 0 },

    
    resetOtp: { type: String, default: "" },
    resetOtpExpire: { type: Number, default: 0 },


    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
