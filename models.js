const dotenv = require("dotenv");
const OpenAI = require("openai");

dotenv.config();

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

async function showModels() {
    try {
        const models = await client.models.list();

        models.data.forEach(model => {
            console.log(model.id);
        });

    } catch (error) {
        console.error("ERROR:", error.message);
    }
}

showModels();