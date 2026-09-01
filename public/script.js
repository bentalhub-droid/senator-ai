const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatMessages = document.getElementById("chat-messages");

if (!chatForm || !messageInput || !chatMessages) {
    console.error("SenatorAI: Chat elements not found.");
} else {

    chatForm.addEventListener("submit", async (event) => {

        event.preventDefault();

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

        // Clear input
        messageInput.value = "";

        // Show AI thinking message
        const aiMessage = document.createElement("div");
        aiMessage.className = "message ai";
        aiMessage.textContent = "SenatorAI is thinking...";

        chatMessages.appendChild(aiMessage);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Disable send button while waiting
        const sendButton = chatForm.querySelector("button");

        if (sendButton) {
            sendButton.disabled = true;
        }

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

            if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            }

            const data = await response.json();

            if (data.reply) {
                aiMessage.textContent = data.reply;
            } else {
                aiMessage.textContent =
                    data.error ||
                    "Sorry, SenatorAI could not generate a response.";
            }

        } catch (error) {

            console.error("CHAT ERROR:", error);

            aiMessage.textContent =
                "Sorry, I couldn't connect to SenatorAI.";
        }

        if (sendButton) {
            sendButton.disabled = false;
        }

        chatMessages.scrollTop = chatMessages.scrollHeight;

    });

}