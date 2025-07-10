import { Admin } from "../models/admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🟢 REGISTER ADMIN
export const registerAdmin = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, employeeId, password, secretKey, role = "admin" } = req.body;

        // Secret key check for admin registration
        if (secretKey !== process.env.ADMIN_SECRET_KEY) {
            return res.status(403).json({ success: false, message: "Invalid secret key" });
        }

        if (!fullName || !email || !phoneNumber || !employeeId || !password || !secretKey || !role) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: "Admin already registered" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = await Admin.create({
            fullName,
            email,
            phoneNumber,
            employeeId,
            password: hashedPassword,
            role
        });

        return res.status(201).json({ success: true, message: "Admin registered successfully", admin: newAdmin });
    } catch (error) {
        console.error("Error in registerAdmin:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// 🟢 LOGIN ADMIN
export const loginAdmin = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: "Email, password, and role are required" });
        }

        const admin = await Admin.findOne({ email, role }); // Ensure role matches
        if (!admin) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        // Create JWT token
        const token = jwt.sign(
            { adminId: admin._id, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
        }).json({ success: true, message: `Welcome, ${admin.fullName}`, token, role: admin.role });
    } catch (error) {
        console.error("Error in loginAdmin:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 LOGOUT ADMIN
export const logoutAdmin = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error in logoutAdmin:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
