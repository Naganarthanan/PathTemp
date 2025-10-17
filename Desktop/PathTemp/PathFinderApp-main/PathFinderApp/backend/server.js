const express = require("express");
const cors = require("cors");
const connectDB = require("./config/database.js");
const dotenv = require("dotenv");
const expertRoute = require("./routes/expertRoute.js");
const path = require("path");
const studentRoute = require("./routes/studentRoute.js");
/* const {
  saveSkillProfile,
} = require("./controllers/aiController/studentPreferController.js"); */
const aiRoute = require("./routes/aiRoute.js");
const cookieParser = require("cookie-parser");
const adminRoute = require("./routes/adminRoute.js");
const { startReminderScheduler } = require("./config/reminderScheduler.js");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

startReminderScheduler();

connectDB();

app.use("/aiRoute", aiRoute);
app.use("/studentRoute", studentRoute);

app.use("/expertRoute", expertRoute);
app.use("/adminRoute", adminRoute);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
