const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');

const arrayMin = (min) => ({
  validator: (arr) => Array.isArray(arr) && arr.length >= min,
  message: `Please select at least ${min}.`,
});

const RecommendationSchema = new mongoose.Schema({
  track: {
    type: String,
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  reason: {
    type: String,
    required: true
  }
});

const AIRecommendationSchema = new mongoose.Schema({
  recommendations: [RecommendationSchema],
  suggestedExpertTags: [String],
  model: String
});

const PreferenceSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    
    // Academic
    currentYear: {
      type: String,
      enum: ["1", "2", "3", "4"],
      required: [true, "Current year is required."],
    },
    currentSemester: {
      type: String,
      enum: ["1", "2"],
      required: [true, "Semester is required."],
    },
    cgpa: {
      type: Number,
      min: [0, "CGPA cannot be less than 0."],
      max: [4, "CGPA cannot exceed 4."],
    },
    alStream: {
      type: String,
      enum: [
        "",
        "Physical Science",
        "Biological Science",
        "Commerce",
        "Arts",
        "Technology",
        "Other",
      ],
      default: "",
    },
    hasPhysicsAndCombinedMaths: { type: Boolean, default: false },

    // Interests
    subjects: { 
      type: [String], 
      validate: arrayMin(1), 
      default: [] 
    },
    excitement: {
      type: String,
      required: [true, "Please tell us what excites you."],
      enum: [
        "Coding",
        "Analyzing Data",
        "Designing Interfaces & Media",
        "Managing IT Systems",
        "Securing Systems & Networks",
        "Building with Hardware/Embedded",
        "Doing Research",
      ]
    },
    programmingSkill: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    },
    mathSkill: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    },
    cyberSkill: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    },
    uiuxSkill: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    },
    researchSkill: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    },
    motivation: { 
      type: Number, 
      min: 1, 
      max: 5, 
      required: true 
    },
    languages: [{ type: String }],
    workStyle: {
      type: String,
      enum: ["Individual", "Team"],
      required: [true, "Work style is required."],
    },
    debugPatience: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: [true, "Please select your debugging patience."],
    },
    hardwareInterest: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    designCreativity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    dataHandlingComfort: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    securityMindset: {
      type: String,
      enum: ["Low", "Medium", "High"],
      required: true
    },
    wantsResearchPath: { 
      type: Boolean, 
      required: true 
    },

    // Careers
    careerGoals: { 
      type: [String], 
      validate: arrayMin(1), 
      required: true 
    },

    // Meta
    additional: { type: String, default: "" },
    consentToShareWithExperts: { 
      type: Boolean, 
      required: true 
    },

    // AI outputs
    aiRecommendation: {
      type: AIRecommendationSchema,
      required: true
    },
  },
  { timestamps: true }
);

// Add pagination plugin
PreferenceSchema.plugin(mongoosePaginate);

// Index for better query performance
PreferenceSchema.index({ email: 1 });
PreferenceSchema.index({ createdAt: -1 });
PreferenceSchema.index({ "aiRecommendation.recommendations.track": 1 });

module.exports = mongoose.model("Preference", PreferenceSchema);