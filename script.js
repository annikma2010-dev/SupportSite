let conversation = [];

let lastAnswer = "";

const chat =
    document.getElementById("chat");

const userText =
    document.getElementById("userText");

const typing =
    document.getElementById("typing");

function addMessage(
    text,
    sender
) {

    const message =
        document.createElement("div");

    message.className =
        `message ${sender}`;

    const name =
        document.createElement("div");

    name.className =
        "message-name";

    name.textContent =
        sender === "user"
            ? "Ты"
            : "Пятница";

    const bubble =
        document.createElement("div");

    bubble.className =
        "bubble";

    bubble.textContent = text;

    message.appendChild(name);

    message.appendChild(bubble);

    chat.appendChild(message);

    chat.scrollTop =
        chat.scrollHeight;
}

async function sendMessage() {

    const text =
        userText.value.trim();

    if (text === "") {
        return;
    }

    addMessage(
        text,
        "user"
    );

    conversation.push({
        role: "user",
        content: text
    });

    userText.value = "";

    typing.style.display =
        "block";

    try {

        const response =
            await fetch(
                "/api/support",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        messages:
                            conversation
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok) {

            throw new Error(
                data.error ||
                "Ошибка сервера"
            );
        }

        lastAnswer =
            data.answer;

        addMessage(
            data.answer,
            "friday"
        );

        conversation.push({
            role: "assistant",
            content: data.answer
        });

    } catch (error) {

        console.error(error);

        addMessage(
            "Извини, сейчас я не смогла ответить. Проверь, запущен ли сервер.",
            "friday"
        );

    } finally {

        typing.style.display =
            "none";
    }
}

/* ENTER */

userText.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            sendMessage();
        }
    }
);

/* READ ANSWER */

function readLastAnswer() {

    if (!lastAnswer) {
        return;
    }

    if (
        "speechSynthesis"
        in window
    ) {

        const speech =
            new SpeechSynthesisUtterance(
                lastAnswer
            );

        speech.lang = "ru-RU";

        speech.rate = 0.95;

        speech.pitch = 1;

        speechSynthesis.cancel();

        speechSynthesis.speak(
            speech
        );
    }
}

/* VOICE INPUT */

function startVoice() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        alert(
            "Голосовой ввод не поддерживается этим браузером."
        );

        return;
    }

    const recognition =
        new SpeechRecognition();

    recognition.lang =
        "ru-RU";

    recognition.interimResults =
        false;

    recognition.start();

    recognition.onresult =
        function(event) {

            const text =
                event.results[0][0].transcript;

            userText.value =
                text;

            userText.focus();
        };

    recognition.onerror =
        function() {

            console.log(
                "Голосовой ввод завершён."
            );
        };
}

/* CLEAR */

function clearChat() {

    conversation = [];

    lastAnswer = "";

    chat.innerHTML = `
        <div class="message friday">

            <div class="message-name">
                Пятница
                </div>

            <div class="bubble">
                Чат очищен ❤️<

                Можешь начать новый разговор.
            </div>

        </div>
    `;
}