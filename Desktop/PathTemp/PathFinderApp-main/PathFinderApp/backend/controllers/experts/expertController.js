const Expert = require("../../models/ExpertSchema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --------- CREATE (always pending) ----------
// controllers/experts/expertController.js

// Create a new expert
const createExpert = async (req, res) => {
  try {
    const {
      name,
      title,
      organization,
      specialization,
      qualification,
      experience,
      bio,
      skills,
      email,
      linkedin,
    } = req.body;

    // Save a browser-servable path
    const photo = req.file
      ? `/uploads/expert-photos/${req.file.filename}`
      : null;

    const newExpert = new Expert({
      name,
      title,
      organization,
      specialization,
      qualification,
      experience,
      bio,
      skills,
      email,
      linkedin,
      photo,
    });

    await newExpert.save();
    return res
      .status(201)
      .json({ message: "Expert registered successfully!", data: newExpert });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// --------- PUBLIC LIST (approved only by default) ----------
const getExperts = async (req, res) => {
  try {
    // If you ever pass ?include=all and you're an admin route, handle there.
    const experts = await Expert.find({ "approval.status": "approved" }).sort({
      createdAt: -1,
    });
    return res.status(200).json(experts);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// --------- LOOKUP BY EMAIL (case-insensitive) ----------
const getExpertById = async (req, res) => {
  try {
    const expert = await Expert.findOne({
      email: new RegExp(`^${req.params.email}$`, "i"),
    });
    if (!expert) return res.status(404).json({ message: "Expert not found" });
    return res.status(200).json(expert);
  } catch (error) {
    console.error("Error fetching expert:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// --------- STATUS for a given email (for expert dashboard) ----------
const getExpertStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const expert = await Expert.findOne({
      email: new RegExp(`^${email}$`, "i"),
    }).select("email approval");
    if (!expert) return res.status(404).json({ message: "Expert not found" });
    return res.json({ email: expert.email, approval: expert.approval });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error", error: e.message });
  }
};

// ---------- Multer config (unchanged except path) ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/expert-photos";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Only images (JPEG, PNG, WEBP) are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ---------- UPDATE ----------
const updateExpertByID = async (req, res) => {
  try {
    const expert = await Expert.findOne({
      email: new RegExp(`^${req.params.email}$`, "i"),
    });
    if (!expert) return res.status(404).json({ message: "Expert not found" });

    const {
      name,
      title,
      organization,
      specialization,
      qualification,
      experience,
      bio,
      linkedin,
      skills,
    } = req.body;

    if (name) expert.name = name;
    if (title) expert.title = title;
    if (organization) expert.organization = organization;
    if (specialization) expert.specialization = specialization;
    if (qualification) expert.qualification = qualification;
    if (experience) expert.experience = experience;
    if (bio) expert.bio = bio;
    if (linkedin) expert.linkedin = linkedin;
    if (skills)
      expert.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim());
    if (req.file) expert.photo = `/uploads/expert-photos/${req.file.filename}`;

    await expert.save();
    return res
      .status(200)
      .json({ message: "Profile updated successfully", expert });
  } catch (error) {
    console.error("Error updating expert:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// ---------- DELETE ----------
const deleteExpert = async (req, res) => {
  try {
    const expert = await Expert.findByIdAndDelete(req.params.id);
    if (!expert) return res.status(404).json({ message: "Expert not found" });
    return res.status(200).json({ message: "Expert deleted successfully" });
  } catch (error) {
    console.error("Error deleting expert:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createExpert,
  getExperts,
  getExpertById,
  getExpertStatus,
  updateExpertByID,
  deleteExpert,
  upload, // export if you want to reuse this multer
};
