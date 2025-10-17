const Student = require("../../models/student");
const bcrypt = require("bcryptjs");

// Register new student
const registerStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber, age, password, confirmPassword } =
      req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !phoneNumber ||
      !age ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      phoneNumber,
      age,
      password, // will be hashed by pre save middleware
    });

    await student.save();
    res
      .status(201)
      .json({ message: "Student registered successfully", student });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


const logoutStudent = (req, res) => {
  res.clearCookie("email");
  return res
    .status(200)
    .send({ success: true, message: "Logged out successfully" });
};

module.exports = { registerStudent, logoutStudent };
