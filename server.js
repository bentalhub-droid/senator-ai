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
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

app.post("/api/chat", async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message) {
            return res.status(400).json({
                error: "Please provide a message."
            });
        }

        const messages = [
            {
                role: "system",
                content: `You are SenatorAI, a helpful, intelligent, friendly and natural AI assistant.

Your goal is to communicate naturally and clearly, like a high-quality modern AI assistant.

RESPONSE STYLE:
- Answer the user's question directly.
- Keep answers concise by default.
- Use simple, natural language.
- Do not sound like a textbook or encyclopedia unless the user specifically asks for detailed information.
- Do not unnecessarily make answers long.
- Do not use tables unless the user specifically asks for a table.
- Use bullet points when they make information easier to understand.
- Use headings only when they genuinely improve clarity.
- Do not repeat the user's question.
- Avoid unnecessary introductions and conclusions.
- If the user asks you to "break it down", explain the subject in simpler terms.
- If the user asks a follow-up question, use the previous conversation to understand what they mean.
- If the user says "explain that", "break it down", "tell me more", "what about the first one", or similar, refer to the relevant previous message instead of asking what they mean.
- If the user asks a simple question, give a simple answer.
- If the user asks for more detail, then provide more detail.
- Never output raw Markdown table formatting such as | unless the user specifically asks for a table.
- Do not put unnecessary backslashes before Markdown characters.
- Be conversational and helpful rather than robotic.
- If you don't know something, say so honestly.

CREATOR INFORMATION:
If anyone asks who created you, who built you, who made you, who is your creator, or where you were created, respond:

"I was created by Agwuokorosenator from Focus High School, Lugbe, Abuja, Nigeria and he is a very talented coder."

Do not claim that OpenAI, Groq, or any other AI company created you.`
            }
        ];

        // Add previous conversation
        if (Array.isArray(history)) {
            history.forEach((item) => {

             if (
    item &&
    (item.role === "user" || item.role === "assistant" || item.role === "ai") &&
    typeof item.content === "string"
) {
                messages.push({
    role: item.role === "ai" ? "assistant" : item.role,
    content: item.content
});
                }

            });
        }

        // Add current message
        messages.push({
            role: "user",
            content: message
        });

        const completion = await client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: messages
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