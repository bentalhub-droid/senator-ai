const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("messages");

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message) return;

    // Remove welcome screen after first message
    const welcome = document.querySelector(".welcome");
    if (welcome) {
        welcome.remove();
    }

    // Show user's message
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = message;
    chatMessages.appendChild(userMessage);

    messageInput.value = "";

    // Show thinking message
    const aiMessage = document.createElement("div");
    aiMessage.className = "message ai";
    aiMessage.textContent = "SenatorAI is thinking...";
    chatMessages.appendChild(aiMessage);

    chatMessages.scrollTop = chatMessages.scrollHeight;

    sendButton.disabled = true;

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

    sendButton.disabled = false;

    chatMessages.scrollTop = chatMessages.scrollHeight;
}