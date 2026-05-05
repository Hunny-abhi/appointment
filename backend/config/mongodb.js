import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("MongoDB Connected");
    });

    mongoose.connection.on("error", (err) => {
      console.log("MongoDB Error:", err);
    });

    await mongoose.connect(
      process.env.MONGODB_URI,
      {
        dbName: "prescripto",
      },
    );
  } catch (error) {
    console.log("DB CONNECTION FAILED:", error.message);
    process.exit(1);
  }
};

export default connectDB;


