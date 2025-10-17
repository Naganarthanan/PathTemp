const Preference = require("../models/Preference");
const OpenAI = require("openai");
const { z } = require("zod");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const TRACKS = [
  "Software Engineering",
  "Information Technology",
  "Data Science",
  "Computer Systems & Network Engineering",
  "Cyber Security",
  "Information Systems Engineering",
  "Interactive Media",
  "Computer Science",
  "Computer Systems Engineering",
];

// ---------- Zod validation (pre-DB, pre-OpenAI) ----------
const tri = z.enum(["Low", "Medium", "High"]);
const schema = z.object({
  currentYear: z.enum(["1", "2", "3", "4"], {
    message: "Please select Year 1–4.",
  }),
  currentSemester: z.enum(["1", "2"], {
    message: "Please select Semester 1 or 2.",
  }),
  cgpa: z
    .union([
      z.number().min(0).max(4),
      z.string().refine((v) => v === "", "Invalid CGPA."),
    ])
    .optional(),
  alStream: z.enum([
    "",
    "Physical Science",
    "Biological Science",
    "Commerce",
    "Arts",
    "Technology",
    "Other",
  ]),
  hasPhysicsAndCombinedMaths: z.boolean(),
  subjects: z
    .array(
      z.enum(["Programming", "Mathematics", "Networking", "Design", "Research"])
    )
    .min(1, "Pick at least one subject."),
  excitement: z.enum(
    [
      "Coding",
      "Analyzing Data",
      "Designing Interfaces & Media",
      "Managing IT Systems",
      "Securing Systems & Networks",
      "Building with Hardware/Embedded",
      "Doing Research",
    ],
    { message: "Tell us what excites you." }
  ),
  programmingSkill: z.number().min(1).max(5),
  mathSkill: z.number().min(1).max(5),
  cyberSkill: z.number().min(1).max(5),
  uiuxSkill: z.number().min(1).max(5),
  researchSkill: z.number().min(1).max(5),
  motivation: z.number().min(1).max(5),
  languages: z.array(z.string()).optional().default([]),
  workStyle: z.enum(["Individual", "Team"], {
    message: "Work style is required.",
  }),
  debugPatience: z.enum(["Low", "Medium", "High"], {
    message: "Select your patience level.",
  }),
  hardwareInterest: tri,
  designCreativity: tri,
  dataHandlingComfort: tri,
  securityMindset: tri,
  wantsResearchPath: z.boolean(),
  careerGoals: z
    .array(
      z.enum([
        "Software Engineer",
        "Full Stack Developer",
        "Mobile Developer",
        "Data Scientist",
        "Data Engineer",
        "ML/AI Engineer",
        "Network Engineer",
        "DevOps/Cloud Engineer",
        "Cyber Security Analyst",
        "Business Analyst",
        "Systems Analyst",
        "Product Owner",
        "UI/UX Designer",
        "Game Developer",
        "Research/Academia",
      ])
    )
    .min(1, "Select at least one career goal."),
  additional: z.string().max(1000).optional().default(""),
  consentToShareWithExperts: z.boolean(),
});

// ---------- Heuristics ----------
function coarseHeuristics(p) {
  const S = (v) => Number(v || 0);
  const pick = {};
  pick["Software Engineering"] =
    15 * S(p.programmingSkill) +
    5 * (p.debugPatience === "High") +
    5 * (p.workStyle === "Team");
  pick["Information Technology"] =
    10 * S(p.programmingSkill) +
    10 * (p.workStyle !== "") +
    10 * (p.excitement === "Managing IT Systems");
  pick["Data Science"] =
    12 * S(p.mathSkill) +
    10 * (p.dataHandlingComfort === "High") +
    6 * (p.excitement === "Analyzing Data");
  pick["Computer Systems & Network Engineering"] =
    8 * S(p.programmingSkill) +
    10 * (p.hardwareInterest === "High") +
    10 * (p.subjects || []).includes("Networking");
  pick["Cyber Security"] =
    10 * S(p.cyberSkill) +
    10 * (p.securityMindset === "High") +
    8 * (p.excitement === "Securing Systems & Networks");
  pick["Information Systems Engineering"] =
    8 * S(p.programmingSkill) +
    8 * (p.careerGoals || []).includes("Business Analyst") +
    6 * (p.careerGoals || []).includes("Systems Analyst");
  pick["Interactive Media"] =
    12 * S(p.uiuxSkill) +
    10 * (p.designCreativity === "High") +
    8 * String(p.excitement || "").includes("Media");
  pick["Computer Science"] =
    12 * S(p.mathSkill) + 6 * S(p.researchSkill) + 6 * p.wantsResearchPath;
  pick["Computer Systems Engineering"] =
    10 * (p.hardwareInterest === "High") +
    8 * p.hasPhysicsAndCombinedMaths +
    8 * S(p.mathSkill);

  (p.careerGoals || []).forEach((role) => {
    if (role.includes("Data")) pick["Data Science"] += 6;
    if (role.includes("ML") || role.includes("AI")) {
      pick["Data Science"] += 4;
      pick["Computer Science"] += 5;
    }
    if (
      role.includes("Network") ||
      role.includes("DevOps") ||
      role.includes("Cloud")
    ) {
      pick["Computer Systems & Network Engineering"] += 6;
      pick["Information Technology"] += 4;
    }
    if (role.includes("Cyber")) pick["Cyber Security"] += 8;
    if (role.includes("UI/UX") || role.includes("Game"))
      pick["Interactive Media"] += 8;
    if (role.includes("Research")) pick["Computer Science"] += 6;
  });

  const max = Math.max(...Object.values(pick));
  return Object.entries(pick)
    .map(([track, score]) => ({
      track,
      percentage: max > 0 ? Math.round((score / max) * 100) : 50,
    }))
    .sort((a, b) => b.percentage - a.percentage);
}

// ---------- Controller ----------
exports.preferDetails = async (req, res) => {
  // Read student email from cookies (supports signed + unsigned)
  const cookieEmail = req.cookies.email || null;
  console.log(cookieEmail);

  // normalize cgpa to number if present
  if (typeof req.body?.cgpa === "string" && req.body.cgpa.trim() !== "") {
    req.body.cgpa = Number(req.body.cgpa);
  }

  // Zod validation
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    const fieldErrors = {};
    parsed.error.issues.forEach((i) => {
      const k = i.path[0] ?? "form";
      fieldErrors[k] = i.message;
    });
    return res
      .status(400)
      .json({ errors: fieldErrors, message: "Validation failed." });
  }
  const payload = parsed.data;

  try {
    const heuristicTop5 = coarseHeuristics(payload).slice(0, 5);

    const system = `
You are an academic advisor for the SLIIT Faculty of Computing.
Tracks: ${TRACKS.join(", ")}.
Return strict JSON:
{
  "recommendations": [
    {
      "track": "",
      "percentage": 0,  // CHANGED FROM "score" TO "percentage"
      "reason": "",
      "roles": [],             // example: ["Software Engineer", "DevOps Engineer"]
      "requiredSkills": [],    // core skills needed now
      "developNext": [],       // skills to develop next
      "learningEase": "Easy|Moderate|Challenging",
      "futureScope": "",
      "opportunities": ""      // job market outlook
    }
  ],
  "suggestedExpertTags": ["","","","",""],   // at least 5 items
  "summary": ""   // <= 4 lines, concise, professional; include job roles, job opportunities, required skills, skills to be developed, learning easiness, future scope, and a final verdict. Weave in 'additional' if present. Use integer percentages only.
}
Guidelines:
- Recommend ONLY the top 3 tracks; base percentages on the provided heuristicTop5 (0–100).
- If CGPA < 2.5, add a brief GPA-improvement note in the summary.
- De-emphasize CS/CSNE without Physics/Combined Maths unless other signals are strong.
- Do NOT invent new tracks. Keep wording crisp.
- Use "percentage" field (not "score") for match percentages.
`.trim();

    const student = {
      email: cookieEmail,
      payload,
      heuristicTop5,
    };

    let ai = null;
    try {
      const completion = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: JSON.stringify(student) },
        ],
      });
      ai = JSON.parse(completion?.choices?.[0]?.message?.content || "{}");

      // Ensure we have percentage values (fallback for score field)
      if (ai.recommendations) {
        ai.recommendations = ai.recommendations.map((rec) => {
          // If OpenAI returns "score" instead of "percentage", convert it
          if (rec.score !== undefined && rec.percentage === undefined) {
            rec.percentage = rec.score;
            delete rec.score;
          }
          return rec;
        });
      }
    } catch (error) {
      console.error("OpenAI API error:", error);
      // fall back to heuristics if OpenAI fails
      const top3 = heuristicTop5.slice(0, 3);
      ai = {
        recommendations: top3.map((r) => ({
          track: r.track,
          percentage: r.percentage, // Using percentage directly
          reason: "Aligned with your interests and skills.",
          roles: [
            "Software Engineer",
            "Data Scientist",
            "Cyber Security Analyst",
            "Network Engineer",
            "Business Analyst",
          ].slice(0, 3),
          requiredSkills: [
            "Programming fundamentals",
            "Problem solving",
            "Databases",
          ],
          developNext: ["Algorithms & Data Structures", "Cloud basics"],
          learningEase: "Moderate",
          futureScope: "Strong demand across industries",
          opportunities: "Local and international openings",
        })),
        suggestedExpertTags: [
          "Senior Software Engineer",
          "Data Scientist",
          "DevOps/Cloud Engineer",
          "Cyber Security Analyst",
          "Network Engineer",
        ],
        summary:
          `Top tracks: ${top3
            .map((t) => `${t.track} ${t.percentage}%`)
            .join(", ")}.\n` +
          `Roles & opportunities: Software/Data/Cyber – strong local & global demand.\n` +
          `Required: programming, DBs; develop: DSA, cloud; Ease: Moderate; Scope: high.\n` +
          `Final verdict: choose ${top3[0].track}.`,
      };
    }

    // Format AI recommendations to match the schema
    const aiRecommendation = {
      recommendations: ai.recommendations.map((rec) => ({
        track: rec.track,
        score: rec.percentage || 0, // Store percentage as score in DB
        reason: rec.reason || "",
      })),
      suggestedExpertTags: ai.suggestedExpertTags || [],
      model: "gpt-5",
    };

    // Save EVERYTHING (payload + AI + email) to DB
    const preferenceData = {
      email: cookieEmail,
      ...payload,
      aiRecommendation: aiRecommendation,
    };

    await Preference.create(preferenceData);

    // Send response with percentage values for frontend
    return res.json({
      email: cookieEmail,
      summary: ai.summary,
      recommendations: ai.recommendations.map((rec) => ({
        ...rec,
        percentage: rec.percentage || rec.score || 0, // Ensure percentage field exists
      })),
      expertTypes: ai.suggestedExpertTags || [],
    });
  } catch (err) {
    console.error("Error in preferDetails:", err);
    if (err?.name === "ValidationError") {
      const fieldErrors = {};
      Object.keys(err.errors || {}).forEach(
        (k) => (fieldErrors[k] = err.errors[k].message)
      );
      return res
        .status(400)
        .json({ errors: fieldErrors, message: "Validation failed." });
    }
    return res.status(500).json({ message: "Internal server error." });
  }
};

// ---------- Get all preferences (for admin) ----------
exports.getAllPreferences = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build filter object
    let filter = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: "i" } },
        {
          "aiRecommendation.recommendations.track": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    const preferences = await Preference.paginate(filter, options);

    // Transform data to include percentage for frontend
    const transformedPreferences = preferences.docs.map((pref) => {
      const transformed = pref.toObject();

      // Add percentage field for frontend compatibility
      if (
        transformed.aiRecommendation &&
        transformed.aiRecommendation.recommendations
      ) {
        transformed.aiRecommendation.recommendations =
          transformed.aiRecommendation.recommendations.map((rec) => ({
            ...rec,
            percentage: rec.score, // Map score to percentage for frontend
          }));
      }

      return transformed;
    });

    res.status(200).json({
      preferences: transformedPreferences,
      totalPages: preferences.totalPages,
      currentPage: preferences.page,
      totalPreferences: preferences.totalDocs,
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch preferences", error: error.message });
  }
};

// ---------- Get preference by ID ----------
exports.getPreferenceById = async (req, res) => {
  try {
    const preference = await Preference.findById(req.params.id);

    if (!preference) {
      return res.status(404).json({ message: "Preference not found" });
    }

    // Transform data to include percentage for frontend
    const transformedPreference = preference.toObject();

    if (
      transformedPreference.aiRecommendation &&
      transformedPreference.aiRecommendation.recommendations
    ) {
      transformedPreference.aiRecommendation.recommendations =
        transformedPreference.aiRecommendation.recommendations.map((rec) => ({
          ...rec,
          percentage: rec.score, // Map score to percentage for frontend
        }));
    }

    res.status(200).json(transformedPreference);
  } catch (error) {
    console.error("Error fetching preference:", error);

    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid preference ID" });
    }

    res
      .status(500)
      .json({ message: "Failed to fetch preference", error: error.message });
  }
};

// ---------- Get preferences by email ----------
exports.getPreferencesByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const preferences = await Preference.find({ email }).sort({
      createdAt: -1,
    });

    // Transform data to include percentage for frontend
    const transformedPreferences = preferences.map((pref) => {
      const transformed = pref.toObject();

      if (
        transformed.aiRecommendation &&
        transformed.aiRecommendation.recommendations
      ) {
        transformed.aiRecommendation.recommendations =
          transformed.aiRecommendation.recommendations.map((rec) => ({
            ...rec,
            percentage: rec.score, // Map score to percentage for frontend
          }));
      }

      return transformed;
    });

    res.status(200).json(transformedPreferences);
  } catch (error) {
    console.error("Error fetching preferences by email:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch preferences", error: error.message });
  }
};

// ---------- Get statistics ----------
exports.getPreferenceStats = async (req, res) => {
  try {
    const totalPreferences = await Preference.countDocuments();

    const recentPreferences = await Preference.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // Get top recommended tracks
    const trackStats = await Preference.aggregate([
      { $unwind: "$aiRecommendation.recommendations" },
      {
        $group: {
          _id: "$aiRecommendation.recommendations.track",
          count: { $sum: 1 },
          avgPercentage: { $avg: "$aiRecommendation.recommendations.score" }, // Using score as percentage
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get skill averages
    const skillAverages = await Preference.aggregate([
      {
        $group: {
          _id: null,
          avgProgramming: { $avg: "$programmingSkill" },
          avgMath: { $avg: "$mathSkill" },
          avgCyber: { $avg: "$cyberSkill" },
          avgUiux: { $avg: "$uiuxSkill" },
          avgResearch: { $avg: "$researchSkill" },
        },
      },
    ]);

    res.status(200).json({
      totalPreferences,
      recentPreferences,
      trackStats,
      skillAverages: skillAverages.length > 0 ? skillAverages[0] : {},
    });
  } catch (error) {
    console.error("Error fetching preference stats:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch statistics", error: error.message });
  }
};

// ---------- Get statistics ----------
exports.getPreferenceStats = async (req, res) => {
  try {
    const totalPreferences = await Preference.countDocuments();

    const recentPreferences = await Preference.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });

    // Get top recommended tracks
    const trackStats = await Preference.aggregate([
      { $unwind: "$aiRecommendation.recommendations" },
      {
        $group: {
          _id: "$aiRecommendation.recommendations.track",
          count: { $sum: 1 },
          avgPercentage: { $avg: "$aiRecommendation.recommendations.score" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Get skill averages
    const skillAverages = await Preference.aggregate([
      {
        $group: {
          _id: null,
          avgProgramming: { $avg: "$programmingSkill" },
          avgMath: { $avg: "$mathSkill" },
          avgCyber: { $avg: "$cyberSkill" },
          avgUiux: { $avg: "$uiuxSkill" },
          avgResearch: { $avg: "$researchSkill" },
        },
      },
    ]);

    res.status(200).json({
      totalPreferences,
      recentPreferences,
      trackStats: trackStats.length > 0 ? trackStats : [],
      skillAverages:
        skillAverages.length > 0
          ? skillAverages[0]
          : {
              avgProgramming: 0,
              avgMath: 0,
              avgCyber: 0,
              avgUiux: 0,
              avgResearch: 0,
            },
    });
  } catch (error) {
    console.error("Error fetching preference stats:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch statistics", error: error.message });
  }
};
