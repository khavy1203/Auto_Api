const { Telegraf, Extra } = require('telegraf');
import { checkTokenTelegram, getTokenTelegram, checkTokenInLocalNLTB, getTokenInLocalNLTB } from '../middleware/tokenAction.js';
const moment = require('moment');
const path = require('path');

import botTelegramService from '../service/botTelegramService.js';
const fs = require('fs');

require('dotenv').config();

const botTelegram = () => {

  const helpMessage = `
    Các cú pháp sử dụng bot ( CÁC CÚ PHÁP VUI LÒNG KHÔNG DẤU ) : 
      /dat tenhocvien hoặc mãhọcviên (Kiểm tra DAT học viên)
      /phien tenhocvien hoặc mãhọcviên (Kiểm tra Phiên học viên)
      /matphien mãhọcviên ( Nhằm kiếm tra bị "MẤT PHIÊN" - đối chiếu dữ liệu phiên giữa máy DAT và trên Tổng Cục, để xử lý cho các thầy có thể tìm kiếm được phiên bị mất, hoặc phiên load quá lâu trên 12h)
      /indat biểnsốxe (Làm giấy phép tập lái. Ví dụ : /indat 77A12345 mặt định là 1 tháng, muốn lấy dữ liệu trong 2,3 thì cách ra và thêm số 2 hoặc 3 tháng . Ví dụ : /indat 77A12345 2 )
      /timkhoa tênkhoá (Kiểm tra tên khoá học để đẩy xuống xe cho chính xác. Ví dụ: /timkhoa 127 )
      /daykhoa tênkhoá biểnsốxe (Đẩy khoá học xuống xe. Ví dụ đẩy khoá 127 xuống xe 77A12345: /daykhoa 127 77A12345 )
    `;


  let isFetchingData = true;

  const bot = new Telegraf(process.env.BOT_TOKEN);
  const arrLocalCheck = [
    '/matphien',
    '/indat',
    '/daykhoa',
    '/timkhoa'
  ]
  async function sleep() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }

  try {
    function isNumberString(str) {
      // Sử dụng biểu thức chính quy để kiểm tra chuỗi
      // ^\d+$: Bắt đầu (^) và kết thúc ($) với một hoặc nhiều số (\d+)
      return /^\d+$/.test(str) || !str;
    }

    bot.use(async (ctx, next) => {
      // ctx.reply('U use bot');
      try {
        console.log("bot đã hoạt động")
        console.log("check ctx chat id", ctx.chat.id)
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

          let input = ctx.message.text.split(" ");
          const commandCheck = input.shift();

          if (arrLocalCheck.includes(commandCheck.toLowerCase())) {

            const mhv = input[0]?.trim();
            console.log("mhv", mhv);
            if (!mhv) {
              await ctx.reply(helpMessage);
              isFetchingData = true;
              return;
            }

            const res = await checkTokenInLocalNLTB();
            console.log('check res', res)
            if (res.EC == 0) {
              ctx.state.tokenLocalNLTB = process.env.tokenLocalNLTB;
            } else {
              const getTokenLocalNLTB = await getTokenInLocalNLTB()
              if (getTokenLocalNLTB.EC == 0) {
                ctx.state.tokenLocalNLTB = getTokenLocalNLTB.DT;

              } else {
                await ctx.reply('Lỗi lấy token ở localNLTB, vui lòng thử lại sau');
                isFetchingData = true;
                return;
              }
            }
            await next(ctx);
          } else {
            const checkData = await checkTokenTelegram();
            if (+checkData?.EC != 0 || !checkData?.DT?.length) {
              const data = await getTokenTelegram();
              console.log('check data in getToken', data)
              if (+data.EC != 0 || !data?.DT?.id_token) {
                await ctx.reply('Lỗi lấy token, vui lòng thử lại sau');
                isFetchingData = true;
                return;
              } else {
                ctx.state.tokenNLTB = data?.DT?.id_token;
              }
            }
            ctx.state.tokenNLTB = process.env.tokenNLTB;
            await next(ctx);
          }

        }
      } catch (e) {
        console.log("check error", e)
        await ctx.reply('Lỗi server bot, hãy liên hệ Khả Vy để được fix sớm nhất');
        isFetchingData = true;
        return;
      }
    })

    bot.command('help', async (ctx) => {
      if (isFetchingData) {
        isFetchingData = false;
        await ctx.reply(helpMessage);
        isFetchingData = true;
        return;
      }
      isFetchingData = true;
      return;
    })

    bot.command('dat', async (ctx) => {
      try {
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
            isFetchingData = true;
            return;
          }
          let i = 1;
          if (res.EC == 0 && res.DT?.length > 0) {
            for (const e of res.DT) {
              const row = `<i>STT:</i><code style="color: red;"> <b style="color:red;">${i++}</b></code>\n<i>Họ và Tên:</i> <b>${e?.studentName}</b>\n<i>Mã học viên:</i> <b>${e?.studentId}</b>\n<i>Ngày sinh:</i> <b>${e?.studentDateOfBirth}</b> \n<i>Hạng đào tạo:</i> <b>${e?.driverLicenseLevelName}</b> \n<i>Mã khoá học:</i> <b>${e?.courseId}</b> \n<i>Thời gian đào tạo:</i> <b>${e?.totalTime ? e?.totalTime + " giờ" : ""}</b> \n<i>Quãng đường đào tạo:</i>  <b>${e?.totalDistance ? e?.totalDistance + " Km" : ""}</b> \n<i>Thời gian thiếu:</i>  <b>${e?.moreTime ? e?.moreTime + " giờ" : ""}</b> \n<i>Quãng đường thiếu:</i>  <b>${e?.moreDistance ? e?.moreDistance + " Km" : ""}</b> \n<i>Ghi chú:</i>  <b>${e?.note || ""}</b>`;
              const pr1 = await ctx.replyWithHTML(row);
              const pr2 = await sleep();
              console.log('check i++', i);
              await Promise.all([pr1, pr2]);
              console.log('check i++', i);
            };
            isFetchingData = true;
            return;
          } else {
            await ctx.reply("Dữ liệu trống !!!");
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (e) {
        await ctx.reply("Vui lòng thử lại sau !!!");
        isFetchingData = true;
        return;
      }

    })

    bot.command('DAT', async (ctx) => {
      try {
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
            isFetchingData = true;
            return;
          }
          let i = 1;
          if (res.EC == 0 && res.DT?.length > 0) {
            for (const e of res.DT) {
              const row = `<i>STT:</i><code style="color: red;"> <b style="color:red;">${i++}</b></code>\n<i>Họ và Tên:</i> <b>${e?.studentName}</b>\n<i>Mã học viên:</i> <b>${e?.studentId}</b>\n<i>Ngày sinh:</i> <b>${e?.studentDateOfBirth}</b> \n<i>Hạng đào tạo:</i> <b>${e?.driverLicenseLevelName}</b> \n<i>Mã khoá học:</i> <b>${e?.courseId}</b> \n<i>Thời gian đào tạo:</i> <b>${e?.totalTime ? e?.totalTime + " giờ" : ""}</b> \n<i>Quãng đường đào tạo:</i>  <b>${e?.totalDistance ? e?.totalDistance + " Km" : ""}</b> \n<i>Thời gian thiếu:</i>  <b>${e?.moreTime ? e?.moreTime + " giờ" : ""}</b> \n<i>Quãng đường thiếu:</i>  <b>${e?.moreDistance ? e?.moreDistance + " Km" : ""}</b> \n<i>Ghi chú:</i>  <b>${e?.note || ""}</b>`;
              const pr1 = await ctx.replyWithHTML(row);
              const pr2 = await sleep();
              console.log('check i++', i);
              await Promise.all([pr1, pr2]);
              console.log('check i++', i);
            };
            isFetchingData = true;
            return;
          } else {
            await ctx.reply("Dữ liệu trống !!!");
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (e) {
        await ctx.reply("Vui lòng thử lại sau !!!");
        isFetchingData = true;
        return;
      }

    })


    bot.command('phien', async (ctx) => {
      try {
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
            isFetchingData = true;
            return;
          }
          if (res.EC == 0 && res.DT.length > 0) {
            for (const e of res.DT) {
              const startTime = e?.startTime ? moment(e?.startTime).utcOffset('+0700').format('DD/MM/YYYY HH:mm:ss') : "";
              const endTime = e?.endTime ? moment(e?.endTime).utcOffset('+0700').format('DD/MM/YYYY HH:mm:ss') : "";

              const row = `<i>STT Phiên:</i><code style="color: red;"> <b style="color:red;">${i++}</b></code>\n<i>Họ và Tên:</i> <b>${e?.studentName}</b>\n<i>Mã học viên:</i> <b>${e?.studentId}</b>\n<i>Thời gian bắt đầu:</i> <b>${startTime}</b>\n<i>Thời gian kết thúc:</i>  <b>${endTime}</b>\n<i>Thời gian:</i>  <b>${e?.totalTime ? e?.totalTime + " giờ" : ""}</b>\n<i>Quãng đường:</i>  <b>${e?.totalDistance ? e?.totalDistance + " Km" : ""}</b>`;

              const pr1 = await ctx.replyWithHTML(row);
              const pr2 = await sleep();
              console.log('check i++', i)
              await Promise.all([pr1, pr2]);
            };
            isFetchingData = true;z
            return;
          } else {
            await ctx.reply("Dữ liệu trống !!!");
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (e) {
        await ctx.reply("Vui lòng thử lại sau !!!");
        isFetchingData = true;
        return;
      }

    })

    bot.command('PHIEN', async (ctx) => {
      try {
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
            isFetchingData = true;
            return;
          }
          if (res.EC == 0 && res.DT.length > 0) {
            for (const e of res.DT) {
              const row = `<i>STT Phiên:</i><code style="color: red;"> <b style="color:red;">${i++}</b></code>\n<i>Họ và Tên:</i> <b>${e?.studentName}</b>\n<i>Mã học viên:</i> <b>${e?.studentId}</b>\n<i>Thời gian bắt đầu:</i> <b>${e?.startTime ? e?.startTime.toString().slice(0, 16) + "Z" : ""}</b>\n<i>Thời gian kết thúc:</i>  <b>${e?.endTime ? e?.endTime.toString().slice(0, 16) + "Z" : ""}</b>\n<i>Thời gian:</i>  <b>${e?.totalTime ? e?.totalTime + " giờ" : ""}</b>\n<i>Quãng đường:</i>  <b>${e?.totalDistance ? e?.totalDistance + " Km" : ""}</b>`;
              const pr1 = await ctx.replyWithHTML(row);
              const pr2 = await sleep();
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
        isFetchingData = true;
        return;
      } catch (e) {
        await ctx.reply("Vui lòng thử lại sau !!!");
        isFetchingData = true;
        return;
      }
    })


    bot.command('matphien', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          console.log("DAT detected", ctx);
          let input = ctx.message.text.split(" ");
          input.shift();
          console.log('check input', input)
          const mhv = input[0]?.trim();
          console.log("mhv", mhv);
          if (!mhv) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }
          const regex = /^(?:\d{4}-\d{8}-\d{6}|\d{6})$/;
          if (!regex.test(mhv)) {
            await ctx.reply('Sai định dạng mã học viên, vui lòng nhập lại. Vui lòng lấy 6 số cuối của mã học viên');
            isFetchingData = true;
            return;
          }
          // call api get student info
          let tokenLocalNLTB = ctx?.state?.tokenLocalNLTB;

          const res = await botTelegramService.checkSession(tokenLocalNLTB, mhv);
          let i = 1;
          if (res?.EC == 0) {
            for (const e of res.DT) {
              let pr1 = {};
              const row = `<i>STT Phiên:</i><code style="color: red;"> <b style="color:red;">${i}</b></code>\n<i>Họ và Tên:</i> <b>${e?.HoTen}</b>\n<i>Mã học viên:</i> <b>${e?.MaDK}</b>\n<i>Khoá học:</i> <b>${e?.KhoaHoc}</b>\n<i>Đăng nhập:</i> <b>${e?.DangNhap}</b>\n<i>Đăng xuất:</i> <b>${e?.DangXuat}</b>\n<i>Tổng thời gian:</i> <b>${e?.TongTG}</b>\n<i>Tổng quãng đường:</i> <b>${e?.TongQD}</b>\n`;
              if (i == 1) {
                if (res.DT.length == 1) {
                  pr1 = await ctx.replyWithHTML(res?.EM + "\n" + row + '\n<i><b>Hãy liên hệ em Vy. Hy vọng em Vy sẽ cíu được phiên của các thầy 🏩🏩🏩</b></i>');
                } else {
                  pr1 = await ctx.replyWithHTML(res?.EM + "\n" + row);
                }

              } else if (i == res.DT.length) {
                pr1 = await ctx.replyWithHTML(row + '\n<i><b>Đã tiến hành giải cíu, hãy kiểm tra lại. Nếu phiên không lên được tổng cục thì em hết cách. 🏩🏩🏩</b></i>');
              }
              else {
                pr1 = await ctx.replyWithHTML(row);
              }
              const pr2 = await sleep();
              console.log('check i++', i);
              i++;
              await Promise.all([pr1, pr2]);
            };
            isFetchingData = true;
            return;
          } else {
            await ctx.replyWithHTML(res.EM);
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (error) {
        await ctx.replyWithHTML("Vui lòng thử lại sau");
        isFetchingData = true;
        return;
      }

    })

    bot.command('MATPHIEN', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          console.log("DAT detected", ctx);
          let input = ctx.message.text.split(" ");
          input.shift();
          console.log('check input', input)
          const mhv = input[0]?.trim();
          console.log("mhv", mhv);
          if (!mhv) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }
          const regex = /^(?:\d{4}-\d{8}-\d{6}|\d{6})$/;
          if (!regex.test(mhv)) {
            await ctx.reply('Sai định dạng mã học viên, vui lòng nhập lại. Vui lòng lấy 6 số cuối của mã học viên');
            isFetchingData = true;
            return;
          }
          // call api get student info
          let tokenLocalNLTB = ctx?.state?.tokenLocalNLTB;

          const res = await botTelegramService.checkSession(tokenLocalNLTB, mhv);
          let i = 1;
          if (res?.EC == 0) {
            for (const e of res.DT) {
              let pr1 = {};
              const row = `<i>STT Phiên:</i><code style="color: red;"> <b style="color:red;">${i}</b></code>\n<i>Họ và Tên:</i> <b>${e?.HoTen}</b>\n<i>Mã học viên:</i> <b>${e?.MaDK}</b>\n<i>Khoá học:</i> <b>${e?.KhoaHoc}</b>\n<i>Đăng nhập:</i> <b>${e?.DangNhap}</b>\n<i>Đăng xuất:</i> <b>${e?.DangXuat}</b>\n<i>Tổng thời gian:</i> <b>${e?.TongTG}</b>\n<i>Tổng quãng đường:</i> <b>${e?.TongQD}</b>\n`;
              if (i == 1) {
                if (res.DT.length == 1) {
                  pr1 = await ctx.replyWithHTML(res?.EM + "\n" + row + '\n<i><b>Hãy liên hệ em Vy. Hy vọng em Vy sẽ cíu được phiên của các thầy 🏩🏩🏩</b></i>');
                } else {
                  pr1 = await ctx.replyWithHTML(res?.EM + "\n" + row);
                }

              } else if (i == res.DT.length) {
                pr1 = await ctx.replyWithHTML(row + '\n<i><b>Đã tiến hành giải cíu, hãy kiểm tra lại. Nếu phiên không lên được tổng cục thì em hết cách. 🏩🏩🏩</b></i>');
              }
              else {
                pr1 = await ctx.replyWithHTML(row);
              }
              const pr2 = await sleep();
              console.log('check i++', i);
              i++;
              await Promise.all([pr1, pr2]);
            };
            isFetchingData = true;
            return;
          } else {
            await ctx.replyWithHTML(res.EM);
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (error) {
        await ctx.replyWithHTML("Vui lòng thử lại sau");
        isFetchingData = true;
        return;
      }

    })


    bot.command('indat', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          console.log("DAT detected", ctx);
          let input = ctx.message.text.split(" ");
          input.shift();
          console.log('check input', input)
          const biensoxe = input[0]?.trim();
          const soThang = input[1]?.trim();
          console.log("biensoxe", biensoxe);
          console.log("soThang", soThang);

          if (!biensoxe || !isNumberString(soThang)) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }
          // call api get student info
          let tokenLocalNLTB = ctx?.state?.tokenLocalNLTB;

          const res = await botTelegramService.inDat(tokenLocalNLTB, biensoxe.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(), soThang?.trim());
          Promise.all([res]);
          console.log('check res', res);
          if (res?.EC == 0) {
            const pdfFilePath = res.DT;
            const pdfBuffer = fs.readFileSync(pdfFilePath);;
            if (fs.existsSync(pdfFilePath)) {
              console.log("file tồn tại")
              await ctx.replyWithDocument({ source: pdfBuffer, filename: 'inDat.pdf' }, { chat_id: ctx.chat.id }); // Gửi nội dung PDF lên group
              fs.unlink(pdfFilePath, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log('File deleted successfully');
              });

              isFetchingData = true;
              return;
            } else {
              console.log("file KHông tồn tại")
              ctx.reply("File không tồn tại");
              isFetchingData = true;
              return;
            }
          } else {
            await ctx.replyWithHTML(res?.EM);
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (error) {
        console.log("check error", error)
        await ctx.replyWithHTML("Vui lòng thử lại sau");
        isFetchingData = true;
        return;
      }

    })

    bot.command('INDAT', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          console.log("DAT detected", ctx);
          let input = ctx.message.text.split(" ");
          input.shift();
          console.log('check input', input)
          const biensoxe = input[0]?.trim();
          const soThang = input[1]?.trim();
          console.log("biensoxe", biensoxe);
          console.log("soThang", soThang);

          if (!biensoxe || !isNumberString(soThang)) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }
          // call api get student info
          let tokenLocalNLTB = ctx?.state?.tokenLocalNLTB;

          const res = await botTelegramService.inDat(tokenLocalNLTB, biensoxe.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(), soThang?.trim());
          Promise.all([res]);
          console.log('check res', res);
          if (res?.EC == 0) {
            const pdfFilePath = res.DT;
            const pdfBuffer = fs.readFileSync(pdfFilePath);;
            if (fs.existsSync(pdfFilePath)) {
              console.log("file tồn tại")
              await ctx.replyWithDocument({ source: pdfBuffer, filename: 'inDat.pdf' }, { chat_id: ctx.chat.id }); // Gửi nội dung PDF lên group
              fs.unlink(pdfFilePath, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log('File deleted successfully');
              });

              isFetchingData = true;
              return;
            } else {
              console.log("file KHông tồn tại")
              ctx.reply("File không tồn tại");
              isFetchingData = true;
              return;
            }
          } else {
            await ctx.replyWithHTML(res?.EM);
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (error) {
        console.log("check error", error)
        await ctx.replyWithHTML("Vui lòng thử lại sau");
        isFetchingData = true;
        return;
      }

    })

    bot.command('daykhoa', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          // if (ctx.chat.id != process.env.id_admin) {
          //   await ctx.reply("Chỉ có admin mới được phép dùng tính năng này, vui lòng nhắn tin riêng cho admin để xác nhận");
          //   isFetchingData = true;
          //   return;
          // }
          console.log("DAT detected", ctx);
          let input = ctx.message.text.split(" ");
          input.shift();
          console.log('check input', input)
          const khoa = input[0]?.trim();
          const biensoxe = input[1]?.trim();
          console.log("khoa", khoa);
          console.log("biensoxe", biensoxe);

          if (!khoa || !biensoxe) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }
          // call api get student info
          let tokenLocalNLTB = ctx?.state?.tokenLocalNLTB;
          const res = await botTelegramService.pushSource(tokenLocalNLTB, khoa, biensoxe.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
          Promise.all([res]);
          console.log('check res', res);
          if (res?.EC == 0) {
            ctx.replyWithHTML(res.EM);
            isFetchingData = true;
            return;
          } else {
            await ctx.replyWithHTML(res?.EM);
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (error) {
        console.log("check error", error)
        await ctx.replyWithHTML("Vui lòng thử lại sau");
        isFetchingData = true;
        return;
      }

    })

    bot.command('DAYKHOA', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          console.log("DAT detected", ctx);
          let input = ctx.message.text.split(" ");
          input.shift();
          console.log('check input', input)
          const khoa = input[0]?.trim();
          const biensoxe = input[1]?.trim();
          console.log("khoa", khoa);
          console.log("biensoxe", biensoxe);

          if (!khoa || !biensoxe) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }
          // call api get student info
          let tokenLocalNLTB = ctx?.state?.tokenLocalNLTB;
          const res = await botTelegramService.pushSource(tokenLocalNLTB, khoa, biensoxe.replace(/[^a-zA-Z0-9]/g, '').toUpperCase());
          Promise.all([res]);
          console.log('check res', res);
          if (res?.EC == 0) {
            ctx.replyWithHTML(res.EM);
            isFetchingData = true;
            return;
          } else {
            await ctx.replyWithHTML(res?.EM);
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (error) {
        console.log("check error", error)
        await ctx.replyWithHTML("Vui lòng thử lại sau");
        isFetchingData = true;
        return;
      }
    })

    bot.command('timkhoa', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          console.log("DAT detected", ctx);
          let input = ctx.message.text.split(" ");
          input.shift();
          console.log('check input', input)
          const khoa = input[0]?.trim();
          console.log("khoa", khoa);
          if (!khoa) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }
          // call api get student info
          let tokenLocalNLTB = ctx?.state?.tokenLocalNLTB;
          const res = await botTelegramService.searchSource(tokenLocalNLTB, khoa);
          Promise.all([res]);
          console.log('check res', res);
          if (res?.EC == 0) {

            ctx.replyWithHTML(res.EM);
            isFetchingData = true;
            return;
          } else {
            await ctx.replyWithHTML(res?.EM);
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (error) {
        console.log("check error", error)
        await ctx.replyWithHTML("Vui lòng thử lại sau");
        isFetchingData = true;
        return;
      }

    })

    bot.command('TIMKHOA', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          console.log("DAT detected", ctx);
          let input = ctx.message.text.split(" ");
          input.shift();
          console.log('check input', input)
          const khoa = input[0]?.trim();
          console.log("khoa", khoa);
          if (!khoa) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }
          // call api get student info
          let tokenLocalNLTB = ctx?.state?.tokenLocalNLTB;
          const res = await botTelegramService.searchSource(tokenLocalNLTB, khoa);
          Promise.all([res]);
          console.log('check res', res);
          if (res?.EC == 0) {

            ctx.replyWithHTML(res.EM);
            isFetchingData = true;
            return;
          } else {
            await ctx.replyWithHTML(res?.EM);
            isFetchingData = true;
            return;
          }
        }
        isFetchingData = true;
        return;
      } catch (error) {
        console.log("check error", error)
        await ctx.replyWithHTML("Vui lòng thử lại sau");
        isFetchingData = true;
        return;
      }

    })

    bot.hears("phiên", (ctx) => {
      // Send response message
      if (isFetchingData) {
        isFetchingData = false;
        ctx.reply(helpMessage)
        isFetchingData = true;
      }
    })
    bot.hears("/phiên", (ctx) => {
      // Send response message
      if (isFetchingData) {
        isFetchingData = false;
        ctx.reply(helpMessage)
        isFetchingData = true;
      }
    })

  } catch (e) {
    // Gửi một tin nhắn
    bot.telegram.sendMessage(process.env.id_groupNLTB, 'Lỗi nghiêm trọng, vui lòng đợi trong giây lát')
      .then(() => {
        console.log('Đã gửi tin nhắn thành công');
      })
      .catch((error) => {
        console.log('Lỗi khi gửi tin nhắn:', error);
      });
    isFetchingData = true;
  }

  bot.launch();

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}
export default botTelegram;

