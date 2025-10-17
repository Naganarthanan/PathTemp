const SystemFeedback = require("../../models/feedback");

// Save system feedback
const submitFeedback = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
 
    // Validate input
    if (!rating || !feedback) {
      return res.status(400).json({ message: "Rating and feedback are required" });
    }

    const newFeedback = new SystemFeedback({ rating, feedback });
    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

const getFeedback = async (req, res) => {
  try {
    const feedbacks = await SystemFeedback.find().sort({ createdAt: -1 }); // latest first
    res.json(feedbacks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch feedback" });
  }
};

module.exports = {submitFeedback, getFeedback};