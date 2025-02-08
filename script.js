// Select UI elements
const prompt = document.querySelector("#prompt");
const submitbtn = document.querySelector("#submit");
const chatContainer = document.querySelector(".chat-container");
const imagebtn = document.querySelector("#image");
const image = document.querySelector("#image img");
const imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCidrEuk7VqET2EvgKNy-vJYp6D-7YyHKM";

let user = {
    message: null,
    file: {
        mime_type: null,
        data: null
    }
};

// 🟢 Mood Check-In Feature
const moodResponses = {
    happy: "That's great to hear! 😊 What made you happy today?",
    sad: "I'm here for you. Want to talk about what's on your mind? 💙",
    anxious: "Take a deep breath. Inhale... Exhale... 🌿 Want some relaxation tips?",
    stressed: "That sounds tough. Would you like some stress-relief exercises?",
    neutral: "I see. Anything you'd like to share?"
};

// 🟡 AI Response Function
async function generateResponse(aiChatBox) {
    let text = aiChatBox.querySelector(".ai-chat-area");
    text.innerHTML = `<p><em>AI is typing...</em></p>`;

    let requestBody = {
        contents: [
            {
                parts: [
                    { text: user.message },
                    user.file.data
                        ? { inline_data: { mime_type: user.file.mime_type, data: user.file.data } }
                        : null
                ].filter(Boolean)
            }
        ]
    };

    let requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
    };

    try {
        let response = await fetch(Api_Url, requestOptions);
        let data = await response.json();
        let apiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I'm here to listen. How can I help you today?";
        
        // 🛑 Crisis Detection & Empathy Response
        if (user.message.toLowerCase().includes("sad") || user.message.toLowerCase().includes("depressed")) {
            apiResponse += " Remember, you are not alone. 💙 If you need immediate help, consider reaching out to a friend or a professional.";
        }

        text.innerHTML = `<p>${apiResponse.replace(/\*\*(.*?)\*\*/g, "$1").trim()}</p>`;
    } catch (error) {
        console.log(error);
        text.innerHTML = "Oops! Something went wrong. Try again later.";
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = `img.svg`;
        image.classList.remove("choose");
        user.file = {};
    }
}

// 🟠 Create Chat Box
function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

// 🟣 Handle User Input
function handleChatResponse(userMessage) {
    if (!userMessage.trim()) return;  // Prevent empty messages

    user.message = userMessage;
    let html = `<img src="user.png" alt="" id="userImage" width="8%">
    <div class="user-chat-area">
        ${user.message}
        ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
    </div>`;
    
    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);
    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    // AI Response Delay
    setTimeout(() => {
        let aiHtml = `<img src="ai.png" alt="" id="aiImage" width="10%">
        <div class="ai-chat-area"><p><em>AI is typing...</em></p></div>`;
        let aiChatBox = createChatBox(aiHtml, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// 🟢 Handle Mood Check-In
function handleMoodCheck(mood) {
    let moodResponse = moodResponses[mood] || "Tell me more about how you're feeling.";
    handleChatResponse(moodResponse);
}

// 🔵 Event Listeners
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handleChatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handleChatResponse(prompt.value);
});

// 🟣 Image Upload Handling
imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    // Validate file type
    if (!["image/png", "image/jpeg"].includes(file.type)) {
        alert("Only PNG and JPEG images are allowed.");
        return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
        alert("File is too large. Please upload an image smaller than 2MB.");
        return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");
    };
    reader.readAsDataURL(file);
});

// 🔵 Image Button Click
imagebtn.addEventListener("click", () => {
    imagebtn.querySelector("input").click();
});

// 🔵 Mood Check-in Buttons (Optional UI Integration)
document.querySelectorAll(".mood-btn").forEach(btn => {
    btn.addEventListener("click", () => handleMoodCheck(btn.dataset.mood));
});


