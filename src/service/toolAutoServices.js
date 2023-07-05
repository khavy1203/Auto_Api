require("dotenv").config();
const fs = require('fs');
const path = require('path');
const moment = require('moment');
import constant from '../constant/constant';
const { PDFDocument, rgb, PDFStandardFont, UnicodeFonts } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit');
const { exec } = require('child_process');
const sql = require('mssql');

const generatePDF = async (MaDK, countStd, name, birthday, course, rank, tableData, totalTime, totalDistance, KQ) => {
    try {
        return await new Promise(async (rs, rj) => {
            // Tạo tài liệu PDF mới
            const pdfDoc = await PDFDocument.create();
            const imagePath = path.join(__dirname, '..', 'BAOCAO1', 'Anh_CD_Convert', `${MaDK}.png`);
            console.log("check imagePath", imagePath)
            // Chuyển đổi hình ảnh JP2 sang PNG bằng ImageMagick


            pdfDoc.registerFontkit(fontkit);
            const fontBytes = await fs.readFileSync(path.join(__dirname, '..', 'font', 'times-new-roman-14.ttf'));
            const fontBytesBold = await fs.readFileSync(path.join(__dirname, '..', 'font', 'SVNTimesNewRomanBold.ttf'));
            const fontByteItalic = await fs.readFileSync(path.join(__dirname, '..', 'font', 'SVNTimesNewRomanItalic.ttf'));


            // Nhúng hình ảnh vào PDFDocument
            const font = await pdfDoc.embedFont(fontBytes);
            const fontBold = await pdfDoc.embedFont(fontBytesBold);
            const fontItalic = await pdfDoc.embedFont(fontByteItalic);


            const currentDate = new Date();

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // Lưu ý: Tháng được đánh số từ 0 (0 - tháng 1, 1 - tháng 2, ...)
            const day = currentDate.getDate();


            pdfDoc.setTitle('DAT_PDF');
            pdfDoc.setAuthor('kha vy');


            // Tạo trang mới và đặt kích thước
            const pageWidth = 595.28; // Kích thước A4: 21cm
            const pageHeight = 841.89; // Kích thước A4: 29.7cm
            const pageMargin = 28.35; // Khoảng cách viền 1cm
            const cellWidths = constant.formDat.cellWidths.map((width) => width * 28.35); // Kích thước cột

            const fontSize = constant.formDat.fontSize;
            const fontPowerSize = constant.formDat.fontPowerSize;
            const textSpace = constant.formDat.textSpace;


            let currentPage = pdfDoc.addPage();



            let currentY;
            let currentX;
            let cellWidthCenter;
            //countPAGE
            currentPage.drawText(`${countStd}`, {
                x: pageWidth - 40,
                y: pageHeight - 30,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            //start name school
            currentX = pageMargin;
            currentY = pageHeight - pageMargin * 1.473;
            cellWidthCenter = 8.255 * 28.35;

            let textSize = font.widthOfTextAtSize(constant.formDat.nameSchool1, fontSize);
            let textX = currentX + (cellWidthCenter - textSize) / 2;
            let textY = currentY;

            currentPage.drawText(constant.formDat.nameSchool1, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            currentX = pageMargin;
            currentY = pageHeight - pageMargin * 1.473 - textSpace;

            textSize = font.widthOfTextAtSize(constant.formDat.nameSchool2, fontSize);
            textX = currentX + (cellWidthCenter - textSize) / 2;
            textY = currentY;

            currentPage.drawText(constant.formDat.nameSchool2, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            currentX = pageMargin;
            currentY = pageHeight - pageMargin * 1.473 - fontSize - textSpace;

            textSize = font.widthOfTextAtSize(constant.formDat.nameSchool2, fontSize);
            textX = currentX + (cellWidthCenter - textSize) / 2;
            textY = currentY;

            currentPage.drawText('_____________', {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });
            //end name school

            //start name country

            currentX = pageMargin * 10.5;
            currentY = pageHeight - pageMargin * 1.473;
            cellWidthCenter = 9 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.nameCountry1, fontSize);
            textX = currentX + (cellWidthCenter - textSize) / 2;
            textY = currentY;

            currentPage.drawText(constant.formDat.nameCountry1, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 10.5;
            currentY = pageHeight - pageMargin * 1.473 - textSpace;
            cellWidthCenter = 9 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.nameCountry2, fontSize);
            textX = currentX + (cellWidthCenter - textSize) / 2;
            textY = currentY;

            currentPage.drawText(constant.formDat.nameCountry2, {
                x: textX,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 10.5;
            currentY = pageHeight - pageMargin - textSpace * 2;
            cellWidthCenter = 9 * 28.35;

            textSize = fontBold.widthOfTextAtSize('___________________', fontSize);
            textX = currentX + (cellWidthCenter - textSize) / 2;
            textY = currentY;

            currentPage.drawText('__________________', {
                x: textX,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 10.5;
            currentY = pageHeight - pageMargin - textSpace * 4;
            cellWidthCenter = 9 * 28.35;

            textSize = fontItalic.widthOfTextAtSize(`Bình Định, Ngày ${day} tháng ${month} năm ${year} `, fontSize);
            textX = currentX + (cellWidthCenter - textSize) / 2;
            textY = currentY;

            currentPage.drawText(`Bình Định, Ngày ${day} tháng ${month} năm ${year} `, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontItalic,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            //title
            currentX = pageMargin * 2.85;
            currentY = pageHeight - pageMargin - textSpace * 6;
            cellWidthCenter = 16 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.titlePDF1, fontSize);
            textX = currentX + (cellWidthCenter - textSize) / 2;
            textY = currentY;

            currentPage.drawText(constant.formDat.titlePDF1, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 2.85;
            currentY = pageHeight - pageMargin - textSpace * 7;
            cellWidthCenter = 16 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.titlePDF2, fontSize);
            textX = currentX + (cellWidthCenter - textSize) / 2;
            textY = currentY;

            currentPage.drawText(constant.formDat.titlePDF2, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });



            if (fs.existsSync(imagePath)) {
                const pngBuffer = await fs.readFileSync(imagePath);
                console.log("check imageContent, ", pngBuffer)
                //image
                const pngImage = await pdfDoc.embedPng(pngBuffer);
                // Vẽ hình ảnh trên trang
                currentPage.drawImage(pngImage, {
                    x: 15 * 28.35, // Vị trí x của hình ảnh
                    y: pageHeight - pageMargin - textSpace * 14, // Vị trí y của hình ảnh
                    width: 4.5 * 28.35, // Chiều rộng của hình ảnh
                    height: 3.85 * 28.35, // Chiều cao của hình ảnh
                });
            }

            //inf user


            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 9;
            cellWidthCenter = 13 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.infStudentI, fontSize - 1);
            textX = currentX;
            textY = currentY;

            currentPage.drawText(constant.formDat.infStudentI, {
                x: textX,
                y: textY,
                size: fontSize - 1,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 10;
            cellWidthCenter = 13 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.infStudent1, fontSize);
            textX = currentX;
            textY = currentY;

            currentPage.drawText(constant.formDat.infStudent1, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            textX = currentX * 2.5;

            currentPage.drawText(`${name}`, {
                x: textX,
                y: textY,
                size: fontSize - 1,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 11;
            cellWidthCenter = 13 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.infStudent2, fontSize);
            textX = currentX;
            textY = currentY;

            currentPage.drawText(constant.formDat.infStudent2, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            textX = currentX * 2.5;

            currentPage.drawText(`${MaDK}`, {
                x: textX,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 12;
            cellWidthCenter = 13 * 28.35;
            textSize = fontBold.widthOfTextAtSize(constant.formDat.infStudent3, fontSize);
            textX = currentX;
            textY = currentY;

            currentPage.drawText(constant.formDat.infStudent3, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            textX = currentX * 2.5;

            currentPage.drawText(`${birthday}`, {
                x: textX,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 13;
            cellWidthCenter = 13 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.infStudent4, fontSize);
            textX = currentX;
            textY = currentY;

            currentPage.drawText(constant.formDat.infStudent4, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            textX = currentX * 2.5;

            currentPage.drawText(`${course}`, {
                x: textX,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 14;
            cellWidthCenter = 13 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.infStudent5, fontSize);
            textX = currentX;
            textY = currentY;

            currentPage.drawText(constant.formDat.infStudent5, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            textX = currentX * 2.5;

            currentPage.drawText(`${rank}`, {
                x: textX,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 15;
            cellWidthCenter = 13 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.infStudent6, fontSize);
            textX = currentX;
            textY = currentY;

            currentPage.drawText(constant.formDat.infStudent6, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            textX = currentX * 2.5;

            currentPage.drawText(`Trường CĐ Cơ điện - Xây dựng - Nông Lâm Trung bộ`, {
                x: textX,
                y: textY,
                size: fontSize,
                font: font,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });

            //ttdt
            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 16;
            cellWidthCenter = 13 * 28.35;

            textSize = fontBold.widthOfTextAtSize(constant.formDat.infStudentII, fontSize);
            textX = currentX;
            textY = currentY;

            currentPage.drawText(constant.formDat.infStudentII, {
                x: textX,
                y: textY,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'left',
                lineHeight: fontSize,
            });


            // Dữ liệu của bảng
            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 17.5;
            // let tableData = [
            //   ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
            //   ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
            // ];
            tableData.unshift(constant.formDat.nameHeader)

            // Vẽ ô và đường viền cho từng ô trong bảng
            for (let i = 0; i <= tableData.length; i++) {
                const rowData = tableData[i];
                const rowHeight = 25 + 4; // Chiều cao mỗi hàng là 10 (có thể điều chỉnh) + khoảng cách giữa hàng (ở đây là 2)
                // Kiểm tra xem có đủ không gian trên trang hiện tại để vẽ hàng mới hay không
                if (currentY - rowHeight < pageMargin * 2.6) {
                    currentPage = pdfDoc.addPage();
                    //countPAGE
                    currentPage.drawText(`${countStd}`, {
                        x: pageWidth - 40,
                        y: pageHeight - 30,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });
                    currentY = pageHeight - pageMargin * 2.3; // Reset vị trí y về đầu trang mới
                }
                if (i == tableData.length) {
                    // Merge ô cho hàng gần cuối cùng
                    let mergedCellWidth = cellWidths.slice(0, 3).reduce((a, b) => a + b, 0);
                    currentPage.drawRectangle({
                        x: currentX,
                        y: currentY - rowHeight,
                        width: mergedCellWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0.749, 1),
                        borderWidth: 1,
                    });


                    let textX = currentX + 2.5;
                    let textY = currentY - rowHeight + fontSize / 2;

                    currentPage.drawText(constant.formDat.timeLearnStd, {
                        x: textX,
                        y: textY,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });

                    for (let k = 0; k < 2; k++)// Merge ô cho hàng gần cuối cùng
                    {
                        currentPage.drawRectangle({
                            x: currentX + cellWidths.slice(0, 3 + k).reduce((a, b) => a + b, 0),
                            y: currentY - rowHeight,
                            width: cellWidths[3 + k],
                            height: rowHeight,
                            borderColor: rgb(0, 0.749, 1),
                            borderWidth: 1,
                        });

                        let contentTG = '';

                        const hours = Math.floor(totalTime); // Lấy phần nguyên (giờ)
                        const minutes = Math.round((totalTime - hours) * 60); // Lấy phần thập phân, chuyển đổi thành phút

                        k == 0 ? contentTG = `${hours}h${minutes}` : contentTG = `${totalDistance.toFixed(2)} km`;;

                        textSize = font.widthOfTextAtSize(contentTG, fontSize);
                        textX = currentX + cellWidths.slice(0, 3 + k).reduce((a, b) => a + b, 0) + cellWidths[3 + k] / 2 - textSize / 2;
                        textY = currentY - rowHeight + fontSize / 2;

                        currentPage.drawText(contentTG, {
                            x: textX,
                            y: textY,
                            size: fontSize,
                            font: fontBold,
                            color: rgb(0, 0, 0),
                            align: 'center',
                            lineHeight: fontSize,
                        });

                    }

                    // Merge ô cho hàng gần cuối cùng
                    mergedCellWidth = cellWidths.slice(0, 4).reduce((a, b) => a + b, 0);
                    currentPage.drawRectangle({
                        x: currentX,
                        y: currentY - rowHeight * 2,
                        width: mergedCellWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0.749, 1),
                        borderWidth: 1,
                    });

                    textX = currentX + 2.5;
                    textY = currentY - rowHeight * 2 + fontSize / 2;

                    currentPage.drawText(constant.formDat.ifLearStd, {
                        x: textX,
                        y: textY,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });

                    currentPage.drawRectangle({
                        x: currentX + cellWidths.slice(0, 4).reduce((a, b) => a + b, 0),
                        y: currentY - rowHeight * 2,
                        width: cellWidths[4],
                        height: rowHeight,
                        borderColor: rgb(0, 0.749, 1),
                        borderWidth: 1,
                    });

                    let contentDK = `${KQ}`
                    textSize = font.widthOfTextAtSize(contentDK, fontSize);
                    textX = currentX + cellWidths.slice(0, 4).reduce((a, b) => a + b, 0) + cellWidths[4] / 2 - textSize / 2;
                    textY = currentY - rowHeight * 2 + fontSize / 2;

                    currentPage.drawText(contentDK, {
                        x: textX,
                        y: textY,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });

                    if (currentY - rowHeight * 2 + fontSize / 2 - 2 * textSpace - rowHeight < pageMargin * 2.6) {
                        currentPage = pdfDoc.addPage();
                        //countPAGE
                        currentPage.drawText(`${countStd}`, {
                            x: pageWidth - 40,
                            y: pageHeight - 30,
                            size: fontSize,
                            font: fontBold,
                            color: rgb(0, 0, 0),
                            align: 'center',
                            lineHeight: fontSize,
                        });
                        currentY = pageHeight - pageMargin * 2.3; // Reset vị trí y về đầu trang mới
                    }

                    //sign
                    textSize = fontBold.widthOfTextAtSize(constant.formDat.confirmStd, fontSize);

                    currentPage.drawText(constant.formDat.confirmStd, {
                        x: 2.5 * 28.5,
                        y: currentY - rowHeight * 2 + fontSize / 2 - 2 * textSpace,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });

                    //sign
                    let nameStudent = `${name}`;
                    textSize = fontBold.widthOfTextAtSize(nameStudent, fontSize);

                    currentPage.drawText(nameStudent, {
                        x: 5 * 28.5 - textSize / 2 + fontSize / 4,
                        y: currentY - rowHeight * 6 + fontSize / 2,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });


                    currentPage.drawText(constant.formDat.confirmSchool, {
                        x: 11.2 * 28.5,
                        y: textY = currentY - rowHeight * 2 + fontSize / 2 - 2 * textSpace,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });


                }
                else {
                    for (let j = 0; j < rowData.length; j++) {
                        const content = rowData[j];
                        const cellWidth = cellWidths[j];
                        const cellHeight = rowHeight;

                        let x = currentX + cellWidths.slice(0, j).reduce((a, b) => a + b, 0);
                        let y = currentY - cellHeight;

                        currentPage.drawRectangle({
                            x,
                            y,
                            width: cellWidth,
                            height: cellHeight,
                            borderColor: rgb(0, 0.749, 1),
                            borderWidth: 1,
                            fillColor: j == 0 || i == 0 ? "#bdb3bc" : null
                        });

                        const textSize = font.widthOfTextAtSize(`${content}`, fontSize);
                        const textX = x + (cellWidth - textSize) / 2;
                        const textY = y + (cellHeight - fontSize) / 2;
                        currentPage.drawText(`${content}`, {
                            x: textX,
                            y: textY,
                            size: fontSize,
                            font: j == 0 || i == 0 ? fontBold : font,
                            color: rgb(0, 0, 0),
                            align: 'center',
                            lineHeight: fontSize - 2,
                        });
                    }

                }

                currentY -= rowHeight; // Giảm vị trí y để vẽ hàng tiếp theo
            }

            // Lưu file PDF
            const pdfBytes = await pdfDoc.save();
            const pathWrite = path.join(__dirname, '..', 'filesPDF', 'inDat', `${MaDK}.pdf`);
            await fs.writeFileSync(pathWrite, pdfBytes);
            if (fs.existsSync(pathWrite)) {
                rs(pathWrite);
            }
            else {
                rj();
            }
        })

    } catch (e) {
        console.log('check err', e)
    }

}

const getAllPhienHoc = async (mhv) => {
    let connection;
    try {
        // Kết nối tới SQL Server
        connection = await sql.connect(constant.config);
        console.log('Connected to SQL Server');

        // Tạo một request để thực hiện truy vấn
        const request = new sql.Request();
        let optionQuery = `MaDK = '${mhv}'`;

        // Truy vấn dữ liệu
        console.log('check option', optionQuery)
        const result = await request.query(`
        select 
        CONCAT(CONCAT(DATEPART(HOUR, ThoiDiemDangNhap), ':', DATEPART(MINUTE, ThoiDiemDangNhap)) ,'-',CONCAT(DATEPART(HOUR, ThoiDiemDangXuat), ':', DATEPART(MINUTE, ThoiDiemDangXuat))) as TimeDaoTao,
        FORMAT(ThoiDiemDangNhap, 'dd/MM/yyyy') AS DateDaotao,
        CAST( dbo.GetEcoString(TongThoiGian) AS float)/3600  as TongThoiGian, 
        dbo.GetEcoString(TongQuangDuong) as TongQuangDuong
        from HanhTrinhTuEtm where ${optionQuery}
			`);

        // Xử lý kết quả truy vấn tại đây
        // Đóng kết nối
        if (connection) {
            try {
                await connection.close();
                return ({
                    EM: "Truy vấn thành công",
                    EC: 0,
                    DT: result.recordset,
                })
            } catch (err) {
                return ({
                    EM: "Truy vấn thất bại",
                    EC: 1,
                    DT: [],
                })
            }
        }

    } catch (err) {
        console.log('check err', err)
        return ({
            EM: "Truy vấn thất bại",
            EC: -1,
            DT: [],
        })
    }
}

const inMauTheoDoiThietBi = async(name,data) => {
    try {
        return await new Promise(async (rs, rj) => {
            // Tạo tài liệu PDF mới
            const pdfDoc = await PDFDocument.create();
            const imagePath = path.join(__dirname, '..', 'BAOCAO1', 'Anh_CD_Convert', `${MaDK}.png`);
            console.log("check imagePath", imagePath)
            // Chuyển đổi hình ảnh JP2 sang PNG bằng ImageMagick


            pdfDoc.registerFontkit(fontkit);
            const fontBytes = await fs.readFileSync(path.join(__dirname, '..', 'font', 'times-new-roman-14.ttf'));
            const fontBytesBold = await fs.readFileSync(path.join(__dirname, '..', 'font', 'SVNTimesNewRomanBold.ttf'));
            const fontByteItalic = await fs.readFileSync(path.join(__dirname, '..', 'font', 'SVNTimesNewRomanItalic.ttf'));


            // Nhúng hình ảnh vào PDFDocument
            const font = await pdfDoc.embedFont(fontBytes);
            const fontBold = await pdfDoc.embedFont(fontBytesBold);
            const fontItalic = await pdfDoc.embedFont(fontByteItalic);


            const currentDate = new Date();

            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1; // Lưu ý: Tháng được đánh số từ 0 (0 - tháng 1, 1 - tháng 2, ...)
            const day = currentDate.getDate();


            pdfDoc.setTitle('TIMERUNCARONPICTURE_PDF');
            pdfDoc.setAuthor('kha vy');


            // Tạo trang mới và đặt kích thước
            const pageWidth = 595.28; // Kích thước A4: 21cm
            const pageHeight = 841.89; // Kích thước A4: 29.7cm
            const pageMargin = 28.35; // Khoảng cách viền 1cm
            const cellWidths = constant.formDat.cellWidths.map((width) => width * 28.35); // Kích thước cột

            const fontSize = constant.formDat.fontSize;
            const fontPowerSize = constant.formDat.fontPowerSize;
            const textSpace = constant.formDat.textSpace;


            let currentPage = pdfDoc.addPage();



            let currentY;
            let currentX;
            let cellWidthCenter;
            //countPAGE
            currentPage.drawText(`${countStd}`, {
                x: pageWidth - 40,
                y: pageHeight - 30,
                size: fontSize,
                font: fontBold,
                color: rgb(0, 0, 0),
                align: 'center',
                lineHeight: fontSize,
            });

            //start name school
            currentX = pageMargin;
            currentY = pageHeight - pageMargin * 1.473;
            cellWidthCenter = 8.255 * 28.35;

            // Dữ liệu của bảng
            currentX = pageMargin * 2.5;
            currentY = pageHeight - pageMargin - textSpace * 17.5;
            // let tableData = [
            //   ['Cell 1', 'Cell 2', 'Cell 3', 'Cell 4', 'Cell 5'],
            //   ['Cell 6', 'Cell 7', 'Cell 8', 'Cell 9', 'Cell 10'],
            // ];
            tableData.unshift(constant.formDat.nameHeader)

            // Vẽ ô và đường viền cho từng ô trong bảng
            for (let i = 0; i <= tableData.length; i++) {
                const rowData = tableData[i];
                const rowHeight = 25 + 4; // Chiều cao mỗi hàng là 10 (có thể điều chỉnh) + khoảng cách giữa hàng (ở đây là 2)
                // Kiểm tra xem có đủ không gian trên trang hiện tại để vẽ hàng mới hay không
                if (currentY - rowHeight < pageMargin * 2.6) {
                    currentPage = pdfDoc.addPage();
                    //countPAGE
                    currentPage.drawText(`${countStd}`, {
                        x: pageWidth - 40,
                        y: pageHeight - 30,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });
                    currentY = pageHeight - pageMargin * 2.3; // Reset vị trí y về đầu trang mới
                }
                if (i == tableData.length) {
                    // Merge ô cho hàng gần cuối cùng
                    let mergedCellWidth = cellWidths.slice(0, 3).reduce((a, b) => a + b, 0);
                    currentPage.drawRectangle({
                        x: currentX,
                        y: currentY - rowHeight,
                        width: mergedCellWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0.749, 1),
                        borderWidth: 1,
                    });


                    let textX = currentX + 2.5;
                    let textY = currentY - rowHeight + fontSize / 2;

                    currentPage.drawText(constant.formDat.timeLearnStd, {
                        x: textX,
                        y: textY,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });

                    for (let k = 0; k < 2; k++)// Merge ô cho hàng gần cuối cùng
                    {
                        currentPage.drawRectangle({
                            x: currentX + cellWidths.slice(0, 3 + k).reduce((a, b) => a + b, 0),
                            y: currentY - rowHeight,
                            width: cellWidths[3 + k],
                            height: rowHeight,
                            borderColor: rgb(0, 0.749, 1),
                            borderWidth: 1,
                        });

                        let contentTG = '';

                        const hours = Math.floor(totalTime); // Lấy phần nguyên (giờ)
                        const minutes = Math.round((totalTime - hours) * 60); // Lấy phần thập phân, chuyển đổi thành phút

                        k == 0 ? contentTG = `${hours}h${minutes}` : contentTG = `${totalDistance.toFixed(2)} km`;;

                        textSize = font.widthOfTextAtSize(contentTG, fontSize);
                        textX = currentX + cellWidths.slice(0, 3 + k).reduce((a, b) => a + b, 0) + cellWidths[3 + k] / 2 - textSize / 2;
                        textY = currentY - rowHeight + fontSize / 2;

                        currentPage.drawText(contentTG, {
                            x: textX,
                            y: textY,
                            size: fontSize,
                            font: fontBold,
                            color: rgb(0, 0, 0),
                            align: 'center',
                            lineHeight: fontSize,
                        });

                    }

                    // Merge ô cho hàng gần cuối cùng
                    mergedCellWidth = cellWidths.slice(0, 4).reduce((a, b) => a + b, 0);
                    currentPage.drawRectangle({
                        x: currentX,
                        y: currentY - rowHeight * 2,
                        width: mergedCellWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0.749, 1),
                        borderWidth: 1,
                    });

                    textX = currentX + 2.5;
                    textY = currentY - rowHeight * 2 + fontSize / 2;

                    currentPage.drawText(constant.formDat.ifLearStd, {
                        x: textX,
                        y: textY,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });

                    currentPage.drawRectangle({
                        x: currentX + cellWidths.slice(0, 4).reduce((a, b) => a + b, 0),
                        y: currentY - rowHeight * 2,
                        width: cellWidths[4],
                        height: rowHeight,
                        borderColor: rgb(0, 0.749, 1),
                        borderWidth: 1,
                    });

                    let contentDK = `${KQ}`
                    textSize = font.widthOfTextAtSize(contentDK, fontSize);
                    textX = currentX + cellWidths.slice(0, 4).reduce((a, b) => a + b, 0) + cellWidths[4] / 2 - textSize / 2;
                    textY = currentY - rowHeight * 2 + fontSize / 2;

                    currentPage.drawText(contentDK, {
                        x: textX,
                        y: textY,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });

                    if (currentY - rowHeight * 2 + fontSize / 2 - 2 * textSpace - rowHeight < pageMargin * 2.6) {
                        currentPage = pdfDoc.addPage();
                        //countPAGE
                        currentPage.drawText(`${countStd}`, {
                            x: pageWidth - 40,
                            y: pageHeight - 30,
                            size: fontSize,
                            font: fontBold,
                            color: rgb(0, 0, 0),
                            align: 'center',
                            lineHeight: fontSize,
                        });
                        currentY = pageHeight - pageMargin * 2.3; // Reset vị trí y về đầu trang mới
                    }

                    //sign
                    textSize = fontBold.widthOfTextAtSize(constant.formDat.confirmStd, fontSize);

                    currentPage.drawText(constant.formDat.confirmStd, {
                        x: 2.5 * 28.5,
                        y: currentY - rowHeight * 2 + fontSize / 2 - 2 * textSpace,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });

                    //sign
                    let nameStudent = `${name}`;
                    textSize = fontBold.widthOfTextAtSize(nameStudent, fontSize);

                    currentPage.drawText(nameStudent, {
                        x: 5 * 28.5 - textSize / 2 + fontSize / 4,
                        y: currentY - rowHeight * 6 + fontSize / 2,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });


                    currentPage.drawText(constant.formDat.confirmSchool, {
                        x: 11.2 * 28.5,
                        y: textY = currentY - rowHeight * 2 + fontSize / 2 - 2 * textSpace,
                        size: fontSize,
                        font: fontBold,
                        color: rgb(0, 0, 0),
                        align: 'center',
                        lineHeight: fontSize,
                    });


                }
                else {
                    for (let j = 0; j < rowData.length; j++) {
                        const content = rowData[j];
                        const cellWidth = cellWidths[j];
                        const cellHeight = rowHeight;

                        let x = currentX + cellWidths.slice(0, j).reduce((a, b) => a + b, 0);
                        let y = currentY - cellHeight;

                        currentPage.drawRectangle({
                            x,
                            y,
                            width: cellWidth,
                            height: cellHeight,
                            borderColor: rgb(0, 0.749, 1),
                            borderWidth: 1,
                            fillColor: j == 0 || i == 0 ? "#bdb3bc" : null
                        });

                        const textSize = font.widthOfTextAtSize(`${content}`, fontSize);
                        const textX = x + (cellWidth - textSize) / 2;
                        const textY = y + (cellHeight - fontSize) / 2;
                        currentPage.drawText(`${content}`, {
                            x: textX,
                            y: textY,
                            size: fontSize,
                            font: j == 0 || i == 0 ? fontBold : font,
                            color: rgb(0, 0, 0),
                            align: 'center',
                            lineHeight: fontSize - 2,
                        });
                    }

                }

                currentY -= rowHeight; // Giảm vị trí y để vẽ hàng tiếp theo
            }

            // Lưu file PDF
            const pdfBytes = await pdfDoc.save();
            const pathWrite = path.join(__dirname, '..', 'filesPDF', 'inDat', `${MaDK}.pdf`);
            await fs.writeFileSync(pathWrite, pdfBytes);
            if (fs.existsSync(pathWrite)) {
                rs(pathWrite);
            }
            else {
                rj();
            }
        })

    } catch (e) {
        console.log('check err', e)
    }
}

module.exports = {
    generatePDF,
    getAllPhienHoc,
    inMauTheoDoiThietBi
}