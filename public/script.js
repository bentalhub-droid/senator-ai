const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatMessages = document.getElementById("chat-messages");

chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = messageInput.value.trim();

    if (!message) return;

    // Show user's message
    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);

    messageInput.value = "";

    // Show thinking message
    const aiMessage = document.createElement("div");
    aiMessage.className = "ai-message";
    aiMessage.textContent = "SenatorAI is thinking...";
    chatMessages.appendChild(aiMessage);

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

        if (data.reply) {
            aiMessage.textContent = data.reply;
        } else {
            aiMessage.textContent =
                data.error || "Sorry, SenatorAI could not generate a response.";
        }

    } catch (error) {
        console.error("CHAT ERROR:", error);

        aiMessage.textContent =
            "Sorry, I couldn't connect to SenatorAI.";
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
});