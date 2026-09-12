const { Agent } = require("node:https");

const httpsAgent = new Agent({
    rejectUnauthorized: false
});
const express = require("express");
const { GigaChat } = require("gigachat");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static("."));

const client = new GigaChat({
    credentials: process.env.GIGACHAT_CREDENTIALS,
    scope: "GIGACHAT_API_PERS",
    model: "GigaChat-2-Max",
    httpsAgent: httpsAgent
}); 

app.post("/api/support", async (req, res) => {
    console.log("Получено сообщение от сайта!");

    try {
        const messages = req.body.messages;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Нет сообщений"
            });
        }

        console.log("Отправляю запрос в GigaChat...");

        const response = await client.chat({
            messages: [
                {
                    role: "system",
                    content: `
Ты — Пятница, доброжелательный виртуальный помощник.

Отвечай на русском языке.

Твои правила:
- будь доброй, спокойной и уважительной;
- не осуждай человека;
- отвечай понятно и развернуто;
- учитывай предыдущие сообщения;
- не выдавай себя за врача, психолога или другого специалиста;
- не ставь диагнозы;
- не давай опасных инструкций;
- если человеку непосредственно угрожает опасность,
  посоветуй обратиться к доверенному взрослому
  или местной экстренной службе;
- не обещай того, чего не можешь выполнить.

Твоя задача — поддерживать человека
и помогать ему спокойно разобраться в ситуации.
`
                },
                ...messages
            ]
        });

        console.log("Ответ от GigaChat получен!");

        const answer =
            response.choices[0].message.content;

        res.json({
            answer: answer
        });

    } catch (error) {
        console.error("ОШИБКА GIGACHAT:");
        console.error(error);

        res.status(500).json({
            error: "Не удалось получить ответ от Пятницы"
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Пятница запущена на порту ${PORT}`
    );
});