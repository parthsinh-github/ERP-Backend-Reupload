import { Staff } from "../models/staff.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🟢 REGISTER STAFF
export const registerStaff = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, employeeId, password } = req.body;

        if (!fullName || !email || !phoneNumber || !employeeId || !password) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const existingStaff = await Staff.findOne({ email });
        if (existingStaff) {
            return res.status(400).json({ success: false, message: "Staff member already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newStaff = await Staff.create({
            fullName,
            email,
            phoneNumber,
            employeeId,
            password: hashedPassword
        });

        return res.status(201).json({ success: true, message: "Staff registered successfully", staff: newStaff });
    } catch (error) {
        console.error("Error in registerStaff:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// 🟢 LOGIN STAFF
export const loginStaff = async (req, res) => {
    // Same as `loginFaculty` but for staff
};

// 🟢 LOGOUT STAFF
export const logoutStaff = async (req, res) => {
    // Same as `logoutFaculty` but for staff
};
