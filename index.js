require("dotenv").config();
const { Telegraf, Markup, session } = require("telegraf");
const express = require('express');
const axios = require("axios");

const app = express();
const bodyParser = require("body-parser");
const port = process.env.PORT || 4040;
const { BOT_TOKEN, SERVER_URL } = process.env;

const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = `${SERVER_URL}${URI}`;

app.use(express.json());
app.use(bodyParser.json());

// Initialize the webhook
const init = async () => {
    try {
        const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
        console.log("Webhook set successfully:", res.data);
    } catch (error) {
        console.error("Error setting webhook:", error.response ? error.response.data : error.message);
    }
};

app.listen(port, async () => {
    console.log(`App is running on port ${port}`);
    await init();
});

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);
const web_link = "https://vanillaswap.netlify.app/";
const picture_url = "https://example.com/sample-image.jpg"; // Replace with a real image URL

// Start command handling
bot.start((ctx) => {
    const startPayload = ctx.startPayload;
    const urlSent = `${web_link}?ref=${startPayload}`;
    const user = ctx.message.from;
    const userName = user.username ? `@${user.username}` : user.first_name;

    // Send a photo along with the message
    ctx.replyWithPhoto(picture_url, {
        caption: `*Hey, ${userName}! Welcome to Demo Tap App!*`,
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [
                [{ text: "⚡️Play now!⚡️", web_app: { url: urlSent } }],
                [{ text: "🧩 Join Our Telegram Channel 🧩", url: "https://t.me/demotest" }]
            ]
        }
    });
});

// New /info command to send a picture with details
bot.command('info', (ctx) => {
    ctx.replyWithPhoto(picture_url, {
        caption: `Here's some important information for you!`,
        reply_markup: {
            inline_keyboard: [
                [{ text: "Learn More", url: "https://example.com/learn-more" }]
            ]
        }
    });
});

// Default fallback for unknown commands
bot.on('message', (ctx) => {
    ctx.reply("I didn't understand that command. Try /start or /info!");
});

// Handle incoming webhook updates
app.post(URI, (req, res) => {
    bot.handleUpdate(req.body);
    res.status(200).send('Received Telegram webhook');
});

// Basic route to check if the app is running
app.get("/", (req, res) => {
    res.send("Hello! The bot is running.");
});

app.get('/webhook', (req, res) => {
    res.send('Webhook is active!');
});
