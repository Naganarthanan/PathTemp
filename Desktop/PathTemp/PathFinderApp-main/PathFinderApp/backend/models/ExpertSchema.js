// models/ExpertSchema.js
const mongoose = require("mongoose");

const ApprovalSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "denied"],
      default: "pending",
      index: true,
    },
    requestedAt: { type: Date, default: Date.now },
    decidedAt: { type: Date },
    decidedBy: { type: String }, // store admin UID or email from Firebase
    reason: { type: String },
  },
  { _id: false }
);

const ExpertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String },
    organization: { type: String },
    specialization: {
      type: String,
      enum: [
        "Software Engineering",
        "Data Science",
        "Information Technology",
        "Interactive Media",
        "Cyber Security",
      ],
      required: true,
    },
    qualification: { type: String },
    experience: { type: String }, // e.g. "2-5"
    bio: { type: String },
    skills: { type: [String], default: [] },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    linkedin: { type: String },
    photo: { type: String },

    approval: { type: ApprovalSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expert", ExpertSchema);
