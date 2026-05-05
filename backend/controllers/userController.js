import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import nodemailer from "nodemailer";
import generateOtp from "../utils/generateOtp.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // 🔍 1. Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log(" OTP request for:", email);

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOtp();

    console.log(" Generated OTP:", otp);

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    const mailResponse = await transporter.sendMail({
      from: `"Prescripto" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family:Arial">
          <h2>OTP Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });

    console.log(" Email sent:", mailResponse.messageId);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(" SEND OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    email = email.trim().toLowerCase();
    otp = otp.toString().trim();

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    user.isVerified = true;
    user.otp = "";
    user.otpExpire = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email Verified Successfully",
    });
  } catch (error) {
    console.log("VERIFY OTP ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = generateOtp();

    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 5 * 60 * 1000;

    await user.save();

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Reset Password OTP",
      text: `Your OTP is ${otp}`,
    });

    res.json({ success: true, message: "OTP Sent" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await userModel.findOne({ email });

    if (!user || user.resetOtp !== otp || user.resetOtpExpire < Date.now()) {
      return res.json({ success: false, message: "Invalid or Expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpire = 0;

    await user.save();

    res.json({ success: true, message: "Password Reset Successful" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid Email" });
    }

    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpire = Date.now() + 5 * 60 * 1000;
    await user.save();

    console.log("OTP GENERATED:", otp);

    // 🔥 SEND EMAIL
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Verify Your Email OTP",
      text: `Your OTP is: ${otp}`,
    });

    return res.json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 CHECK USER
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      success: true,
      token,
      isAdmin: user.isAdmin || false,
      message: "Login successful",
    });
  } catch (error) {
    console.log("LOGIN ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId).select("-password");

    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, name, phone, address, dob, gender } = req.body;

    await userModel.findByIdAndUpdate(userId, {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    });

    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path);
      await userModel.findByIdAndUpdate(userId, {
        image: upload.secure_url,
      });
    }

    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { userId, docId, slotDate, slotTime } = req.body;

    const doctor = await doctorModel.findById(docId);

    let slots_booked = doctor.slots_booked || {};

    if (slots_booked[slotDate]?.includes(slotTime)) {
      return res.json({ success: false, message: "Slot not available" });
    }

    slots_booked[slotDate] = [...(slots_booked[slotDate] || []), slotTime];

    const user = await userModel.findById(userId);

    await appointmentModel.create({
      userId,
      docId,
      userData: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
      docData: {
        name: doctor.name,
        image: doctor.image,
        speciality: doctor.speciality,
        fees: doctor.fees,
        address: doctor.address || {},
      },
      amount: doctor.fees,
      slotDate,
      slotTime,
      date: Date.now(),
    });

    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.json({ success: true, message: "Appointment Booked" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const listAppointment = async (req, res) => {
  try {
    const { userId } = req.body;

    const appointments = await appointmentModel.find({ userId });

    res.json({ success: true, appointments });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { userId, appointmentId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    const doctor = await doctorModel.findById(appointment.docId);

    let slots_booked = doctor.slots_booked;

    slots_booked[appointment.slotDate] = slots_booked[
      appointment.slotDate
    ].filter((t) => t !== appointment.slotTime);

    await doctorModel.findByIdAndUpdate(appointment.docId, {
      slots_booked,
    });

    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  sendOtp,
  verifyOtp,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
};
