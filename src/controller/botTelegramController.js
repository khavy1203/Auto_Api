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
import net from 'net';
import FtpGet from 'ftp-get';

// Hàm tạo form và xuất ra file PDF
const generatePDF = async (name) => {
  try {
    // Tạo tài liệu PDF mới
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);
    const fontBytes = await fs.readFileSync(path.join(__dirname, '..', 'font', 'times-new-roman-14.ttf'));
    
    pdfDoc.setTitle('Table PDF');
    pdfDoc.setAuthor('Your Name');

    // Tạo trang mới và đặt kích thước
    const pageWidth = 595.28; // Kích thước A4: 21cm
    const pageHeight = 841.89; // Kích thước A4: 29.7cm
    const pageMargin = 28.35; // Khoảng cách viền 1cm
    const cellWidths = [2, 4, 4, 3, 3].map((width) => width * 28.35); // Kích thước cột

    
    let currentPage = pdfDoc.addPage();
    let currentY ;
    let currentX ; 
    currentY = pageHeight - pageMargin * 1.473;
    currentX = pageMargin * 2.5;

    

    currentPage.drawText(mergedContent, {
      x: textX,
      y: textY,
      size: 10,
      font: font,
      color: rgb(0, 0, 0),
      align: 'center',
      lineHeight: 10,
    });


    currentY = pageHeight - pageMargin * 10.5; // Vị trí y của hàng hiện tại
    currentX = pageMargin * 2.5;

    
    // Dữ liệu của bảng
    const tableData = [
      ['HEADER1', 'HEADER2', 'HEADER3', 'HEADER4', 'HEADER5'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
      ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
      ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],

      // Thêm các hàng dữ liệu khác tại đây...
    ];

    // Vẽ ô và đường viền cho từng ô trong bảng
    for (let i = 0; i <= tableData.length; i++) {
      const rowData = tableData[i];
      const rowHeight = 25 + 2; // Chiều cao mỗi hàng là 10 (có thể điều chỉnh) + khoảng cách giữa hàng (ở đây là 2)
      // Kiểm tra xem có đủ không gian trên trang hiện tại để vẽ hàng mới hay không
      if (currentY - rowHeight < pageMargin * 2.6) {
        currentPage = pdfDoc.addPage();
        currentY = pageHeight - pageMargin * 2.3; // Reset vị trí y về đầu trang mới
      }
      if (i == tableData.length) {
        // Merge ô cho hàng cuối cùng
        const mergedCellWidth = cellWidths.slice(0, 3).reduce((a, b) => a + b, 0);
        currentPage.drawRectangle({
          x: currentX,
          y: currentY - rowHeight,
          width: mergedCellWidth,
          height: rowHeight,
          borderColor: rgb(0, 0.749, 1),
          borderWidth: 1,
        });

        for( let k = 0; k < 2; k++)// Merge ô cho hàng cuối cùng
        {
          currentPage.drawRectangle({
            x: currentX + cellWidths.slice(0,3+k).reduce((a, b) => a + b, 0),
            y: currentY - rowHeight,
            width: cellWidths[3+k],
            height: rowHeight,
            borderColor: rgb(0, 0.749, 1),
            borderWidth: 1,
          });
        }
       

        const mergedContent = 'Tổng';
        const font = await pdfDoc.embedFont(fontBytes);
        const textSize = font.widthOfTextAtSize(mergedContent, 10);
        const textX = currentX + (mergedCellWidth - textSize) / 2;
        const textY = currentY + (rowHeight - 10) / 2;

        currentPage.drawText(mergedContent, {
          x: textX,
          y: textY,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
          align: 'center',
          lineHeight: 10,
        });
      }
      else {
        for (let j = 0; j < rowData.length; j++) {
          const content = rowData[j];
          const cellWidth = cellWidths[j];
          const cellHeight = rowHeight;

          let x = currentX + cellWidths.slice(0, j).reduce((a, b) => a + b, 0);
          const y = currentY - cellHeight;

          currentPage.drawRectangle({
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

          currentPage.drawText(content, {
            x: textX,
            y: textY,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
            align: 'center',
            lineHeight: 10,
          });
        }

      }

      currentY -= rowHeight; // Giảm vị trí y để vẽ hàng tiếp theo
    }




    // Lưu file PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(`table.pdf`, pdfBytes);
  } catch (e) {
    console.log('check err', e)
  }

}
module.exports = {
  generatePDF
}