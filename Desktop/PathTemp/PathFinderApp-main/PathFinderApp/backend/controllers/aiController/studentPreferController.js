const SkillProfile = require("../../models/Preference");

const saveSkillProfile = async (req, res) => {
  try {
    const profile = new SkillProfile(req.body);
    await profile.save();

    const recommendation = suggestSpecialization(req.body);

    res.status(201).json({
      message: "Skill profile saved successfully",
      specialization: recommendation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save profile" });
  }
};

module.exports = { saveSkillProfile };