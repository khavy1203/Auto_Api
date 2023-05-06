const { Telegraf, Extra } = require('telegraf');
const Entities = require('html-entities').AllHtmlEntities;
const { message } = require('telegraf/filters');
const Table = require('cli-table3');
import { checkTokenTelegram, getTokenTelegram } from '../middleware/tokenAction.js';
import botTelegramService from '../service/botTelegramService.js';
require('dotenv').config();

const botTelegram = () => {

  const helpMessage = `
    Các cú pháp sử dụng bot:
    - /dat tenhocvien hoặc mãhọcviên (Kiểm tra DAT học viên)
    - /phien tenhocvien hoặc mãhọcviên (Kiểm tra Phiên học viên)
    `;

  let isFetchingData = true;

  const bot = new Telegraf(process.env.BOT_TOKEN);

  bot.use(async (ctx, next) => {
    // ctx.reply('U use bot');
    try {
      if (isFetchingData) {
        // if (ctx.chat.id != process.env.id_groupNLTB) {
        //   await ctx.replyWithHTML('Vui lòng không truy vấn dữ liệu hoặc nhắn riêng trên tin nhắn riêng của bot, vui lòng truy vấn trên group chính thức : <a href="https://t.me/+NR_DldQ80ak0MTRl">DAT_NLTB</a> . Muốn truy vấn riêng trên bot, vui lòng nhắn tin trực tiếp cho em Vy (0987980417) để được cấp quyền nhắn tin riêng trên bot 🤖🤖', { disable_web_page_preview: true })
        //   return
        // }
        if (ctx.update.message && ctx.update.message.new_chat_members) {
          for (let member of ctx.update.message.new_chat_members) {
            await ctx.reply(`Chào mừng thầy ${member.first_name} đến với nhóm! \n ${helpMessage}`)
            return
          }
        }
        const checkData = await checkTokenTelegram();
        console.log("check data in check token", checkData);
        if(+checkData?.EC != 0 || !checkData?.DT?.length) {
          const data = await getTokenTelegram();
          console.log('check data in getToken', data)
          if (+data.EC != 0 || !data?.DT?.id_token) {
            await ctx.reply('Lỗi lấy token, vui lòng thử lại sau');
            return;
          } else {
            ctx.state.tokenNLTB = data?.DT?.id_token;
          }
        }
        ctx.state.tokenNLTB = process.env.tokenNLTB;
        console.log('check ctx in middleware', ctx)
        next(ctx);
      }
    } catch (e) {
      console.log("check error", e)
      await ctx.reply('Lỗi server bot, hãy liên hệ Khả Vy để được fix sớm nhất');
      return
    }
  })

  bot.command('help', async (ctx) => {
    if (isFetchingData) {
      isFetchingData = false;
      await ctx.reply(helpMessage);
      isFetchingData = true;
      return;
    }
    return;
  })

  bot.command('dat', async (ctx) => {
    if (isFetchingData) {
      isFetchingData = false;
      console.log("DAT detected", ctx);
      let input = ctx.message.text.split(" ");
      input.shift();
      const name = input.join(" ");
      console.log("name", name);
      if (!name) {
        await ctx.reply(helpMessage);
        isFetchingData = true;
        return;
      }
      //call api get student info
      let tokenNLTB = ctx?.state?.tokenNLTB;
      const res = await botTelegramService.getInfoStudent(tokenNLTB, name);
      Promise.all([res]);
      console.log('check data', res);
      if (+res?.EC != 0) {
        await ctx.reply('Lỗi lấy token, vui lòng thử lại sau');
        return;
      }
      let i = 1;
      if (res.EC == 0 && res.DT.length > 0) {
        for (const e of res.DT) {
          const row = `<i>STT:</i><code style="color: red;"> <b style="color:red;">${i++}</b></code>\n<i>Họ và Tên:</i> <b>${e?.studentName}</b>\n<i>Mã học viên:</i> <b>${e?.studentId}</b>\n<i>Ngày sinh:</i> <b>${e?.studentDateOfBirth}</b> \n<i>Hạng đào tạo:</i> <b>${e?.driverLicenseLevelName}</b> \n<i>Mã khoá học:</i> <b>${e?.courseId}</b> \n<i>Thời gian đào tạo:</i> <b>${e?.totalTime ? e?.totalTime + " giờ" : ""}</b> \n<i>Quãng đường đào tạo:</i>  <b>${e?.totalDistance ? e?.totalDistance + " Km" : ""}</b> \n<i>Thời gian thiếu:</i>  <b>${e?.moreTime ? e?.moreTime + " giờ" : ""}</b> \n<i>Quãng đường thiếu:</i>  <b>${e?.moreDistance ? e?.moreDistance + " Km" : ""}</b> \n<i>Ghi chú:</i>  <b>${e?.note || ""}</b>`;
          const pr1 = await ctx.replyWithHTML(row);
          const pr2 = await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('check i++', i);
          await Promise.all([pr1, pr2]);
        };
        isFetchingData = true;
        return;
      } else {
        await ctx.reply("Dữ liệu trống !!!");
        isFetchingData = true;
        return;
      }
    }
    return;
  })

  bot.command('DAT', async (ctx) => {
    if (isFetchingData) {
      isFetchingData = false;
      console.log("DAT detected", ctx);
      let input = ctx.message.text.split(" ");
      input.shift();
      const name = input.join(" ");
      console.log("name", name);
      if (!name) {
        await ctx.reply(helpMessage);
        isFetchingData = true;
        return;
      }
      //call api get student info
      let tokenNLTB = ctx?.state?.tokenNLTB;
      const res = await botTelegramService.getInfoStudent(tokenNLTB, name);
      Promise.all([res]);
      console.log('check data', res);
      let i = 1;
      if (+res?.EC != 0) {
        await ctx.reply('Lỗi lấy token, vui lòng thử lại sau');
        return;
      }
      if (res.EC == 0 && res.DT.length > 0) {
        for (const e of res.DT) {
          const row = `<i>STT:</i><code style="color: red;"> <b style="color:red;">${i++}</b></code>\n<i>Họ và Tên:</i> <b>${e?.studentName}</b>\n<i>Mã học viên:</i> <b>${e?.studentId}</b>\n<i>Ngày sinh:</i> <b>${e?.studentDateOfBirth}</b> \n<i>Hạng đào tạo:</i> <b>${e?.driverLicenseLevelName}</b> \n<i>Mã khoá học:</i> <b>${e?.courseId}</b> \n<i>Thời gian đào tạo:</i> <b>${e?.totalTime ? e?.totalTime + " giờ" : ""}</b> \n<i>Quãng đường đào tạo:</i>  <b>${e?.totalDistance ? e?.totalDistance + " Km" : ""}</b> \n<i>Thời gian thiếu:</i>  <b>${e?.moreTime ? e?.moreTime + " giờ" : ""}</b> \n<i>Quãng đường thiếu:</i>  <b>${e?.moreDistance ? e?.moreDistance + " Km" : ""}</b> \n<i>Ghi chú:</i>  <b>${e?.note || ""}</b>`;
          const pr1 = await ctx.replyWithHTML(row);
          const pr2 = await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('check i++', i);
          await Promise.all([pr1, pr2]);
        };
        isFetchingData = true;
        return;
      } else {
        await ctx.reply("Dữ liệu trống !!!");
        isFetchingData = true;
        return;
      }
    }
    return;
  })

  bot.command('phien', async (ctx) => {
    if (isFetchingData) {
      isFetchingData = false;
      console.log("DAT detected", ctx);
      let input = ctx.message.text.split(" ");
      input.shift();
      const name = input.join(" ");
      console.log("name", name);
      if (!name) {
        await ctx.reply(helpMessage);
        isFetchingData = true;
        return;
      }
      //call api get student info
      let tokenNLTB = ctx?.state?.tokenNLTB;
      const res = await botTelegramService.getSessionStudent(tokenNLTB, name);
      Promise.all([res]);
      console.log('check data PHIEN', res);
      let i = 1;
      if (+res?.EC != 0) {
        await ctx.reply('Lỗi lấy token, vui lòng thử lại sau');
        return;
      }
      if (res.EC == 0 && res.DT.length > 0) {
        for (const e of res.DT) {
          const row = `<i>STT Phiên:</i><code style="color: red;"> <b style="color:red;">${i++}</b></code>\n<i>Họ và Tên:</i> <b>${e?.studentName}</b>\n<i>Mã học viên:</i> <b>${e?.studentId}</b>\n<i>Thời gian bắt đầu:</i> <b>${e?.startTime ? e?.startTime.toString().slice(0, 16) + "Z" : ""}</b>\n<i>Thời gian kết thúc:</i>  <b>${e?.endTime ? e?.endTime.toString().slice(0, 16) + "Z" : ""}</b>\n<i>Thời gian:</i>  <b>${e?.totalTime ? e?.totalTime + " giờ" : ""}</b>\n<i>Quãng đường:</i>  <b>${e?.totalDistance ? e?.totalDistance + " Km" : ""}</b>`;
          const pr1 = await ctx.replyWithHTML(row);
          const pr2 = await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('check i++', i);
          await Promise.all([pr1, pr2]);
        };
        isFetchingData = true;
        return;
      } else {
        await ctx.reply("Dữ liệu trống !!!");
        isFetchingData = true;
        return;
      }
    }
    return;
  })

  bot.command('PHIEN', async (ctx) => {
    if (isFetchingData) {
      isFetchingData = false;
      console.log("DAT detected", ctx);
      let input = ctx.message.text.split(" ");
      input.shift();
      const name = input.join(" ");
      console.log("name", name);
      if (+res?.EC != 0) {
        await ctx.reply('Lỗi lấy token, vui lòng thử lại sau');
        return;
      }
      if (!name) {
        await ctx.reply(helpMessage);
        isFetchingData = true;
        return;
      }
      //call api get student info
      let tokenNLTB = ctx?.state?.tokenNLTB;
      const res = await botTelegramService.getSessionStudent(tokenNLTB, name);
      Promise.all([res]);
      console.log('check data PHIEN', res);
      let i = 1;
      if (res.EC == 0 && res.DT.length > 0) {
        for (const e of res.DT) {
          const row = `<i>STT Phiên:</i><code style="color: red;"> <b style="color:red;">${i++}</b></code>\n<i>Họ và Tên:</i> <b>${e?.studentName}</b>\n<i>Mã học viên:</i> <b>${e?.studentId}</b>\n<i>Thời gian bắt đầu:</i> <b>${e?.startTime ? e?.startTime.toString().slice(0, 16) + "Z" : ""}</b>\n<i>Thời gian kết thúc:</i>  <b>${e?.endTime ? e?.endTime.toString().slice(0, 16) + "Z" : ""}</b>\n<i>Thời gian:</i>  <b>${e?.totalTime ? e?.totalTime + " giờ" : ""}</b>\n<i>Quãng đường:</i>  <b>${e?.totalDistance ? e?.totalDistance + " Km" : ""}</b>`;
          const pr1 = await ctx.replyWithHTML(row);
          const pr2 = await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('check i++', i);
          await Promise.all([pr1, pr2]);
        };
        isFetchingData = true;
        return;
      } else {
        await ctx.reply("Dữ liệu trống !!!");
        isFetchingData = true;
        return;
      }
    }
    return;
  })

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

