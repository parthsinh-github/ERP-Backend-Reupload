import { Report } from "../models/report.js";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { studentId, adminId, type, title, description } = req.body;

    if (!studentId || !adminId || !type || !title) {
      return res.status(400).json({
        success: false,
        message: "Student ID, Admin ID, Type and Title are required.",
      });
    }

    const report = await Report.create({
      studentId,
      adminId,
      type,
      title,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Report created successfully.",
      data: report,
    });
  } catch (error) {
    console.error("Report creation error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Get all reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("studentId", "fullName enrollmentNumber")
      .populate("adminId", "fullName email");

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Fetch reports error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
