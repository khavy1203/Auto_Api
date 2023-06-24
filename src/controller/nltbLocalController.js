const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const dotenv = require('dotenv');
const { PDFDocument } = require('pdf-lib');
const { exec } = require('child_process');
const nltbLocalService = require('../service/nltbLocalService');

async function sleep() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}

const nltbLocalInDat = async (req, res) => {
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
                    let res = {};
                    let j = 0;
                    let k = 0;
                    console.log("check result", result)
                    do {
                        let mhv = {};
                        do {
                            mhv = await nltbLocalService.getMHVforCCCD(req?.token, result)
                            console.log("số lần lặp tìm kiếm CCCD", k++)
                        } while (mhv.EC != 0);
                        console.log("check mhv request", mhv)
                        res = await nltbLocalService.dowloadFilePDFFromNLTBLocal(req?.token, mhv.DT);
                        console.log("số lần lặp mhv", j++)
                    } while (res.EC != 0)

                    const pathFolderPdf = res.DT;
                    let existingPdfBytes = fs.readFileSync(pathFolderPdf);
                    let pdfDoc = await PDFDocument.load(existingPdfBytes);

                    const pages = pdfDoc.getPages();
                    for (let i = 0; i < pages.length; i++) {
                        let page = pages[i];

                        let { width, height } = page.getSize();
                        let fontSize = 15;
                        let text = count;
                        let xPos = width - 30;
                        let yPos = height - 20;
                        page.drawText(text.toString(), { x: xPos, y: yPos, size: fontSize });
                        // Cập nhật lại vị trí các trang để in 2 mặt

                    }

                    let modifiedPdfBytes = await pdfDoc.save();
                    fs.writeFileSync(pathFolderPdf, modifiedPdfBytes);
                    const printCommand = `"C:\\Users\\KHA VY\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe" -print-to-default -print-settings "duplex,long-edge" "${pathFolderPdf}"`
                    exec(printCommand, (error, stdout, stderr) => {
                        if (error) {
                            console.error('Lỗi khi in file:', error);
                            res.status(200).json({
                                EM: "Lỗi khi in file, vui lòng tiếp tục in lại ...",
                                EC: 1,
                                DT: count,
                            });
                        }
                        console.log('File PDF đã được in thành công.');
                    });
                    console.log("Số thứ tự", count)
                    count++;

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

function convertMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    const timeString = `${hours} giờ ${mins} phút`;
    return timeString;
}

const checkHourPass10h = async (time) => {
  if(time < 10  && time > 0)return 10 - time;
  if (time >= 10) return -1;
  return 10;
}

const checkRunOnAutoCar = async (hangdaotao, time) => {
    switch (hangdaotao) {
        case 'B11': {
            // do some thing
            return;
        }
        case 'B1': {
            // do some thing
            if (time < 3.2) {
                return (3.2- time).toFixed(2);
            }
            return;
        }
        case 'B2': {
            // do some thing
            if (time < 3.2) {
                return (3.2 - time).toFixed(2);
            }
            return;
        }
        case 'C': {
            // do some thing
            if (time < 1) {
                return (1 - time).toFixed(2)
            }
            return;
        }
        default: {
            // do something
            return;
        }
    }
}


const checkTimeNight = async (hangdaotao, time) => {
    switch (hangdaotao) {
        case 'B11': {
            // do some thing
            if (time < 3) {
                return (3 - time).toFixed(2);
            }
            return;
        }
        case 'B1': {
            // do some thing
            if (time < 4) {
                return (4 - time).toFixed(2);
            }
            return;
        }
        case 'B2': {
            // do some thing
            if (time < 4) {
                return (4 - time).toFixed(2);
            }
            return;
        }
        case 'C': {
            // do some thing
            if (time < 2.5) {
                return (2.5 - time).toFixed(2)
            }
            return;
        }
        default: {
            // do something
            return;
        }
    }
}

const checkTime = async (hangdaotao, time) => {
    switch (hangdaotao) {
        case 'B11': {
            // do some thing
            if (time < 12) {
                return (12 - time).toFixed(2);
            }
            return;
        }
        case 'B1': {
            // do some thing
            if (time < 20) {
                return (20 - time).toFixed(2);
            }
            return;
        }
        case 'B2': {
            // do some thing
            if (time < 20) {
                return (20 - time).toFixed(2);
            }
            return;
        }
        case 'C': {
            // do some thing
            if (time < 24) {
                return (24 - time).toFixed(2)
            }
            return;
        }
        default: {
            // do something
            return;
        }
    }
}

const checkDistance = async (hangdaotao, distance) => {
    switch (hangdaotao) {
        case 'B11': {
            // do some thing
            if (distance < 710) {
                return (710 - distance).toFixed(2);
            }
            return;
        }
        case 'B1': {
            // do some thing
            if (distance < 810) {
                return (810 - distance).toFixed(2);
            }
            return;
        }
        case 'B2': {
            // do some thing
            if (distance < 810) {
                return (810 - distance).toFixed(2);
            }
            return;
        }
        case 'C': {
            // do some thing
            if (distance < 825) {
                return (825 - distance).toFixed(2)
            }
            return;
        }
        default: {
            // do something
            return;
        }
    }
}

const fetchAPIonHVOnLocal = async (req, res) => {
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
                    let res = {};
                    do {
                        res = await nltbLocalService.getInfoStudentForLocal(req?.token, result.trim());
                        console.log("check result chay lai", result.trim())
                        console.log("chạy lại " + j++ + " lần")
                        if (res.EC == 0 && res?.DT?.HoTen) {
                            const { HoTen, MaDK, NgaySinh, HangDaoTao, IDKhoaHoc, TongThoiGian, TongQD } = res.DT;
                            const moreTime = await checkTime(HangDaoTao, (TongThoiGian / 60).toFixed(2));
                            const moreDistance = await checkDistance(HangDaoTao, TongQD);
                            let Yc = "";
                            if (moreDistance && moreTime) Yc = `Thời gian còn thiếu ${moreTime} quãng đường còn thiếu ${moreDistance}`;
                            if (moreDistance) Yc = `Quãng đường còn thiếu ${moreDistance}`;
                            if (moreTime) Yc = `Thời gian còn thiếu ${moreTime}`;

                            const newObj = { "Họ và Tên": HoTen, 'Mã học viên': MaDK, 'Ngày sinh': NgaySinh, 'Hạng đào tạo': HangDaoTao, 'Mã khoá học': IDKhoaHoc, 'Đơn vị đào tạo': "Trường Cao Đẳng Xây Dựng - Nông Lâm Trung Bộ", 'Thời gian đào tạo': (TongThoiGian / 60).toFixed(2), 'Quãng đường đào tạo': TongQD, 'Thời gian thiếu': moreTime, 'Quãng đường thiếu': moreDistance, 'Ghi chú': '', 'Yêu cầu': Yc }
                            if (res.EC == 0) resDataXLSX.push(newObj)
                        }
                    } while (res?.EC != 0)
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


module.exports = {
    nltbLocalInDat,
    fetchAPIonHVOnLocal,
    checkDistance,
    checkTime,
    checkTimeNight,
    checkRunOnAutoCar,
    checkHourPass10h
}