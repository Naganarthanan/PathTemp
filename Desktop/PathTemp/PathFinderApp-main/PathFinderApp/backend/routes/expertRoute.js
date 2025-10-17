const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createExpert,
  getExperts,
  getExpertById,
  deleteExpert,
  updateExpertByID,
  getExpertStatus,
} = require("../controllers/experts/expertController");

const {
  createMeetingRequest,
  getRequestsByExpertEmail,
  getRequestsByStudentEmail,
} = require("../controllers/experts/meetingRequest");

const MeetingRequest = require("../models/MeetingRequest");

const expertRoute = express.Router();

/* ------------------- Multer Config ------------------- */
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "expert-photos");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    } catch {}
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

/* ------------------- Expert Routes ------------------- */
expertRoute.post("/uploadDetail", upload.single("photo"), createExpert);
expertRoute.get("/getDetail", getExperts);

// Put the more specific route BEFORE the param route
expertRoute.get("/experts/:email/status", getExpertStatus);
expertRoute.get("/experts/:email", getExpertById);
expertRoute.put("/experts/:email", upload.single("photo"), updateExpertByID);
expertRoute.delete("/experts/:id", deleteExpert);

/* ------------------- Meeting Routes ------------------- */
expertRoute.post("/meetingRequests", createMeetingRequest);

// Pick ONE naming style and keep it consistent:
expertRoute.get(
  "/meetingRequests/expert/:expertEmail",
  getRequestsByExpertEmail
);
expertRoute.get(
  "/meetingRequests/student/:studentEmail",
  getRequestsByStudentEmail
);

expertRoute.get(
  "/getRequestsByStudentEmail/:studentEmail",
  getRequestsByStudentEmail
);

expertRoute.get(
  "/getRequestMeeting/:expertEmail",
  getRequestsByExpertEmail
);
// Single authoritative update endpoint (your validated version)
expertRoute.put("/meetingRequests/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, meetingDetails } = req.body;

    if (!["pending", "accepted", "denied"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'pending', 'accepted', or 'denied'.",
      });
    }

    const updateData = { status };

    if (status === "accepted") {
      if (
        !meetingDetails ||
        !meetingDetails.title ||
        !meetingDetails.dateTime ||
        !meetingDetails.meetLink
      ) {
        return res.status(400).json({
          message:
            "Meeting details (title, dateTime, meetLink) are required when accepting a request.",
        });
      }

      if (isNaN(new Date(meetingDetails.dateTime))) {
        return res
          .status(400)
          .json({ message: "Invalid meeting date format." });
      }

      const urlRegex = /^https?:\/\/(www\.)?meet\.google\.com\/[a-zA-Z0-9-]+/;
      if (!urlRegex.test(meetingDetails.meetLink)) {
        return res.status(400).json({ message: "Invalid Google Meet URL." });
      }

      updateData.meetingDetails = {
        title: meetingDetails.title,
        dateTime: meetingDetails.dateTime,
        timeZone: meetingDetails.timeZone || "UTC",
        meetLink: meetingDetails.meetLink,
      };
    } else if (status === "denied") {
      updateData.meetingDetails = null;
    }

    const updatedRequest = await MeetingRequest.findByIdAndUpdate(
      requestId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Meeting request not found." });
    }

    res.status(200).json({
      message: `Meeting request ${status} successfully.`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating meeting request:", error);
    res.status(500).json({
      message: "Server error while updating meeting request.",
      error: error.message,
    });
  }
});

// Schedule directly
expertRoute.put("/meetingRequests/:requestId/schedule", async (req, res) => {
  try {
    const { requestId } = req.params;
    const { meetingDetails } = req.body;

    if (
      !meetingDetails ||
      !meetingDetails.title ||
      !meetingDetails.dateTime ||
      !meetingDetails.meetLink
    ) {
      return res.status(400).json({
        message: "Meeting details (title, dateTime, meetLink) are required.",
      });
    }

    if (isNaN(new Date(meetingDetails.dateTime))) {
      return res.status(400).json({ message: "Invalid meeting date format." });
    }

    const urlRegex = /^https?:\/\/(www\.)?meet\.google\.com\/[a-zA-Z0-9-]+/;
    if (!urlRegex.test(meetingDetails.meetLink)) {
      return res.status(400).json({ message: "Invalid Google Meet URL." });
    }

    const updatedRequest = await MeetingRequest.findByIdAndUpdate(
      requestId,
      {
        meetingDetails: {
          title: meetingDetails.title,
          dateTime: meetingDetails.dateTime,
          timeZone: meetingDetails.timeZone || "UTC",
          meetLink: meetingDetails.meetLink,
        },
        status: "accepted",
      },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Meeting request not found." });
    }

    res.status(200).json({
      message: "Meeting scheduled successfully.",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error scheduling meeting:", error);
    res.status(500).json({
      message: "Server error while scheduling meeting.",
      error: error.message,
    });
  }
});

module.exports = expertRoute;
