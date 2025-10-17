const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to send reminder email
const sendMeetingReminder = async (meetingDetails, studentEmail, expertEmail) => {
  const { title, dateTime, timeZone, meetLink } = meetingDetails;
  const formattedDate = new Date(dateTime).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone,
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: [studentEmail, expertEmail].join(","),
    subject: `Meeting Reminder: ${title}`,
    text: `Dear Student and Expert,

This is a reminder for your upcoming meeting:
- Title: ${title}
- Date and Time: ${formattedDate} (${timeZone})
- Google Meet Link: ${meetLink}

Please be prepared to join the meeting on time. If you need to reschedule, contact each other directly.

Best regards,
Your Application Team`,
    html: `
      <h2>Meeting Reminder: ${title}</h2>
      <p>Dear Student and Expert,</p>
      <p>This is a reminder for your upcoming meeting:</p>
      <ul>
        <li><strong>Title:</strong> ${title}</li>
        <li><strong>Date and Time:</strong> ${formattedDate} (${timeZone})</li>
        <li><strong>Google Meet Link:</strong> <a href="${meetLink}">Join Meeting</a></li>
      </ul>
      <p>Please be prepared to join the meeting on time. If you need to reschedule, contact each other directly.</p>
      <p>Best regards,<br>Your Application Team</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${studentEmail} and ${expertEmail} for meeting: ${title}`);
  } catch (error) {
    console.error("Error sending reminder email:", error);
    throw error;
  }
};

module.exports = { sendMeetingReminder };