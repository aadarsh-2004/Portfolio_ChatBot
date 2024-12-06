const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());

// Load knowledge base dynamically
let knowledgeBase = {};
fs.readFile("./knowledgeBase.json", "utf8", (err, data) => {
  if (err) {
    console.error("Error loading knowledge base:", err);
  } else {
    knowledgeBase = JSON.parse(data);
    
  }
});


function checkPersonalKnowledge(question) {
  for (const category in knowledgeBase) {
    const { keywords, responses } = knowledgeBase[category];

    if (keywords.some((keyword) => question.toLowerCase().includes(keyword.toLowerCase()))) {
      // If there are multiple responses, pick one randomly
      if (Array.isArray(responses)) {
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
      }
      // If only one response exists, return it directly
      return responses;
    }
  }
  return null; // Return null if no match is found
}


app.post("/ask", async (req, res) => {
  const { question } = req.body;

  // Check personal knowledge
  const answer = checkPersonalKnowledge(question);
  if (answer) {
    return res.json({ answer: answer });
  }

  // Fallback to Google Generative AI
  try {
    const genAI = new GoogleGenerativeAI("AIzaSyDKIFNS2G2NctUVZjyKUTohT67mKXhAgks");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(question);
    const text = result.response.candidates[0].content.parts[0].text;

    res.json({ answer: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Error generating the response." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
