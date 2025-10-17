const express = require("express");
const router = express.Router();
const Feedback = require("../models/feedback");
const Expert = require("../models/ExpertSchema");
// Get all feedback with filtering and sorting options
router.get("/feedback", async (req, res) => {
  try {
    const { rating, status, sortBy, search } = req.query;

    // Build filter object
    let filter = {};
    if (rating && rating !== "0") {
      filter.rating = parseInt(rating);
    }
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { feedback: { $regex: search, $options: "i" } },
        { userEmail: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case "oldest":
        sort.createdAt = 1;
        break;
      case "highest":
        sort.rating = -1;
        break;
      case "lowest":
        sort.rating = 1;
        break;
      default: // newest
        sort.createdAt = -1;
    }

    const feedbacks = await Feedback.find(filter).sort(sort);
    res.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ message: "Error fetching feedback" });
  }
});

// Update feedback status
router.patch("/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(feedback);
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({ message: "Error updating feedback status" });
  }
});

// Add reply to feedback
router.post("/feedback/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const feedback = await Feedback.findByIdAndUpdate(
      id,
      {
        reply,
        repliedAt: new Date(),
        status: "replied",
      },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(feedback);
  } catch (error) {
    console.error("Error adding reply to feedback:", error);
    res.status(500).json({ message: "Error adding reply to feedback" });
  }
});

// Delete feedback
router.delete("/feedback/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findByIdAndDelete(id);

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ message: "Error deleting feedback" });
  }
});

// Get feedback statistics
router.get("/feedback-stats", async (req, res) => {
  try {
    const total = await Feedback.countDocuments();
    const newCount = await Feedback.countDocuments({ status: "new" });
    const repliedCount = await Feedback.countDocuments({ status: "replied" });
    const resolvedCount = await Feedback.countDocuments({ status: "resolved" });

    // Average rating
    const avgRatingResult = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
        },
      },
    ]);

    const avgRating =
      avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({
      total,
      new: newCount,
      replied: repliedCount,
      resolved: resolvedCount,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingDistribution,
    });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    res.status(500).json({ message: "Error fetching feedback statistics" });
  }
});

router.get("/experts", async (req, res) => {
  try {
    const { status } = req.query;
    const q = {};
    if (status) q["approval.status"] = status;
    const rows = await Expert.find(q).sort({ "approval.requestedAt": -1 });
    return res.json(rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/experts/:id/approve
router.post("/experts/:id/approve", async (req, res) => {
  try {
    const adminId = req.user?.uid || req.user?.email || "unknown_admin";
    const expert = await Expert.findOne({
      _id: req.params.id,
      "approval.status": "pending",
    });
    if (!expert)
      return res.status(404).json({ message: "Pending expert not found" });

    expert.approval.status = "approved";
    expert.approval.decidedAt = new Date();
    expert.approval.decidedBy = adminId;
    expert.approval.reason = undefined;
    await expert.save();

    return res.json({ message: "Expert approved" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/admin/experts/:id/deny
router.post("/experts/:id/deny", async (req, res) => {
  try {
    const { reason } = req.body || {};
    const adminId = req.user?.uid || req.user?.email || "unknown_admin";
    const expert = await Expert.findOne({
      _id: req.params.id,
      "approval.status": "pending",
    });
    if (!expert)
      return res.status(404).json({ message: "Pending expert not found" });

    expert.approval.status = "denied";
    expert.approval.decidedAt = new Date();
    expert.approval.decidedBy = adminId;
    expert.approval.reason = reason?.trim() || undefined;
    await expert.save();

    return res.json({ message: "Expert denied" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
