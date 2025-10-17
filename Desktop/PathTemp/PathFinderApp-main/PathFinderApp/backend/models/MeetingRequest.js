const mongoose = require('mongoose');

const meetingRequestSchema = new mongoose.Schema({
  studentEmail: { type: String, required: true },
  expertId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Expert" },
  expertName: { type: String, required: true },
  expertEmail: { type: String, required: true },
  specialization: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "denied"], default: "pending" },
  requestedAt: { type: Date, default: Date.now },
  meetingDetails: {
    type: {
      title: { type: String, required: true },
      dateTime: { type: Date, required: true },
      timeZone: { type: String, required: true },
      meetLink: {
        type: String,
        required: true,
        match: [/^https?:\/\/(www\.)?meet\.google\.com\/[a-zA-Z0-9-]+/, "Invalid Google Meet URL"],
      },
    },
    default: null,
  },
});

module.exports = mongoose.model("MeetingRequest", meetingRequestSchema);