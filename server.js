const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

console.log(
    "Groq key loaded:",
    process.env.GROQ_API_KEY ? "YES" : "NO"
);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Please provide a message."
            });
        }

        const completion = await client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content: "You are SenatorAI, a helpful, intelligent and friendly AI assistant."
                },
                {
                    role: "user",
                    content: message
                }
            ]
        });

        res.json({
            reply: completion.choices[0].message.content
        });

    } catch (error) {
        console.error("AI ERROR:", error);

        res.status(500).json({
            error: "Unable to connect to SenatorAI."
        });
    }
});

app.listen(PORT, () => {
    console.log(`SenatorAI is running at http://localhost:${PORT}`);
});