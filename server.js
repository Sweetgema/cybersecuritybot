const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Serve static frontend files
app.use(express.static("public"));

// Dynamic import for node-fetch
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

console.log("API Key Loaded:", process.env.OPENAI_API_KEY ? "Yes" : "No");

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful cybersecurity expert. Answer clearly and concisely." },
          { role: "user", content: userMessage }
        ],
        max_tokens: 200
      })
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Response body:", JSON.stringify(data, null, 2));

    const reply = data.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ reply: "Error: Unable to connect to AI." });
  }
});

app.listen(3000, () => console.log("✅ Server running at http://localhost:3000"));
