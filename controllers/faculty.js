import { Faculty } from "../models/faculty.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🟢 REGISTER FACULTY
export const registerFaculty = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, employeeId, department, password, role } = req.body;

        if (!fullName || !email || !phoneNumber || !employeeId || !department || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingFaculty = await Faculty.findOne({ email });
        if (existingFaculty) {
            return res.status(400).json({ success: false, message: "Faculty member already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newFaculty = await Faculty.create({
            fullName,
            email,
            phoneNumber,
            employeeId,
            department,
            password: hashedPassword,
            role: role || "teacher" // Default role is teacher
        });

        return res.status(201).json({ success: true, message: "Faculty registered successfully", faculty: newFaculty });
    } catch (error) {
        console.error("Error in registerFaculty:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 LOGIN FACULTY
export const loginFaculty = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password are required" });
        }

        const faculty = await Faculty.findOne({ email });
        if (!faculty) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, faculty.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const token = jwt.sign({ facultyId: faculty._id, role: faculty.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000
        }).json({ success: true, message: `Welcome, ${faculty.fullName}`, token });
    } catch (error) {
        console.error("Error in loginFaculty:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 LOGOUT FACULTY
export const logoutFaculty = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error in logoutFaculty:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
    