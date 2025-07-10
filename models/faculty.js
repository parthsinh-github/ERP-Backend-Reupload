import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    employeeId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    subjects: [{ type: String, required: true }],
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],

    // Special Roles: Teacher (default), HOD, Principal
    role: { 
      type: String, 
      enum: ["teacher", "hod", "principal"], 
      default: "teacher"
    }
  },
  { timestamps: true }
);

export const Faculty = mongoose.model("Faculty", facultySchema);
