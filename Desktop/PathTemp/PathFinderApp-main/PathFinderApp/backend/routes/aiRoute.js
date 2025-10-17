const express = require("express");
const router = express.Router();
const { preferDetails, getAllPreferences, getPreferenceStats } = require("../controllers/aiController");

router.post("/preferDetails", preferDetails);
router.get("/getPreferDetails", getAllPreferences);
router.get("/getPreferDetailsStats", getPreferenceStats);



module.exports = router;
