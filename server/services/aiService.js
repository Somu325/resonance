const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const callWithTimeout = (promise, ms = 20000) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
};

const extractSkills = async (resumeText, jdText) => {
  const prompt = `
Extract technical skills from the resume and job description below.
Return ONLY valid JSON in this exact shape, nothing else:
{"resumeSkills": ["skill1", "skill2"], "jdSkills": ["skill1", "skill2"]}

Resume:
${resumeText}

Job Description:
${jdText}
`;

  let responseText;
  let provider;

  try {
    const response = await callWithTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
      20000
    );
    responseText = response.choices[0].message.content;
    provider = "openai";
  } catch (err) {
    console.error("OpenAI extraction failed, falling back to Gemini:", err.message);
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await callWithTimeout(model.generateContent(prompt), 20000);
      responseText = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      provider = "gemini";
    } catch (geminiErr) {
      console.error("Gemini extraction failed too:", geminiErr.message);
      const apiError = new Error("AI_UNAVAILABLE");
      apiError.statusCode = 502;
      throw apiError;
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    return { ...parsed, provider };
  } catch (parseErr) {
    const error = new Error("Analysis failed, please try again");
    error.statusCode = 502;
    throw error;
  }
};

const computeMatch = (resumeSkills, jdSkills) => {
  const normalize = (skill) => skill.trim().toLowerCase();

  const resumeSet = new Set(resumeSkills.map(normalize));
  const matchedSkills = [];
  const missingSkills = [];

  jdSkills.forEach((jdSkill) => {
    if (resumeSet.has(normalize(jdSkill))) {
      matchedSkills.push(jdSkill);
    } else {
      missingSkills.push(jdSkill);
    }
  });

  const matchPercentage =
    jdSkills.length === 0
      ? 0
      : Math.round((matchedSkills.length / jdSkills.length) * 100);

  return { matchedSkills, missingSkills, matchPercentage };
};

const generateVerdict = async (
  matchedSkills,
  missingSkills,
  matchPercentage
) => {
  const prompt = `
A candidate has a ${matchPercentage}% skill match with a job description.
Matched skills: ${matchedSkills.join(", ") || "none"}
Missing skills: ${missingSkills.join(", ") || "none"}

Classify this candidate as exactly one of: "Qualified", "Almost There", "Not Yet".
Give exactly 3 short, concise reasons supporting the verdict.

Return ONLY valid JSON in this exact shape, nothing else:
{"verdict": "Almost There", "reasons": ["reason1", "reason2", "reason3"]}
`;

  let responseText;
  let provider;

  try {
    const response = await callWithTimeout(
      openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
      20000
    );
    responseText = response.choices[0].message.content;
    provider = "openai";
  } catch (err) {
    console.error("OpenAI verdict failed, falling back to Gemini:", err.message);
    try {
      const model = gemini.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await callWithTimeout(model.generateContent(prompt), 20000);
      responseText = result.response
        .text()
        .replace(/```json|```/g, "")
        .trim();
      provider = "gemini";
    } catch (geminiErr) {
      console.error("Gemini verdict failed too:", geminiErr.message);
      const apiError = new Error("AI_UNAVAILABLE");
      apiError.statusCode = 502;
      throw apiError;
    }
  }

  try {
    const parsed = JSON.parse(responseText);
    return { ...parsed, provider };
  } catch (parseErr) {
    const error = new Error("Analysis failed, please try again");
    error.statusCode = 502;
    throw error;
  }
};

module.exports = { extractSkills, computeMatch, generateVerdict };
