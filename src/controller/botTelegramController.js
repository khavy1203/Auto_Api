import botTelegramService from "../service/botTelegramService";
const dotenv = require('dotenv');
const https = require('https');
const axios = require('axios');
require("dotenv").config();
const fs = require('fs');
const path = require('path');
const moment = require('moment');
import constant from '../constant/constant';
const XLSX = require('xlsx');
const sql = require('mssql');
const PDFDocument = require('pdfkit');


// Hàm tạo form và xuất ra file PDF
const generatePDF = (name) => {
  return new Promise((rs, rj) => {
    const data = [
      { column1: 'Row 1', column2: 'Value 1', column3: 'Info 1' },
      { column1: 'Row 2', column2: 'Value 2', column3: 'Info 2' },
      { column1: 'Row 3', column2: 'Value 3', column3: 'Info 3' },
    ];
    const doc = new PDFDocument();

    // Tạo stream để ghi dữ liệu PDF vào
    const stream = fs.createWriteStream('output.pdf');

    doc.pipe(stream);

    // const pathFolderPdf = path.join(__dirname + '../../') + "filesPDF/inDat/" + name + ".pdf";

    // Tạo bảng header
    doc.font('Helvetica-Bold');
    doc.fontSize(12);
    doc.text('Column 1', { align: 'left', width: 100 });
    doc.text('Column 2', { align: 'left', width: 100 });
    doc.text('Column 3', { align: 'left', width: 100 });

    // Tạo viền cho bảng header
    doc.lineWidth(1);
    doc.lineJoin('miter');
    doc.rect(30, 70, 270, 20).stroke();

    // Tạo bảng dữ liệu từ mảng truyền vào
    doc.font('Helvetica');
    doc.fontSize(10);

    let startY = 90;

    data.forEach((row, index) => {
      const { column1, column2, column3 } = row;

      // Tạo giá trị cho từng cột trong hàng
      doc.text(column1, 40, startY, { width: 100 });
      doc.text(column2, 140, startY, { width: 100 });
      doc.text(column3, 240, startY, { width: 100 });

      // Tạo viền cho từng hàng
      doc.rect(30, startY - 5, 270, 20).stroke();

      // Tăng vị trí bắt đầu của hàng tiếp theo
      startY += 20;
    });

    // Kết thúc và lưu file PDF
    doc.end();
  })


}

module.exports = {
  generatePDF
}