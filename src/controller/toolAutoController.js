const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const dotenv = require('dotenv');
const { PDFDocument } = require('pdf-lib');
const xml2js = require('xml2js');
const { exec } = require('child_process');
import nltbLocalController from './nltbLocalController';
import botTelegramService from '../service/botTelegramService';
import toolAutoServices from '../service/toolAutoServices';
const generateImageBaoCao1 = async (req, res) => {
}
const queryFetchStudentOnDatabaseOnMKH = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        console.log("check file", req.files)
        const file = req.files.data;
        console.log("check file", file)
        const workbook = XLSX.read(file.data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log("check rows", rows)
        const resDataXLSX = [];
        // Thực hiện fetch

        for (const row of rows) {
            console.log("check row", row)
            if (row[0]) {
                let result = row[0];
                console.log("check result", result)
                if (result) {
                    let j = 0;
                    const res = await botTelegramService.getInfoStudentOnCource(result.trim());
                    Promise.all([res]);

                    if (res.EC == 0 && res.DT?.length > 0) {
                        for (const e of res.DT) {
                            const {
                                MaDK, HoTen, NgaySinh, SoCMT, HangDaoTao, MaKhoaHoc, IsSend, TenKhoaHoc, TongQuangDuong, TongThoiGian, TongThoiGianBanDem, TongThoiGianChayXeTuDong, TongThoiGianTrong24h, ThoiDiemReset
                            } = e;
                            const moreTime = await nltbLocalController.checkTime(HangDaoTao, TongThoiGian);
                            const moreDistance = await nltbLocalController.checkDistance(HangDaoTao, TongQuangDuong);
                            const moreTimeNight = await nltbLocalController.checkTimeNight(HangDaoTao, TongThoiGianBanDem);
                            const moreRunOnAutoCar = await nltbLocalController.checkRunOnAutoCar(HangDaoTao, TongThoiGianChayXeTuDong)
                            const moreTimePass10h = await nltbLocalController.checkHourPass10h(TongThoiGianTrong24h)
                            const newObj = { "Họ và Tên": HoTen, 'Mã học viên': MaDK, 'Ngày sinh': NgaySinh, 'Hạng đào tạo': HangDaoTao, 'Mã khoá học': MaKhoaHoc[0], 'Đơn vị đào tạo': "Trường Cao Đẳng Xây Dựng - Nông Lâm Trung Bộ", 'Thời gian đào tạo': TongThoiGian.toFixed(2), 'Quãng đường đào tạo': TongQuangDuong.toFixed(2), 'Thời gian thiếu': moreTime, 'Quãng đường thiếu': moreDistance, 'Ghi chú': '', 'Yêu cầu': '' }
                            if (res.EC == 0) resDataXLSX.push(newObj)
                        };
                    }
                }
            }
        };

        console.log("check resDataXLSX", resDataXLSX)
        // const sortData = resDataXLSX.sort((a, b) => a['Tên'].localeCompare(b['Tên']));
        let i = 0;
        const updatedSTTArray = resDataXLSX.map((obj, index) => {
            if (!obj['Tên']) return {
                'STT': 0,
                ...obj,
            };
            return {
                'STT': i++,
                ...obj,
            };
        });

        const workbookWrite = XLSX.utils.book_new();
        // Chuyển đổi dữ liệu thành định dạng Excel
        const worksheetWrite = XLSX.utils.json_to_sheet(updatedSTTArray);
        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbookWrite, worksheetWrite, 'ThongTinHocVien');
        XLSX.writeFile(workbookWrite, `ThongTinHocVien.xlsx`);
        saveAs('ThongTinHocVienOnLocal.xlsx');
        console.log("kết thúc")
        res.status(200).json({
            EM: 1,
            EC: 1,
            DT: 1,
        });
        // res.status(200).json({
        //   EM: data.EM,
        //   EC: data.EC,
        //   DT: data.DT,
        // });
    } catch (e) {
        console.log("check e", e)
        return res.status(500).json({
            EM: "error from sever", //error message
            EC: "-1", //error code
            DT: "",
        });
    }
}

const queryFetchStudentOnDatabaseOnMHV = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        console.log("check file", req.files)
        const file = req.files.data;
        console.log("check file", file)
        const workbook = XLSX.read(file.data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        console.log("check rows", rows)
        const resDataXLSX = [];
        // Thực hiện fetch

        for (const row of rows) {
            console.log("check row", row)
            if (row[0]) {
                let result = row[0];
                console.log("check result", result)
                if (result) {
                    let j = 0;
                    const res = await botTelegramService.getInfoStudentOnMHV(result.trim());
                    Promise.all([res]);

                    if (res.EC == 0 && res.DT?.length > 0) {
                        for (const e of res.DT) {
                            const {
                                MaDK, HoTen, NgaySinh, SoCMT, HangDaoTao, MaKhoaHoc, IsSend, TenKhoaHoc, TongQuangDuong, TongThoiGian, TongThoiGianBanDem, TongThoiGianChayXeTuDong, TongThoiGianTrong24h, ThoiDiemReset
                            } = e;
                            const moreTime = await nltbLocalController.checkTime(HangDaoTao, TongThoiGian);
                            const moreDistance = await nltbLocalController.checkDistance(HangDaoTao, TongQuangDuong);
                            const moreTimeNight = await nltbLocalController.checkTimeNight(HangDaoTao, TongThoiGianBanDem);
                            const moreRunOnAutoCar = await nltbLocalController.checkRunOnAutoCar(HangDaoTao, TongThoiGianChayXeTuDong)
                            const moreTimePass10h = await nltbLocalController.checkHourPass10h(TongThoiGianTrong24h)
                            const newObj = { "Họ và Tên": HoTen, 'Mã học viên': MaDK, 'Ngày sinh': NgaySinh, 'Hạng đào tạo': HangDaoTao, 'Mã khoá học': MaKhoaHoc[0], 'Đơn vị đào tạo': "Trường Cao Đẳng Xây Dựng - Nông Lâm Trung Bộ", 'Thời gian đào tạo': TongThoiGian.toFixed(2), 'Quãng đường đào tạo': TongQuangDuong.toFixed(2), 'Thời gian thiếu': moreTime, 'Quãng đường thiếu': moreDistance, 'Ghi chú': '', 'Yêu cầu': '' }
                            if (res.EC == 0) resDataXLSX.push(newObj)
                        };
                    }
                }
            }
        };

        console.log("check resDataXLSX", resDataXLSX)
        // const sortData = resDataXLSX.sort((a, b) => a['Tên'].localeCompare(b['Tên']));
        let i = 0;
        const updatedSTTArray = resDataXLSX.map((obj, index) => {
            if (!obj['Tên']) return {
                'STT': 0,
                ...obj,
            };
            return {
                'STT': i++,
                ...obj,
            };
        });

        const workbookWrite = XLSX.utils.book_new();
        // Chuyển đổi dữ liệu thành định dạng Excel
        const worksheetWrite = XLSX.utils.json_to_sheet(updatedSTTArray);
        // Thêm worksheet vào workbook
        XLSX.utils.book_append_sheet(workbookWrite, worksheetWrite, 'ThongTinHocVien');
        XLSX.writeFile(workbookWrite, `ThongTinHocVien.xlsx`);
        saveAs('ThongTinHocVienOnLocal.xlsx');
        console.log("kết thúc")
        res.status(200).json({
            EM: 1,
            EC: 1,
            DT: 1,
        });
        // res.status(200).json({
        //   EM: data.EM,
        //   EC: data.EC,
        //   DT: data.DT,
        // });
    } catch (e) {
        console.log("check e", e)
        return res.status(500).json({
            EM: "error from sever", //error message
            EC: "-1", //error code
            DT: "",
        });
    }
}
async function sleep() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 2000);
    });
  }
const indat = async (req, res) => {
    try {
        // let name = req.params.name ;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }
        console.log("check file", req.files)
        const file = req.files.data;
        console.log("check file", file)
        const workbook = XLSX.read(file.data);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // const pr1 = rows.map(async (row, rowIndex) => {

        let count = 1;
        for (const e of rows) {
            if (e.length) {
                let result = e[0];
                if (result) {
                    console.log("check result", result)

                    const res = await botTelegramService.getInfoStudentOnMHV(result.trim());
                    const res1 = await toolAutoServices.getAllPhienHoc(result.trim())
                    Promise.all([res]);
                    console.log("check res111111111", res1)
                    // Chuyển đổi kiểu dữ liệu
                    // Hàm tuỳ chỉnh để chuyển đổi đối tượng thành mảng con với số tự tự
                    // Chuyển đổi thành giờ và phút
                    
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
                    console.log("check tableData", tableData)

                    if (res.EC == 0 && res.DT?.length > 0 && res1.EC == 0 && res1.DT?.length > 0) {
                        for (const e of res.DT) {
                            const {
                                MaDK, HoTen, NgaySinh, SoCMT, HangDaoTao, MaKhoaHoc, IsSend, TenKhoaHoc, TongQuangDuong, TongThoiGian, TongThoiGianBanDem, TongThoiGianChayXeTuDong, TongThoiGianTrong24h, ThoiDiemReset
                            } = e;
                            const moreTime = await nltbLocalController.checkTime(HangDaoTao, TongThoiGian);
                            const moreDistance = await nltbLocalController.checkDistance(HangDaoTao, TongQuangDuong);
                            const moreTimeNight = await nltbLocalController.checkTimeNight(HangDaoTao, TongThoiGianBanDem);
                            const moreRunOnAutoCar = await nltbLocalController.checkRunOnAutoCar(HangDaoTao, TongThoiGianChayXeTuDong)
                            const moreTimePass10h = await nltbLocalController.checkHourPass10h(TongThoiGianTrong24h)
                            const print = await toolAutoServices.generatePDF(MaDK,e.indexOf(1)!= -1 ? e[1] : count, HoTen, NgaySinh, MaKhoaHoc[0], HangDaoTao, tableData, TongThoiGian, TongQuangDuong, moreTime != null || moreDistance != null ? "Không Đạt" : "Đạt")
                            const printCommand = `"C:\\Users\\KHA VY\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe" -print-to-default -print-settings "duplex,long-edge" "${print}"`
                            await sleep();
                            if(print){
                                const printPromise  = new Promise((rs,rj) =>{
                                    exec(printCommand, (error, stdout, stderr) => {
                                        if (error) {
                                            console.error('Lỗi khi in file:', error);
                                            reject(error);
                                            res.status(200).json({
                                                EM: "Lỗi khi in file, vui lòng tiếp tục in lại ...",
                                                EC: 1,
                                                DT: countStd,
                                            });
                                        }
                                        console.log('File PDF đã được in thành công.');
                                        resolve();
                                    });
                                })
                                await printPromise;
                                
                                count++;
                            }
                           
                        };

                    }

                }
            }
        }

        // });
        // await Promise.all(pr1);

        res.status(200).json({
            EM: 1,
            EC: 1,
            DT: 1,
        });
    } catch (e) {
        console.log("check error", e)
        return res.status(500).json({
            EM: "error from sever", //error message
            EC: "-1", //error code
            DT: "",
        });
    }
}

module.exports = {
    generateImageBaoCao1,
    queryFetchStudentOnDatabaseOnMKH,
    queryFetchStudentOnDatabaseOnMHV,
    indat
}