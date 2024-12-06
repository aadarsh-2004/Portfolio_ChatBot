const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { generateSpeech } = require("./pollyAudio");

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
  let audioData;

  if (answer) {
    // If the answer is found in personal knowledge, generate audio for it
    try {
      audioData = await generateSpeech(answer);
      return res.json({ answer, audio: audioData });
    } catch (audioError) {
      console.error("Error generating audio:", audioError);
      return res.status(500).json({ error: "Error generating the audio." });
    }
  }
  // If no answer is found in personal knowledge, send "Unable to understand"
  const fallbackAnswer = "Unable to understand your question.";

  // Fallback 
  try{
    audioData = await generateSpeech(fallbackAnswer);
    return res.json({ answer: fallbackAnswer, audio: audioData });
  } 
   catch (error) {
    console.error("Error generating audio for fallback response:", audioError);
    return res.status(500).json({ error: "Error generating the audio for the fallback response." });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
