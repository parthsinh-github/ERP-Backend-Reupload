import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },

    // Shared between faculty and admin
    employeeId: { type: String, unique: true, sparse: true },

    // Student specific
    enrollmentNumber: { type: String, unique: true, sparse: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    department: { type: String },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    address: { type: String },
    city: { type: String },
    pincode: { type: String },

    // Common
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["student", "faculty", "admin"],
        required: true
    },
 
    // Admin specific
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        sparse: true,
        default: null
    }

}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
