const PDFDocument = require('pdfkit');

// Hàm tạo form và xuất ra file PDF
const generatePDF = (data) => {
  const doc = new PDFDocument();

  // Tạo stream để ghi dữ liệu PDF vào
  const stream = fs.createWriteStream('output.pdf');

  doc.pipe(stream);

  // Tạo table header
  doc.font('Helvetica-Bold');
  doc.fontSize(12);
  doc.text('Column 1', { align: 'left' });
  doc.text('Column 2', { align: 'left' });
  doc.text('Column 3', { align: 'left' });

  // Tạo table body từ dữ liệu truyền vào
  doc.font('Helvetica');
  doc.fontSize(10);

  data.forEach((row, index) => {
    const { column1, column2, column3 } = row;
    doc.text(column1, { align: 'left' });
    doc.text(column2, { align: 'left' });
    doc.text(column3, { align: 'left' });

    // Xử lý xuống dòng sau mỗi hàng
    if (index < data.length - 1) {
      doc.moveDown();
    }
  });

  // Kết thúc và lưu file PDF
  doc.end();
};

module.exports = generatePDF;