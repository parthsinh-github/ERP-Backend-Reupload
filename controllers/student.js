import { Student } from "../models/student.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Register a new student
// Register a new student
export const registerStudent = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      enrollmentNumber,
      password,
      dateOfBirth,
      gender,
      department,
      address,
      city,
      pincode
    } = req.body;

    // Check for missing fields
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !enrollmentNumber ||
      !password ||
      !dateOfBirth ||
      !gender ||
      !department ||
      !address ||
      !city ||
      !pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: "Student already registered with this email.",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new student
    const newStudent = await Student.create({
      fullName,
      email,
      phoneNumber,
      enrollmentNumber,
      password: hashedPassword,
      dateOfBirth,
      gender,
      department,
      address,
      city,
      pincode,
    });

    return res.status(201).json({
      success: true,
      message: "Student registered successfully.",
      studentId: newStudent._id,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};


// Student Login
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const tokenData = { studentId: student._id };
    const token = jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200)
      .cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true,
        sameSite: "strict",
      })
      .json({
        success: true,
        message: `Welcome back, ${student.fullName}!`,
        student: {
          _id: student._id,
          fullName: student.fullName,
          email: student.email,
          enrollmentNumber: student.enrollmentNumber,
        },
      });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Student Logout
export const logoutStudent = async (req, res) => {
  try {
    return res.status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({
        success: true,
        message: "Logged out successfully.",
      });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error. Please try again later.",
    });
  }
};

// Get all registered students
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().populate("courses");

    res.status(200).json({
      success: true,
      message: "All students fetched successfully.",
      data: students,
    });
  } catch (error) {
    console.error("Fetch Students Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch students. Please try again later.",
    });
  }
};
