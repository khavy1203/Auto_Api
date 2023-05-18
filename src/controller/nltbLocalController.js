const path = require('path');
const XLSX = require('xlsx');
const fs = require('fs');
const dotenv = require('dotenv');
const { PDFDocument} = require('pdf-lib');
const { exec } = require('child_process');
const nltbLocalService = require('../service/nltbLocalService');

async function sleep() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, 5000);
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

                    do {
                        let mhv = {};
                        do {
                            mhv = await nltbLocalService.getMHVforCCCD(req?.token, result)
                            console.log("số lần lặp tìm kiếm CCCD", k++)
                        } while (mhv.EC != 0);

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
                        let xPos = width - 20;
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

module.exports = {
    nltbLocalInDat
}