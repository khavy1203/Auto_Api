import express from 'express';
import bodyParser from "body-parser";
const fileUpload = require('express-fileupload');
import configViewEngine from "./config/viewEngine";
import apiRoutes from "./routes/api";
require('dotenv').config();
const ZaloOA = require('zalo-sdk').ZaloOA;

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(fileUpload());

configViewEngine(app);
apiRoutes(app);

const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const bot = new Telegraf(process.env.BOT_TOKEN);


bot.use((ctx,next) => {
  // ctx.reply('U use bot');
  next(ctx);
})

const helpMessage = `
Các cú pháp sử dụng bot:
/DAT tenhocvien (Kiểm tra DAT học viên)
`
bot.start((ctx) =>{ 
  ctx.reply('Chào mừng bạn đến với bot chat, hãy gõ /help để xem các lệnh')
  console.log("from",ctx.from);
  console.log("chat", ctx.chat);
  console.log("message", ctx.message);
});

bot.help((ctx) => ctx.reply(helpMessage));
// bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
bot.settings((ctx) => ctx.reply('You have entered the settings menu'));
bot.command('secret', Telegraf.reply('Secret detected'))
bot.command('DAT', (ctx)=>{
  console.log("DAT detected", ctx);

  bot.telegram.sendMessage(ctx.chat.id, 'Hello wwwww', {
    parse_mode: 'Markdown',
    disable_notification: true,
  });

})
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.on("text", (ctx) => {
    console.log("text", ctx.message);
    
  })
  bot.on("sticker", (ctx) => {
      console.log("text", ctx.message);
      ctx.reply('this is sticker');
})

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('jwt nodejs and react ' + PORT);
});