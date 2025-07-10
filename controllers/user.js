import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../models/user.js";

dotenv.config();

const generateToken = (user) => {
  return jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const sanitizeUser = (user) => {
  const {
    password,
    __v,
    ...rest
  } = user.toObject(); // Convert Mongoose doc to plain object and strip sensitive fields
  return rest;
};

// ===================== REGISTER ===================== //
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      department,
      address,
      city,
      pincode,
      enrollmentNumber,
      employeeId,
      gender,
      dateOfBirth,
      role,
      secretKey,
    } = req.body;

    // Secret key check for faculty/admin
    if (role === "faculty" && secretKey !== process.env.FACULTY_SECRET_KEY) {
      return res.status(401).json({ success: false, message: "Invalid faculty secret key" });
    }

    if (role === "admin" && secretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ success: false, message: "Invalid admin secret key" });
    }

    // Existing email check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
      department,
      address,
      city,
      pincode,
      gender,
      dateOfBirth,
      enrollmentNumber,
      employeeId,
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== LOGIN ===================== //
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ email, role }); // Check role to prevent mismatches
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== LOGOUT ===================== //
export const logoutUser = async (req, res) => {
  try {
    // Clear the token cookie or perform logout logic
    res
      .clearCookie("token", {
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -__v");
    // console.log("Fetched users:", users); // Log the fetched users
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
