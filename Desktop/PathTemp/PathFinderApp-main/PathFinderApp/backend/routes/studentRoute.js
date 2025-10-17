const express = require("express");
const studentRoute = express.Router();

// Import controller functions properly
const {
  registerStudent,
  logoutStudent,
} = require("../controllers/studentController/studentController");
const {submitFeedback} = require("../controllers/studentController/feedbackController"); 

// Routes
studentRoute.post("/signup", registerStudent); 
studentRoute.post("/feedback", submitFeedback);
studentRoute.post("/logout", logoutStudent);

module.exports = studentRoute;
