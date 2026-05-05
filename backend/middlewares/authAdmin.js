import jwt from "jsonwebtoken";


const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;

    const decode = jwt.verify(atoken, process.env.JWT_SECRET);
    req.body.adminId = decode.id;

    next();
  } catch (error) {
    res.json({ success: false, message: "Not Authorized" });
  }
};

export default authAdmin;
