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
const { PDFDocument, rgb, PDFStandardFont, UnicodeFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');

// Hàm tạo form và xuất ra file PDF
const generatePDF = async (name) => {
  try {
    // Tạo tài liệu PDF mới
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    pdfDoc.setTitle('Table PDF');
    pdfDoc.setAuthor('Your Name');

    // Tạo trang mới và đặt kích thước
    const page = pdfDoc.addPage();
    page.setSize(595.28, 841.89); // Kích thước A4: 21cm x 29.7cm

    // Định nghĩa kích thước và vị trí bảng
    const tableX = 2.5*28.35; // Vị trí bảng theo trục x
    const tableY = 841.89-10.5*28.35; // Vị trí bảng theo trục y
    const cellWidths = [2 * 28.35, 4 * 28.35, 4 * 28.35, 3 * 28.35, 3 * 28.35]; // Kích thước cột

    // Dữ liệu của bảng
    const tableData = [
      ['HEADER1', 'HEADER2', 'HEADER3', 'HEADER4', 'HEADER5'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 11', 'Cell 12', 'Cell 13', 'Cell 14', 'Cell 15'],

      // Thêm các hàng dữ liệu khác tại đây...
    ];

    // Tính toán kích thước bảng dựa trên số hàng
    const numRows = tableData.length;
    const tableHeight = numRows *28.35; // Chiều cao mỗi hàng là 25 (có thể điều chỉnh)
    const cellHeight = tableHeight / numRows;

    console.log('check path', path.join(__dirname + '../../') + "font/font-times-new-roman.ttf")
    const fontBytes = await fs.readFileSync(path.join(__dirname + '../../') + "font/times-new-roman-14.ttf");
    // Vẽ ô và đường viền cho từng ô trong bảng
    let x = tableX;
    for (let i = 0; i < numRows; i++) {
      const y = tableY - i * cellHeight; // Vị trí hàng

      for (let j = 0; j < tableData[i].length; j++) {
        const cellWidth = cellWidths[j];
        const content = tableData[i][j];
        const align = j < 3 ? 'center' : 'right';

        page.drawRectangle({
          x,
          y,
          width: cellWidth,
          height: cellHeight,
          borderColor: rgb(0, 0.749, 1),
          borderWidth: 1,
        });
      
        const font = await pdfDoc.embedFont(fontBytes);
        const textSize = font.widthOfTextAtSize(content, 10);
        const textX = x + (cellWidth - textSize) / 2;
        const textY = y + (cellHeight - 10) / 2;

        page.drawText(content, {
          x: textX,
          y: textY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
          align: 'center',
          lineHeight: 10,
        });

        x += cellWidth;
      }

      x = tableX;
    }

    // Merge ô cho hàng cuối cùng
    const lastRowY = tableY - (numRows) * cellHeight;
    const mergedCellWidth = cellWidths.slice(0, 3).reduce((a, b) => a + b, 0);
    page.drawRectangle({
      x: tableX,
      y: lastRowY,
      width: mergedCellWidth,
      height: cellHeight,
      borderColor: rgb(0, 0.749, 1),
      borderWidth: 1,
    });

    // Merge ô cho hàng cuối cùng
    page.drawRectangle({
      x: tableX + cellWidths.slice(0, 3).reduce((a, b) => a + b, 0),
      y: lastRowY,
      width: cellWidths[3],
      height: cellHeight,
      borderColor: rgb(0, 0.749, 1),
      borderWidth: 1,
    });

    // Merge ô cho hàng cuối cùng
    page.drawRectangle({
      x: tableX + cellWidths.slice(0, 4).reduce((a, b) => a + b, 0) ,
      y: lastRowY,
      width: cellWidths[4],
      height: cellHeight,
      borderColor: rgb(0, 0.749, 1),
      borderWidth: 1,
    });

    const mergedContent = 'Tổng';
    const font = await pdfDoc.embedFont(fontBytes);
    const textSize = font.widthOfTextAtSize(mergedContent, 10);
    const textX = tableX + (mergedCellWidth - textSize) / 2;
    const textY = lastRowY + (cellHeight - 10) / 2;

    page.drawText(mergedContent, {
      x: textX,
      y: textY,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
      align: 'center',
      lineHeight: 10,
    });

    // Lưu file PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('table.pdf', pdfBytes);
  } catch (e) {
    console.log('check err', e)
  }

}
module.exports = {
  generatePDF
}