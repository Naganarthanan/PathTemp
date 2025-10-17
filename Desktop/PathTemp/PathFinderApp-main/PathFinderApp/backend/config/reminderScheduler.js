const cron = require("node-cron");
const { sendMeetingReminder } = require("./emailService");
const moment = require("moment-timezone");
const MeetingRequest = require("../models/MeetingRequest");

const startReminderScheduler = () => {
  // Run every 5 minutes to check for meetings starting in 60-65 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log("Checking for upcoming meetings...");

      const now = moment();
      const inOneHour = moment().add(60, "minutes");
      const inOneHourFiveMinutes = moment().add(65, "minutes");

      // Find accepted meetings within the 60-65 minute window
      const upcomingMeetings = await MeetingRequest.find({
        status: "accepted",
        "meetingDetails.dateTime": {
          $gte: inOneHour.toDate(),
          $lte: inOneHourFiveMinutes.toDate(),
        },
      });

      for (const meeting of upcomingMeetings) {
        const { meetingDetails, studentEmail, expertEmail } = meeting;
        if (meetingDetails && meetingDetails.dateTime) {
          await sendMeetingReminder(meetingDetails, studentEmail, expertEmail);
          console.log(`Reminder sent for meeting: ${meetingDetails.title}`);
        }
      }
    } catch (error) {
      console.error("Error in reminder scheduler:", error);
    }
  });
};

module.exports = { startReminderScheduler };