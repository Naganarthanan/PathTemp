const MeetingRequest = require("../../models/MeetingRequest");

// 1️⃣ Create a new meeting request
exports.createMeetingRequest = async (req, res) => {
  try {
    console.log("Requestttt : ", req.body);
    const {
      studentEmail,
      expertId,
      expertName,
      expertEmail,
      specialization,
      requestedAt,
    } = req.body;

    // Validate required fields
    if (
      !studentEmail ||
      !expertId ||
      !expertName ||
      !expertEmail ||
      !specialization
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided" });
    }

    const newRequest = new MeetingRequest({
      studentEmail,
      expertId,
      expertName,
      expertEmail,
      specialization,
      status: "pending",
      requestedAt: requestedAt || Date.now(),
      meetingDetails: null, // Keep null initially
    });

    const savedRequest = await newRequest.save();
    res
      .status(201)
      .json({ message: "Meeting request created", data: savedRequest });
  } catch (error) {
    console.error("Error creating meeting request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 2️⃣ Get all meeting requests for a student by email
exports.getRequestsByStudentEmail = async (req, res) => {
  try {
    const { studentEmail } = req.params;
    const requests = await MeetingRequest.find({
      studentEmail: { $regex: new RegExp(`^${studentEmail}$`, "i") },
    });
    res.status(200).json(requests);
    console.log("Student Email:", studentEmail);
    console.log("Requests for student:", requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 3️⃣ Get all meeting requests for an expert by email
exports.getRequestsByExpertEmail = async (req, res) => {
  try {
    const { expertEmail } = req.params;
    const requests = await MeetingRequest.find({
      expertEmail: { $regex: new RegExp(`^${expertEmail}$`, "i") },
    });
    res.status(200).json(requests);
    console.log("Expert Email:", expertEmail);
    console.log("Requests for expert:", requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 4️⃣ Update meeting request status (accept/deny) with optional meetingDetails
exports.updateMeetingRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, meetingDetails } = req.body;

    // Validate status
    if (!["pending", "accepted", "denied"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'pending', 'accepted', or 'denied'",
      });
    }

    // Validate meetingDetails for accepted requests
    if (status === "accepted") {
      if (
        !meetingDetails ||
        !meetingDetails.title ||
        !meetingDetails.dateTime ||
        !meetingDetails.meetLink
      ) {
        return res.status(400).json({
          message:
            "Meeting details (title, dateTime, and meetLink) are required when accepting a request",
        });
      }

      // Validate dateTime format
      if (isNaN(new Date(meetingDetails.dateTime))) {
        return res.status(400).json({
          message: "Invalid meeting date and time format",
        });
      }

      // Validate meetLink format
      const urlRegex = /^https?:\/\/(www\.)?meet\.google\.com\/[a-zA-Z0-9-]+/;
      if (!urlRegex.test(meetingDetails.meetLink)) {
        return res.status(400).json({
          message: "Invalid Google Meet URL",
        });
      }
    }

    // Prepare update object
    const updateData = { status };

    // Set meetingDetails for accepted requests or null for denied requests
    if (status === "accepted") {
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
      return res.status(404).json({ message: "Meeting request not found" });
    }

    res.status(200).json({
      message: `Meeting request ${status} successfully`,
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error updating meeting request:", error);
    res.status(500).json({
      message: "Server error while updating meeting request",
      error: error.message,
    });
  }
};

// 5️⃣ Reschedule an already accepted meeting
exports.rescheduleMeeting = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { meetingDetails } = req.body;

    // Validate meetingDetails
    if (
      !meetingDetails ||
      !meetingDetails.title ||
      !meetingDetails.dateTime ||
      !meetingDetails.meetLink
    ) {
      return res.status(400).json({
        message: "Meeting details (title, dateTime, and meetLink) are required",
      });
    }

    // Validate dateTime format
    if (isNaN(new Date(meetingDetails.dateTime))) {
      return res.status(400).json({
        message: "Invalid meeting date and time format",
      });
    }

    // Validate meetLink format
    const urlRegex = /^https?:\/\/(www\.)?meet\.google\.com\/[a-zA-Z0-9-]+/;
    if (!urlRegex.test(meetingDetails.meetLink)) {
      return res.status(400).json({
        message: "Invalid Google Meet URL",
      });
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
      },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Meeting request not found" });
    }

    res.status(200).json({
      message: "Meeting rescheduled successfully",
      data: updatedRequest,
    });
  } catch (error) {
    console.error("Error rescheduling meeting:", error);
    res.status(500).json({
      message: "Server error while rescheduling meeting",
      error: error.message,
    });
  }
};
