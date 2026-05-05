import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 👇 OPTIONAL FIELDS (IMPORTANT FIX)
    image: { type: String, default: "" },
    speciality: { type: String, default: "" },
    degree: { type: String, default: "" },
    experience: { type: String, default: "" },
    about: { type: String, default: "" },
    fees: { type: Number, default: 0 },
    address: { type: Object, default: {} },

    available: { type: Boolean, default: true },
    date: { type: Number, required: true },
    slots_booked: { type: Object, default: {} },
  },
  { minimize: false },
);

const doctorModel =
  mongoose.models.doctor || mongoose.model("doctor", doctorSchema);

export default doctorModel;
