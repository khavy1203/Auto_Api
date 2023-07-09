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
						const outputFormat = 'DD/MM/YYYY HH[h]mm[p]';
						for (const e of res.DT) {
							const {
								MaDK, HoTen, NgaySinh, SoCMT, HangDaoTao, MaKhoaHoc, IsSend, TenKhoaHoc, TongQuangDuong, TongThoiGian, TongThoiGianBanDem, TongThoiGianChayXeTuDong, TongThoiGianTrong24h, ThoiDiemReset
							} = e;
							const ngaysinhFm = moment(NgaySinh).utcOffset('+0000').format('DD/MM/YYYY')
							const moreTime = await nltbLocalController.checkTime(HangDaoTao, TongThoiGian);
							const moreDistance = await nltbLocalController.checkDistance(HangDaoTao, TongQuangDuong);
							const moreTimeNight = await nltbLocalController.checkTimeNight(HangDaoTao, TongThoiGianBanDem);
							const moreRunOnAutoCar = await nltbLocalController.checkRunOnAutoCar(HangDaoTao, TongThoiGianChayXeTuDong)
							const moreTimePass10h = await nltbLocalController.checkHourPass10h(TongThoiGianTrong24h)
							const print = await toolAutoServices.generatePDF(MaDK, e[1] ? e[1] : count, HoTen,ngaysinhFm, MaKhoaHoc[0], HangDaoTao, tableData, TongThoiGian, TongQuangDuong, moreTime != null || moreDistance != null ? "Không Đạt" : "Đạt")
							const printCommand = `"C:\\Users\\KHA VY\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe" -print-to-default -print-settings "duplex,long-edge" "${print}"`
							if (print) {
								// const printPromise = new Promise((rs, rj) => {
								// 	exec(printCommand, (error, stdout, stderr) => {
								// 		if (error) {
								// 			console.error('Lỗi khi in file:', error);
								// 			rj(error);
								// 			res.status(200).json({
								// 				EM: "Lỗi khi in file, vui lòng tiếp tục in lại ...",
								// 				EC: 1,
								// 				DT: countStd,
								// 			});
								// 		}
								// 		console.log('File PDF đã được in thành công.');
								// 		rs();
								// 	});
								// })
								// await printPromise;
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


function traverseDirectories(dir, outputDir, MaDK) {
	// Đọc nội dung của thư mục
	const files = fs.readdirSync(dir);

	// Duyệt qua từng tệp và thư mục trong thư mục hiện tại
	files.forEach(file => {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		if (stat.isFile()) {
			// Kiểm tra nếu tệp có phần mở rộng .jp2
			if (path.extname(file) === '.jp2') {
				const fileName = path.parse(filePath).name;
				if (fileName == MaDK) {
					console.log('Tìm thấy tệp JP2:', filePath);
					const command = `magick "${filePath}" "${outputDir}\\${fileName}.png"`;
					exec(command, (error, stdout, stderr) => {
						if (error) {
							console.error('Lỗi chuyển đổi hình ảnh:', error);
							return;
						}

						console.log('Đã chuyển đổi thành công!');
					});
				}
			}
		} else if (stat.isDirectory()) {
			// Nếu là thư mục, tiếp tục duyệt đệ quy vào thư mục con
			traverseDirectories(filePath, outputDir, MaDK);
		}
	});

}

async function searchFile(dir, outputDir, fileName) {
	const searchPattern = `${dir}/**/*${fileName}`;
	// const searchPattern = path.join(dir, '**', fileName);
	console.log("check searchPattern", searchPattern)
	const files = await fg(searchPattern);
	if (files.length === 0) {
		console.log(`Không tìm thấy file ${fileName} trong thư mục ${dir} và các thư mục con.`);
		return;
	}
	console.log(`Tìm thấy ${files.length} file có tên ${fileName}:`);
	files.forEach((file) => {
		const filePath = path.dirname(file);
		console.log(filePath);
		console.log('Tìm thấy tệp JP2:', filePath);
		if (path.extname(file) === '.jp2') {
			const command = `magick "${filePath}" "${outputDir}\\${fileName}.png"`;
			exec(command, (error, stdout, stderr) => {
				if (error) {
					console.error('Lỗi chuyển đổi hình ảnh:', error);
					return;
				}

				console.log('Đã chuyển đổi thành công!');
			});
		}

	});
}

const convertJP2 = async (req, res) => {
	// const inputDir = path.join(__dirname, '..', 'BAOCAO1', 'Anh_CD');
	const inputDirs = ['T:\\My Drive\\DATA_GPLX\\AnhCD', 'T:\\My Drive\\DATA_GPLX\\AnhCD 11042023']

	const outputDir = path.join(__dirname, '..', 'BAOCAO1', 'Anh_CD_CONVERT');

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
		// Thực hiện fetch

		for (const row of rows) {
			console.log("check row", row)
			if (row[0]) {
				let result = row[0];
				console.log("check result", result)
				if (result != null) {
					inputDirs.map(async e => await searchFile(e, outputDir, `${result}`));
				}
			}
		};
		return res.status(200).json({
			EM: "Lấy hình ảnh thành công", //error message
			EC: 0, //error code
			DT: "",
		});
	} catch (e) {
		console.log("check e", e)
		return res.status(500).json({
			EM: "error from sever", //error message
			EC: "-1", //error code
			DT: "",
		});
	}
}


const inMauTheoDoiThietBi = async (req, res) => {
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
							const print = await toolAutoServices.inMauTheoDoiThietBi();
							const printCommand = `"C:\\Users\\KHA VY\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe" -print-to-default -print-settings "duplex,long-edge" "${print}"`
							if (print) {
								const printPromise = new Promise((rs, rj) => {
									exec(printCommand, (error, stdout, stderr) => {
										if (error) {
											console.error('Lỗi khi in file:', error);
											rj(error);
											res.status(200).json({
												EM: "Lỗi khi in file, vui lòng tiếp tục in lại ...",
												EC: 1,
												DT: countStd,
											});
										}
										console.log('File PDF đã được in thành công.');
										rs();
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

const generateCaptcha = async (req, res) => {

	try {
		const testcp = await toolAutoServices.generateCaptcha();
		return res.status(200).json({
			EM: "Lấy hình ảnh thành công", //error message
			EC: 0, //error code
			DT: "",
		});
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
	generateImageBaoCao1,
	queryFetchStudentOnDatabaseOnMKH,
	queryFetchStudentOnDatabaseOnMHV,
	indat,
	convertJP2,
	inMauTheoDoiThietBi,
	generateCaptcha
}