const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatMessages = document.getElementById("chat-messages");
const newChatButton = document.getElementById("newChat");
const chatHistory = document.querySelector(".chat-history");

let chats = JSON.parse(localStorage.getItem("senatorAI_chats")) || [];
let currentChatId = null;


// ===============================
// CREATE A NEW CHAT
// ===============================

function createNewChat() {

    currentChatId = Date.now().toString();

    const newChat = {
        id: currentChatId,
        title: "New Chat",
        messages: []
    };

    chats.unshift(newChat);

    saveChats();

    displayWelcome();
    renderChatHistory();

    messageInput.value = "";
    messageInput.focus();
}


// ===============================
// SAVE CHATS
// ===============================

function saveChats() {
    localStorage.setItem("senatorAI_chats", JSON.stringify(chats));
}


// ===============================
// DISPLAY WELCOME SCREEN
// ===============================

function displayWelcome() {

    chatMessages.innerHTML = `
        <div class="welcome">

            <div class="welcome-icon">
                🤖
            </div>

            <h1>Hello, I'm SenatorAI</h1>

            <p>
                Your intelligent AI assistant. Ask me anything.
            </p>

        </div>
    `;
}


// ===============================
// RENDER CHAT HISTORY
// ===============================

function renderChatHistory() {

    if (!chatHistory) return;

    chatHistory.innerHTML = `
        <p>Recent Chats</p>
    `;

    chats.forEach((chat) => {

        const chatItem = document.createElement("div");

        chatItem.className = "chat-history-item";

        chatItem.textContent = chat.title;

        chatItem.dataset.id = chat.id;

        chatItem.addEventListener("click", () => {
            loadChat(chat.id);
        });

        chatHistory.appendChild(chatItem);
    });
}


// ===============================
// LOAD OLD CHAT
// ===============================

function loadChat(chatId) {

    const chat = chats.find((item) => item.id === chatId);

    if (!chat) return;

    currentChatId = chatId;

    chatMessages.innerHTML = "";

    chat.messages.forEach((message) => {

        const messageElement = document.createElement("div");

        messageElement.className =
            `message ${message.role}`;

        messageElement.textContent = message.content;

        chatMessages.appendChild(messageElement);
    });

    messageInput.value = "";

    messageInput.focus();

    chatMessages.scrollTop = chatMessages.scrollHeight;
}


// ===============================
// SAVE MESSAGE TO CURRENT CHAT
// ===============================

function saveMessage(role, content) {

    if (!currentChatId) {

        currentChatId = Date.now().toString();

        chats.unshift({
            id: currentChatId,
            title: content.substring(0, 35),
            messages: []
        });
    }

    const chat = chats.find(
        (item) => item.id === currentChatId
    );

    if (!chat) return;

    chat.messages.push({
        role: role,
        content: content
    });

    // Use first user message as chat title
    if (
        role === "user" &&
        chat.title === "New Chat"
    ) {

        chat.title =
            content.length > 35
                ? content.substring(0, 35) + "..."
                : content;
    }

    saveChats();

    renderChatHistory();
}


// ===============================
// SEND MESSAGE
// ===============================

if (chatForm && messageInput && chatMessages) {

    chatForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const message = messageInput.value.trim();

        if (!message) return;


        // Remove welcome screen
        const welcome = document.querySelector(".welcome");

        if (welcome) {
            welcome.remove();
        }


        // Create chat automatically if needed
        if (!currentChatId) {

            currentChatId = Date.now().toString();

            chats.unshift({
                id: currentChatId,
                title: message.substring(0, 35),
                messages: []
            });

            saveChats();
        }


        // Show user message
        const userMessage = document.createElement("div");

        userMessage.className = "message user";

        userMessage.textContent = message;

        chatMessages.appendChild(userMessage);


        // Save user message
        saveMessage("user", message);


        // Clear input
        messageInput.value = "";


        // Show AI thinking
        const aiMessage = document.createElement("div");

        aiMessage.className = "message ai";

        aiMessage.textContent =
            "SenatorAI is thinking...";

        chatMessages.appendChild(aiMessage);

        chatMessages.scrollTop =
            chatMessages.scrollHeight;


        // Disable button
        const sendButton =
            chatForm.querySelector("button");

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

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            const data = await response.json();


            if (data.reply) {

                aiMessage.textContent =
                    data.reply;

                // Save AI response
                saveMessage(
                    "ai",
                    data.reply
                );

            } else {

                const errorMessage =
                    data.error ||
                    "Sorry, SenatorAI could not generate a response.";

                aiMessage.textContent =
                    errorMessage;

            }

        } catch (error) {

            console.error(
                "CHAT ERROR:",
                error
            );

            aiMessage.textContent =
                "Sorry, I couldn't connect to SenatorAI.";

        }


        if (sendButton) {
            sendButton.disabled = false;
        }

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

    });

}


// ===============================
// NEW CHAT BUTTON
// ===============================

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        createNewChat
    );

}


// ===============================
// LOAD CHAT HISTORY ON STARTUP
// ===============================

renderChatHistory();


// ===============================
// START WITH A NEW CHAT
// ===============================

if (chats.length === 0) {

    displayWelcome();

} else {

    displayWelcome();

}