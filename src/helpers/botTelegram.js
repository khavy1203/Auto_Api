const { Telegraf, Extra } = require('telegraf');
import { checkTokenTelegram, getTokenTelegram, checkTokenInLocalNLTB, getTokenInLocalNLTB } from '../middleware/tokenAction.js';
import nltbLocalService from '../service/nltbLocalService.js';
const moment = require('moment');
import constant from '../constant/constant.js';
import nltbLocalController from "../controller/nltbLocalController.js";
import botTelegramController from "../controller/botTelegramController.js";
import toolAutoServices from "../service/toolAutoServices.js";

const cron = require('node-cron');
const sql = require('mssql');

import botTelegramService from '../service/botTelegramService.js';
const fs = require('fs');
require('dotenv').config();


const botTelegram = (app) => {

  let isFetchingData = true;
  const bot = new Telegraf(process.env.BOT_TOKEN);

  let countRowLoopSession = -1;
  // Define cron job chạy mỗi phút 1 lần
  cron.schedule('0 */4 * * *', async () => {
    let connection;
    try {
      // Kết nối tới SQL Server
      connection = await sql.connect(constant.config);
      console.log('Connected to SQL Server');

      // Tạo một request để thực hiện truy vấn
      const request = new sql.Request();

      // Truy vấn dữ liệu
      const result = await request.query(`SELECT A.ID, A.MaDK,dbo.GetEcoString(HV.HoTen) as 'HotenHocVien', Imei, dbo.GetEcoString(A.TongThoiGian) as 'Tongthoigian', dbo.GetEcoString(A.TongQuangDuong) as 'Tongquangduong', ThoiDiemDangNhap, ThoiDiemDangXuat , dbo.GetEcoString(GV.HoTen) as 'HotenGiaoVien' , BienSo
      FROM [dbo].HttEtmIsted AS A
      LEFT JOIN GiaoVienTH as GV on A.IDGV = GV.MaGV
      LEFT JOIN HocVienTH as HV on A.MaDK = HV.MaDK`);
      let countLoop = result.recordset.length;
      // Các xử lý khác với dữ liệu trả về từ truy vấn

      if (countRowLoopSession == -1) countRowLoopSession = countLoop;
      else {
        if (countLoop > countRowLoopSession) {
          isFetchingData = false;
          const {
            ID,
            MaDK,
            HotenHocVien,
            Imei,
            Tongthoigian,
            Tongquangduong,
            ThoiDiemDangNhap,
            ThoiDiemDangXuat,
            HotenGiaoVien,
            BienSo
          } = result.recordset[countLoop - 1];
          let textNoti = `<i><b>Cảnh báo ! Phát hiện phiên bị trùng 👮👮👮</b></i>\n<i>Mã học viên:</i><code style="color: red;"> <b style="color:red;">${MaDK}</b></code>\n<i>Họ Tên Học Viên:</i> <b>${HotenHocVien}</b>\n<i>Imei xe:</i> <b>${Imei}</b>\n<i>Tổng thời gian:</i> <b>${Tongthoigian}</b>\n<i>Tổng quãng đường:</i> <b>${Tongquangduong}</b>\n<i>Thời điểm đăng nhập:</i> <b>${moment(ThoiDiemDangNhap).utcOffset('+0000').format('DD/MM/YYYY HH:mm:ss')}</b>\n<i>Thời điểm đăng xuất:</i> <b>${moment(ThoiDiemDangXuat).utcOffset('+0000').format('DD/MM/YYYY HH:mm:ss')}</b>\n<i>Họ tên giáo viên:</i> <b>${HotenGiaoVien}</b>\n <i>Biển số xe:</i> <b>${BienSo}</b>\n 
            `;
          await bot.telegram.sendMessage(process.env.id_admin, textNoti, { parse_mode: 'HTML' });
          countRowLoopSession = countLoop;
        } else countRowLoopSession = countLoop;
      }

      isFetchingData = true;
      return
      // Xử lý kết quả truy vấn tại đây
    } catch (err) {
      console.error('Error:', err);
      isFetchingData = true;
      return
    } finally {
      // Đóng kết nối
      if (connection) {
        try {
          await connection.close();
          console.log('Connection closed');
          isFetchingData = true;
          return
        } catch (err) {
          console.error('Error closing connection:', err);
          isFetchingData = true;
          return
        }
      }
    }
  });

  const helpMessage = `
    Các cú pháp sử dụng bot ( CÁC CÚ PHÁP VUI LÒNG KHÔNG DẤU ) : 
      /dat tenhocvien hoặc mãhọcviên (Kiểm tra DAT học viên) Ví dụ : /dat 123456 hoặc /dat Nguyễn Văn A (trong đó 123456 là 6 số cuối của mã số học viên)
      /datlocal tên học viên hoặc 6 số cuối mã học viên hoặc CMND của sinh viên đó (Kiểm tra DAT ở máy chủ cục bộ cho học viên) Ví dụ: /datlocal phạm xuân khả vy hoặc /datlocal 123456 hoặc /datlocal 215488523 (CMND)
      /phien tenhocvien hoặc mãhọcviên (Kiểm tra Phiên học viên) Ví dụ : /phien 123456 hoặc /phien Nguyễn Văn A (trong đó 123456 là 6 số cuối của mã số học viên)
      /matphien mãhọcviên ( Nhằm kiếm tra bị "MẤT PHIÊN" - đối chiếu dữ liệu phiên giữa máy DAT và Ftrên Tổng Cục, để xử lý cho các thầy có thể tìm kiếm được phiên bị mất, hoặc phiên load quá lâu trên 12h)
      /indat biểnsốxe (Làm giấy phép tập lái. Ví dụ : /indat 77A12345 mặt định là 1 tháng, muốn lấy dữ liệu trong 2,3 thì cách ra và thêm số 2 hoặc 3 tháng . Ví dụ : /indat 77A12345 2 )
      /timkhoa tênkhoá (Kiểm tra tên khoá học để đẩy xuống xe cho chính xác. Ví dụ: /timkhoa 127 )
      /daykhoa tênkhoá biểnsốxe (Đẩy khoá học xuống xe. Ví dụ đẩy khoá 127 xuống xe 77A12345: /daykhoa 127 77A12345 )
    `;

  const helpAdmin = `
        /testform dùng để test form
  `
  const arrLocalCheck = [
    '/matphien',
    '/indat',
    '/daykhoa',
    '/timkhoa',
    '/datlocal'
  ];

  const arrTongCucCheck = [
    '/dat',
    '/phien'
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

          const checkNull = input[0]?.trim();
          console.log("check giá trị vào", checkNull);
          if (!checkNull) {
            await ctx.reply(helpMessage);
            isFetchingData = true;
            return;
          }

          if (arrLocalCheck.includes(commandCheck.toLowerCase())) {

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
          }
          await next(ctx);// nếu middleware thì cần await next trong mỗi ràng buộc

          // if (arrTongCucCheck.includes(commandCheck.toLowerCase())) {
          //   const checkData = await checkTokenTelegram();
          //   if (+checkData?.EC != 0 || !checkData?.DT?.length) {
          //     const data = await getTokenTelegram();
          //     console.log('check data in getToken', data)
          //     if (+data.EC != 0 || !data?.DT?.id_token) {
          //       await ctx.reply('Lỗi lấy token, vui lòng thử lại sau');
          //       isFetchingData = true;
          //       return;
          //     } else {
          //       ctx.state.tokenNLTB = data?.DT?.id_token;
          //     }
          //   }
          //   ctx.state.tokenNLTB = process.env.tokenNLTB;
          //   await next(ctx);
          // }

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

          const res = await botTelegramService.getInfoStudent(name.trim());

          Promise.all([res]);
          console.log('check data', res);
          if (+res?.EC != 0) {
            await ctx.reply('Truy vấn thất bại');
            isFetchingData = true;
            return;
          }
          let i = 1;
          const outputFormat = 'DD/MM/YYYY HH[h]mm[p]';
          if (res.EC == 0 && res.DT?.length > 0) {
            for (const e of res.DT) {
              const {
                MaDK, HoTen, NgaySinh, SoCMT, HangDaoTao, IsSend, TenKhoaHoc, TongQuangDuong, TongThoiGian, TongThoiGianBanDem, TongThoiGianChayXeTuDong, TongThoiGianTrong24h, ThoiDiemReset
              } = e;
              const moreTime = await nltbLocalController.checkTime(HangDaoTao, TongThoiGian);
              const moreDistance = await nltbLocalController.checkDistance(HangDaoTao, TongQuangDuong);
              const moreTimeNight = await nltbLocalController.checkTimeNight(HangDaoTao, TongThoiGianBanDem);
              const moreRunOnAutoCar = await nltbLocalController.checkRunOnAutoCar(HangDaoTao, TongThoiGianChayXeTuDong)
              const moreTimePass10h = await nltbLocalController.checkHourPass10h(TongThoiGianTrong24h)
              let textNoti = `<i><b>STT: ${i++}</b></i>\n<i>Mã học viên:</i><code style="color: red;"> <b style="color:red;">${MaDK}</b></code>\n<i>Họ Tên Học Viên:</i> <b>${HoTen}</b>\n<i>Ngày sinh:</i> <b>${moment(NgaySinh).utcOffset('+0000').format('DD/MM/YYYY')}</b>\n<i>Số CMND:</i> <b>${SoCMT}</b>\n<i>Hạng đào tạo:</i> <b>${HangDaoTao}</b>\n<i>Khoá học:</i> <b>${TenKhoaHoc}</b>\n<i>Trạng thái cho phép gửi dữ liệu:</i> <b>${IsSend == 1 ? "Cho phép" : "Không cho phép"}</b>\n\n<i>Tổng quãng đường:</i> <b>${TongQuangDuong} Km</b>\n<i>Quãng đường còn thiếu:</i> <b>${moreDistance ? moreDistance + ' Km' : ''}</b>\n\n<i>Tổng thời gian:</i> <b>${TongThoiGian.toFixed(2)} Giờ</b>\n<i>Thời gian còn thiếu:</i> <b>${moreTime ? moreTime + ' Giờ' : ''}</b>\n\n<i>Tổng thời gian ban đêm:</i> <b>${TongThoiGianBanDem ? TongThoiGianBanDem.toFixed(2) + ' Giờ' : ''}</b>\n<i>Thời gian ban đêm còn thiếu:</i> <b>${moreTimeNight ? moreTimeNight + ' Giờ' : ''}</b>\n\n<i>Tổng thời gian chạy xe tự động:</i> <b>${TongThoiGianChayXeTuDong ? TongThoiGianChayXeTuDong + ' Giờ' : ''}</b>\n<i>Thời gian chạy xe tự động còn thiếu:</i> <b>${moreRunOnAutoCar ? moreRunOnAutoCar + ' Giờ' : ''}</b>\n\n<i>Thời gian được phép chạy né vượt 10h/24h:</i> <b>Còn ${moreTimePass10h != -1 ? moreTimePass10h + ' Giờ' : 'Bạn đang chạy vượt quá 10h'}</b>\n<i>Thời điểm reset lại 10h:</i> <b>${moreTimePass10h != -1 && moreTimePass10h != 10 ? moment(ThoiDiemReset).utcOffset('+0000').format(outputFormat) : 'Thời gian đã reset, bạn có thể chạy bất cứ khi nào'}</b>
                `;

              const pr1 = await ctx.replyWithHTML(textNoti);
              const pr2 = await sleep();
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
        console.log('check err', e)
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

          const res = await botTelegramService.getInfoStudent(name.trim());

          Promise.all([res]);
          console.log('check data', res);
          if (+res?.EC != 0) {
            await ctx.reply('Truy vấn thất bại');
            isFetchingData = true;
            return;
          }
          let i = 1;
          const outputFormat = 'DD/MM/YYYY HH[h]mm[p]';
          if (res.EC == 0 && res.DT?.length > 0) {
            for (const e of res.DT) {
              const {
                MaDK, HoTen, NgaySinh, SoCMT, HangDaoTao, IsSend, TenKhoaHoc, TongQuangDuong, TongThoiGian, TongThoiGianBanDem, TongThoiGianChayXeTuDong, TongThoiGianTrong24h, ThoiDiemReset
              } = e;
              const moreTime = await nltbLocalController.checkTime(HangDaoTao, TongThoiGian);
              const moreDistance = await nltbLocalController.checkDistance(HangDaoTao, TongQuangDuong);
              const moreTimeNight = await nltbLocalController.checkTimeNight(HangDaoTao, TongThoiGianBanDem);
              const moreRunOnAutoCar = await nltbLocalController.checkRunOnAutoCar(HangDaoTao, TongThoiGianChayXeTuDong)
              const moreTimePass10h = await nltbLocalController.checkHourPass10h(TongThoiGianTrong24h)
              let textNoti = `<i><b>STT: ${i++}</b></i>\n<i>Mã học viên:</i><code style="color: red;"> <b style="color:red;">${MaDK}</b></code>\n<i>Họ Tên Học Viên:</i> <b>${HoTen}</b>\n<i>Ngày sinh:</i> <b>${moment(NgaySinh).utcOffset('+0000').format('DD/MM/YYYY')}</b>\n<i>Số CMND:</i> <b>${SoCMT}</b>\n<i>Hạng đào tạo:</i> <b>${HangDaoTao}</b>\n<i>Khoá học:</i> <b>${TenKhoaHoc}</b>\n<i>Trạng thái cho phép gửi dữ liệu:</i> <b>${IsSend == 1 ? "Cho phép" : "Không cho phép"}</b>\n\n<i>Tổng quãng đường:</i> <b>${TongQuangDuong} Km</b>\n<i>Quãng đường còn thiếu:</i> <b>${moreDistance ? moreDistance + ' Km' : ''}</b>\n\n<i>Tổng thời gian:</i> <b>${TongThoiGian.toFixed(2)} Giờ</b>\n<i>Thời gian còn thiếu:</i> <b>${moreTime ? moreTime + ' Giờ' : ''}</b>\n\n<i>Tổng thời gian ban đêm:</i> <b>${TongThoiGianBanDem ? TongThoiGianBanDem.toFixed(2) + ' Giờ' : ''}</b>\n<i>Thời gian ban đêm còn thiếu:</i> <b>${moreTimeNight ? moreTimeNight + ' Giờ' : ''}</b>\n\n<i>Tổng thời gian chạy xe tự động:</i> <b>${TongThoiGianChayXeTuDong ? TongThoiGianChayXeTuDong + ' Giờ' : ''}</b>\n<i>Thời gian chạy xe tự động còn thiếu:</i> <b>${moreRunOnAutoCar ? moreRunOnAutoCar + ' Giờ' : ''}</b>\n\n<i>Thời gian được phép chạy né vượt 10h/24h:</i> <b>Còn ${moreTimePass10h != -1 ? moreTimePass10h + ' Giờ' : 'Bạn đang chạy vượt quá 10h'}</b>\n<i>Thời điểm reset lại 10h:</i> <b>${moreTimePass10h != -1 && moreTimePass10h != 10 ? moment(ThoiDiemReset).utcOffset('+0000').format(outputFormat) : 'Thời gian đã reset, bạn có thể chạy bất cứ khi nào'}</b>
                `;

              const pr1 = await ctx.replyWithHTML(textNoti);
              const pr2 = await sleep();
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
        console.log('check err', e)
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

          const res = await botTelegramService.getInfoStudent(name.trim());

          Promise.all([res]);
          console.log('check data', res);
          if (+res?.EC != 0) {
            await ctx.reply('Truy vấn thất bại');
            isFetchingData = true;
            return;
          }

          let i = 1;
          if (res.EC == 0 && res.DT?.length > 0) {
            for (const e of res.DT) {
              const {
                MaDK, HoTen, NgaySinh, SoCMT, HangDaoTao, IsSend, TenKhoaHoc, MaKhoaHoc, TongQuangDuong, TongThoiGian, TongThoiGianBanDem, TongThoiGianChayXeTuDong, TongThoiGianTrong24h, ThoiDiemReset
              } = e;
              const res1 = await toolAutoServices.getAllPhienHoc(MaDK)
              const convertObjectToArray = (obj, index) => {
                const hours = Math.floor(obj.TongThoiGian); // Lấy phần nguyên (giờ)
                const minutes = Math.round((obj.TongThoiGian - hours) * 60); // Lấy phần thập phân, chuyển đổi thành phút
                return [
                  index + 1, // Số tự tự
                  obj.TimeDaoTao,
                  obj.DateDaotao,
                  `${hours}h${minutes}`, // Chuyển đổi TongThoiGian thành phút
                  `${parseFloat(obj.TongQuangDuong).toFixed(2)} km `// Giữ nguyên giá trị TongQuangDuong
                ];
              };
              const tableData = res1?.DT?.map((obj, index) => convertObjectToArray(obj, index));

              const moreTime = await nltbLocalController.checkTime(HangDaoTao, TongThoiGian);
              const moreDistance = await nltbLocalController.checkDistance(HangDaoTao, TongQuangDuong);
              const moreTimeNight = await nltbLocalController.checkTimeNight(HangDaoTao, TongThoiGianBanDem);
              const moreRunOnAutoCar = await nltbLocalController.checkRunOnAutoCar(HangDaoTao, TongThoiGianChayXeTuDong)
              const moreTimePass10h = await nltbLocalController.checkHourPass10h(TongThoiGianTrong24h)
              const print = await toolAutoServices.generatePDF(MaDK, i++, HoTen, NgaySinh, MaKhoaHoc[0], HangDaoTao, tableData, TongThoiGian, TongQuangDuong, moreTime != null || moreDistance != null ? "Không Đạt" : "Đạt")

              if (print) {
                const pdfFilePath = print;
                const pdfBuffer = fs.readFileSync(pdfFilePath);;
                if (fs.existsSync(pdfFilePath)) {
                  console.log("file tồn tại")
                  const pr2 = await ctx.replyWithDocument({ source: pdfBuffer, filename: HoTen + '_' + TenKhoaHoc + '.pdf' }, { chat_id: ctx.chat.id }); // Gửi nội dung PDF lên group
                  fs.unlink(pdfFilePath, (err) => {
                    if (err) {
                      console.error(err);
                      return;
                    }
                    console.log('File deleted successfully');
                  });
                  const pr3 = await sleep();
                  await Promise.all([pr2, pr3]);
                } else {
                  console.log("file KHông tồn tại")
                  ctx.reply("File không tồn tại");
                }
              }

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
        console.log('check err', e)
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

    bot.command('datlocal', async (ctx) => {
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
          const mhv = await nltbLocalService.getMHVforCCCD(tokenNLTB, input.join(" "))
          if (!mhv?.DT) {
            await ctx.reply('Không tồn tại tên học này hoặc CMND của học viên \"' + input.join(" ") + '\" này !!! Vui lòng lấy 6 số cuối của MSHV hoặc CMND cho chuẩn ạ ');
            isFetchingData = true;
            return;
          }
          const res = await nltbLocalService.dowloadFilePDFFromNLTBLocal(tokenNLTB, mhv.DT);
          if (res?.EC == 0) {
            const pdfFilePath = res.DT;
            const pdfBuffer = fs.readFileSync(pdfFilePath);;
            if (fs.existsSync(pdfFilePath)) {
              console.log("file tồn tại")
              await ctx.replyWithDocument({ source: pdfBuffer, filename: input.join("_") + '.pdf' }, { chat_id: ctx.chat.id }); // Gửi nội dung PDF lên group
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
      } catch (e) {
        await ctx.reply("Vui lòng thử lại sau !!!");
        isFetchingData = true;
        return;
      }

    })

    bot.command('DATLOCAL', async (ctx) => {
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
          const mhv = await nltbLocalService.getMHVforCCCD(tokenNLTB, input.join(" "))
          if (!mhv?.DT) {
            await ctx.reply('Không tồn tại tên học này hoặc CMND của học viên \"' + input.join(" ") + '\" này !!! Vui lòng lấy 6 số cuối của MSHV hoặc CMND cho chuẩn ạ ');
            isFetchingData = true;
            return;
          }
          const res = await nltbLocalService.dowloadFilePDFFromNLTBLocal(tokenNLTB, mhv.DT);
          if (res?.EC == 0) {
            const pdfFilePath = res.DT;
            const pdfBuffer = fs.readFileSync(pdfFilePath);;
            if (fs.existsSync(pdfFilePath)) {
              console.log("file tồn tại")
              await ctx.replyWithDocument({ source: pdfBuffer, filename: input.join("_") + '.pdf' }, { chat_id: ctx.chat.id }); // Gửi nội dung PDF lên group
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
      } catch (e) {
        await ctx.reply("Vui lòng thử lại sau !!!");
        isFetchingData = true;
        return;
      }

    })

    //testform 
    bot.command('testform', async (ctx) => {
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
          // let tokenNLTB = ctx?.state?.tokenNLTB;
          // const mhv = await nltbLocalService.getMHVforCCCD(tokenNLTB, input.join(" "))
          // if (!mhv?.DT) {
          //   await ctx.reply('Không tồn tại tên học này hoặc CMND của học viên \"' + input.join(" ") + '\" này !!! Vui lòng lấy 6 số cuối của MSHV hoặc CMND cho chuẩn ạ ');
          //   isFetchingData = true;
          //   return;
          // }
          const res = await botTelegramController.generatePDF("123");
          if (res?.EC == 0) {
            // const pdfFilePath = res.DT;
            // const pdfBuffer = fs.readFileSync(pdfFilePath);;
            // if (fs.existsSync(pdfFilePath)) {
            //   console.log("file tồn tại")
            //   await ctx.replyWithDocument({ source: pdfBuffer, filename: input.join("_") + '.pdf' }, { chat_id: ctx.chat.id }); // Gửi nội dung PDF lên group
            //   fs.unlink(pdfFilePath, (err) => {
            //     if (err) {
            //       console.error(err);
            //       return;
            //     }
            //     console.log('File deleted successfully');
            //   });

            //   isFetchingData = true;
            //   return;
            // } else {
            //   console.log("file KHông tồn tại")
            //   ctx.reply("File không tồn tại");
            //   isFetchingData = true;
            //   return;
            // }
            console.log('file tạo thành công')
          } else {
            await ctx.replyWithHTML(res?.EM);
            isFetchingData = true;
            return;
          }
        }
      } catch (e) {
        console.log("check e", e)
        await ctx.reply("Vui lòng thử lại sau !!!");
        isFetchingData = true;
        return;
      }

    })

    //testform 
    bot.command('helpAdmin', async (ctx) => {
      try {
        if (isFetchingData) {
          isFetchingData = false;
          await ctx.replyWithHTML(helpAdmin);
          isFetchingData = true;
          return;

        }
      } catch (e) {
        console.log("check e", e)
        await ctx.reply("Vui lòng thử lại sau !!!");
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

