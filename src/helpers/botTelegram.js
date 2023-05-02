const { Telegraf, Extra } = require('telegraf');
const Entities = require('html-entities').AllHtmlEntities;
const { message } = require('telegraf/filters');
const Table = require('cli-table3');
import { checkToken, getToken } from '../middleware/tokenAction.js';
import botTelegramService from '../service/botTelegramService.js';
require('dotenv').config();

const botTelegram = () => {

  const helpMessage = `
    Các cú pháp sử dụng bot:
    /DAT tenhocvien or CMND or CCCD(Kiểm tra DAT học viên)
    `;

  const bot = new Telegraf(process.env.BOT_TOKEN);
  bot.use(async (ctx, next) => {
    // ctx.reply('U use bot');
    try {
      const res1 = await checkToken();
      console.log("check res 1", res1);
      if (res1?.DT?.status == 401) {
        const data = await getToken();
        // get token from api next call api
        console.log('check data in getToken', data)
        ctx.state.tokenNLTB = data?.DT?.id_token;
      }
    } catch (e) {
      console.log("check error", e)
      return res.status(500).json({
        EM: "error from sever", //error message
        EC: "-1", //error code
        DT: "",
      });
    }
    console.log('check ctx in middleware', ctx)
    next(ctx);
  })

  let isFetchingData = true;

  bot.command('DAT', async (ctx) => {
    if (isFetchingData) {
      isFetchingData = false;
      console.log("DAT detected", ctx);
      let input = ctx.message.text.split(" ");
      input.shift();
      const name = input.join(" ");
      console.log("name", name);
      //call api get student info
      let tokenNLTB = ctx?.state?.tokenNLTB;
      const res = await botTelegramService.getInfoStudent(tokenNLTB, name);
      Promise.all([res]);
      console.log('check data', res);
      let i = 0;
      if (res.EC == 0 && res.DT.length > 0) {
        for (const e of res.DT) {
          const row = `
          <pre>
            <i>Họ và Tên:</i>${e?.studentName}
            <i>Mã học viên:</i>${e?.studentId}
            <i>Ngày sinh:</i>${e?.studentDateOfBirth}
            <i>Hạng đào tạo:</i>${e?.driverLicenseLevelName}
            <i>Mã khoá học:</i>${e?.courseId}
            <i>Thời gian đào tạo:</i>${e?.totalTime}
            <i>Quãng đường đào tạo:</i>${e?.totalDistance}
            <i>Thời gian thiếu:</i>${e?.moreTime}
            <i>Quãng đường thiếu:</i>${e?.moreDistance}
            <i>Ghi chú:</i>${e?.qualifiedNote}
            <i>Yêu cầu:</i>${e?.moreTime}
          </pre>
        `;
          const pr1 = await ctx.replyWithHTML(row);
          const pr2 = await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('check i++', i++);
          await Promise.all([pr1, pr2]);
        };
        isFetchingData = true;

      }
    }

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
}
export default botTelegram;

