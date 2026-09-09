const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatMessages = document.getElementById("chat-messages");

const newChatButton = document.getElementById("newChat");
const chatHistory = document.getElementById("chat-history-list");

const sidebar = document.getElementById("sidebar");
const menuButton = document.getElementById("menuButton");
const closeSidebarButton = document.getElementById("closeSidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");

let chats = JSON.parse(localStorage.getItem("senatorAI_chats")) || [];
let currentChatId = null;


// ===============================
// MOBILE SIDEBAR
// ===============================

function openSidebar() {
    if (!sidebar) return;

    sidebar.classList.add("open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.add("show");
    }
}


function closeSidebar() {
    if (!sidebar) return;

    sidebar.classList.remove("open");

    if (sidebarOverlay) {
        sidebarOverlay.classList.remove("show");
    }
}


// Open menu
if (menuButton) {
    menuButton.addEventListener("click", openSidebar);
}


// Close menu
if (closeSidebarButton) {
    closeSidebarButton.addEventListener("click", closeSidebar);
}


// Click outside sidebar
if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
}


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

    closeSidebar();

    messageInput.focus();
}


// ===============================
// SAVE CHATS
// ===============================

function saveChats() {

    localStorage.setItem(
        "senatorAI_chats",
        JSON.stringify(chats)
    );

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

    chatHistory.innerHTML = "";

    chats.forEach((chat) => {

        // Chat row
        const chatItem = document.createElement("div");

        chatItem.className = "chat-history-item";

        // Chat title
        const chatTitle = document.createElement("span");

        chatTitle.className = "chat-title";

        chatTitle.textContent = chat.title;

        // Three-dot button
        const menuButton = document.createElement("button");

        menuButton.className = "chat-menu-button";

        menuButton.textContent = "⋯";

        menuButton.title = "Chat options";

        // Delete menu
        const deleteMenu = document.createElement("div");

        deleteMenu.className = "chat-delete-menu";

        deleteMenu.textContent = "🗑️ Delete";

        // Load chat when title is clicked
        chatTitle.addEventListener("click", () => {

            loadChat(chat.id);

        });

        // Show/hide delete menu
    // Show/hide delete menu

menuButton.addEventListener("click", (event) => {

    event.stopPropagation();

    // Close other menus
    document
        .querySelectorAll(".chat-delete-menu.show")
        .forEach((menu) => {
            menu.classList.remove("show");
        });

    deleteMenu.classList.toggle("show");

    if (deleteMenu.classList.contains("show")) {

        const buttonPosition =
            menuButton.getBoundingClientRect();

        deleteMenu.style.position = "fixed";

        deleteMenu.style.top =
            (buttonPosition.top + 5) + "px";

        deleteMenu.style.left =
    (buttonPosition.left - 120) + "px";

        deleteMenu.style.zIndex = "999999";

    }

});
        // Delete chat
        deleteMenu.addEventListener("click", (event) => {

            event.stopPropagation();

            deleteChat(chat.id);

        });

        chatItem.appendChild(chatTitle);

        chatItem.appendChild(menuButton);

        chatItem.appendChild(deleteMenu);

        chatHistory.appendChild(chatItem);

    });

}
// ===============================
// DELETE CHAT
// ===============================

function deleteChat(chatId) {

    const confirmed = confirm(
        "Are you sure you want to delete this chat?"
    );

    if (!confirmed) return;

    chats = chats.filter(
        (chat) => chat.id !== chatId
    );

    saveChats();

    // If deleting the current chat
    if (currentChatId === chatId) {

        currentChatId = null;

        displayWelcome();

        messageInput.value = "";

    }

    renderChatHistory();

}


// ===============================
// LOAD OLD CHAT
// ===============================

function loadChat(chatId) {

    const chat = chats.find(
        (item) => item.id === chatId
    );

    if (!chat) return;

    currentChatId = chatId;

    chatMessages.innerHTML = "";

    chat.messages.forEach((message) => {

        const messageElement =
            document.createElement("div");

        messageElement.className =
            `message ${message.role}`;

        messageElement.textContent =
            message.content;

        chatMessages.appendChild(
            messageElement
        );

    });

    messageInput.value = "";

    closeSidebar();

    messageInput.focus();

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ===============================
// SAVE MESSAGE
// ===============================

function saveMessage(role, content) {

    if (!currentChatId) {

        currentChatId =
            Date.now().toString();

        chats.unshift({

            id: currentChatId,

            title:
                content.substring(0, 35),

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


    // First user message becomes title
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

if (
    chatForm &&
    messageInput &&
    chatMessages
) {

    chatForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const message =
                messageInput.value.trim();

            if (!message) return;


            // Remove welcome screen
            const welcome =
                document.querySelector(".welcome");

            if (welcome) {
                welcome.remove();
            }


            // Create chat automatically
            if (!currentChatId) {

                currentChatId =
                    Date.now().toString();

                chats.unshift({

                    id: currentChatId,

                    title:
                        message.substring(0, 35),

                    messages: []

                });

                saveChats();

            }


            // ===============================
            // USER MESSAGE
            // ===============================

            const userMessage =
                document.createElement("div");

            userMessage.className =
                "message user";

            userMessage.textContent =
                message;

            chatMessages.appendChild(
                userMessage
            );


            // Save user message
            saveMessage(
                "user",
                message
            );


            // Clear input
            messageInput.value = "";


            // ===============================
            // AI THINKING
            // ===============================

            const aiMessage =
                document.createElement("div");

            aiMessage.className =
                "message ai";

            aiMessage.textContent =
                "SenatorAI is thinking...";

            chatMessages.appendChild(
                aiMessage
            );


            chatMessages.scrollTop =
                chatMessages.scrollHeight;

// Disable send button
const sendButton =
    chatForm.querySelector(".send-button");

            if (sendButton) {
                sendButton.disabled = true;
            }


            // ===============================
            // SEND TO SERVER
            // ===============================

            try {

                const response =
                    await fetch(
                        "/api/chat",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                         body: JSON.stringify({
    message: message,
    history: chats.find(
        (chat) => chat.id === currentChatId
    )?.messages.slice(0, -1) || []
})
                        }
                    );


                if (!response.ok) {

                    throw new Error(
                        `Server returned ${response.status}`
                    );

                }


                const data =
                    await response.json();


                // ===============================
                // AI RESPONSE
                // ===============================
if (data.type === "image" && data.image) {

    aiMessage.innerHTML = "";

    const image = document.createElement("img");

    image.src = data.image;
    image.alt = message;
    image.className = "generated-image";

    aiMessage.appendChild(image);

    saveMessage(
        "assistant",
        "[Generated image]"
    );

} else if (data.reply) {

    aiMessage.innerHTML = data.reply
        // Escape HTML
        .replace(/&/g, "&amp;")
        .replace(/\</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Headings
        .replace(/^### (.*)$/gm, "<h3>$1</h3>")
        .replace(/^## (.*)$/gm, "<h2>$1</h2>")
        .replace(/^# (.*)$/gm, "<h1>$1</h1>")
        // Bullet points
        .replace(/^- (.*)$/gm, "<li>$1</li>")
        // Numbered lists
        .replace(/^\d+\.\s(.*)$/gm, "<li>$1</li>")
        // Paragraph spacing
        .replace(/\n\n/g, "<br><br>")
        // Single line breaks
        .replace(/\n/g, "<br>");
    // ===============================
    // SPEAK RESPONSE BUTTON
    // ===============================

    const speakButton =
        document.createElement("button");

    speakButton.className = "speak-button";
    speakButton.textContent = "🔊";
    speakButton.title = "Read response aloud";

    speakButton.addEventListener("click", () => {

        // Stop anything currently being spoken
        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(
                data.reply
            );

        speech.lang = "en-NG";
        speech.rate = 1;
        speech.pitch = 1;

        window.speechSynthesis.speak(speech);

    });

    aiMessage.appendChild(speakButton);


    // Save AI response
   saveMessage(
    "assistant",
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


            // Enable button
            if (sendButton) {
                sendButton.disabled = false;
            }


            chatMessages.scrollTop =
                chatMessages.scrollHeight;

        }
    );

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
// LOAD CHAT HISTORY
// ===============================

renderChatHistory();


// ===============================
// START SCREEN
// ===============================

displayWelcome();

// ===============================
// VOICE INPUT
// ===============================

const micButton = document.getElementById("mic-button");
const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition && micButton) {

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;

    // Nigerian English
    recognition.lang = "en-NG";

    micButton.addEventListener("click", () => {

        try {
            recognition.start();

            micButton.classList.add("recording");
            micButton.textContent = "⏹️";

        } catch (error) {
            console.log("Voice recognition already running.");
        }

    });

    recognition.onresult = (event) => {

        const transcript =
            event.results[0][0].transcript;

        messageInput.value = transcript;

        // Automatically submit the message
        document.getElementById("chat-form").requestSubmit();
    };

    recognition.onend = () => {

        micButton.classList.remove("recording");
        micButton.textContent = "🎙️";

    };

    recognition.onerror = (event) => {

        console.log("Voice recognition error:", event.error);

        micButton.classList.remove("recording");
        micButton.textContent = "🎙️";

    };

} else if (micButton) {

    micButton.disabled = true;
    micButton.title =
        "Voice input is not supported in this browser";

}