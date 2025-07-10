import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
 
    role: { type: String, default: "admin" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true }
}, { timestamps: true });


export const Admin = mongoose.model("Admin", adminSchema);
