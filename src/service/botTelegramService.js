const dotenv = require('dotenv');
const https = require('https');
const axios = require('axios');
require("dotenv").config();
const { PDFDocument, rgb, StandardFonts, degrees, PDFPage } = require('pdf-lib');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const apiTest = async (id) => {
	try {
		const user = await db.apiTest.findOne({ where: { id: id } });

		if (user) {
			await user.destroy();
			return {
				EM: " apiTest successfully",
				EC: "0",
				DT: [],
			};
		} else {
			return {
				EM: "No user find",
				EC: "1",
				DT: [],
			};
		}
	} catch (e) {
		console.log("error from service apiTest : >>>", e);
		return {
			EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
			EC: "-2",
			DT: "",
		};
	}
};

const getInfoStudent = async (token = null, name) => {
	try {
		return new Promise((resolve, reject) => {

			const yourBearToken = token ? token : process.env.tokenNLTB;

			const payload = {
				administrativeUnitId: 35,
				centerId: null,
				centerIdParam: null,
				driverLicenseLevelName: null,
				eventReloadName: null,
				fromDate: null,
				practiceResultId: null,
				providerId: null,
				qualifiedYn: null,
				timeFrom: null,
				timeTo: null,
				toDate: null,
				searchString: name
			}
			const params = new URLSearchParams();
			params.append('page', 0);
			params.append('size', 10);

			//1 nốt bay màu SSL =))
			let dataArr = [];
			const options = {
				hostname: process.env.hostnameNLTB,
				port: 443,
				path: '/api/student-results/search-report-qua-trinh-dao-tao?' + params.toString(),
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + yourBearToken
				},
				rejectUnauthorized: false // Set rejectUnauthorized to false
			};

			const req = https.request(options, (res) => {

				if (res.statusCode != 200) {
					reject({
						EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
						EC: -1,
						DT: [],
					});
				};
				// console.log(`statusCode: ${res.statusCode}`);
				const contentType = res.headers['content-type'];
				if (!/^application\/json/.test(contentType)) {
					console.log(`Invalid content type. Expected application/json but received ${contentType}`);
					reject({
						EM: "Invalid content type",
						EC: -3,
						DT: [],
					});
				}

				res.on('data', (d) => {
					//   let data = process.stdout.write(d);
					dataArr.push(d);
				});

				res.on('end', () => {
					let data = {};
					try {
						if (dataArr.length > 0) {
							let dataBuffer = Buffer.concat(dataArr);
							data = JSON.parse(dataBuffer.toString());
							console.log('check data: ' + data);
							data.forEach(obj => {
								for (let key in obj) {
									if (obj[key] == null || obj[key] == 0) delete obj[key];
								}
							})
						}
					} catch (e) {
						reject({
							EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
							EC: -2,
							DT: [],
						});
					}
					resolve({
						EM: "Get data successfully",
						EC: 0,
						DT: data,
					});
				});

			});

			req.on('error', (error) => {
				console.log("check error: " + error)
				reject({
					EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
					EC: -2,
					DT: []
				});
			});

			req.write(JSON.stringify(payload));
			req.end();
		});
	} catch (error) {
		reject({
			EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
			EC: -2,
			DT: [],
		});
	}

}

const getSessionStudent = async (token = null, name) => {
	try {
		return new Promise((resolve, reject) => {

			const yourBearToken = token ? token : process.env.tokenNLTB;
			const today = new Date();
			// Lấy ngày 15 ngày trước
			const before15Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
			// Format ngày dưới dạng ISO-8601
			const before15DaysIoString = before15Days.toISOString();
			const todayIsoString = today.toISOString();
			console.log("check todayIsoString", todayIsoString);
			console.log("check before15DaysIoString", before15DaysIoString);

			const payload = {
				administrativeUnitId: 35,
				centerId: 52001,
				courseTypeId: 0,
				driverLicenseLevelName: null,
				eventReloadName: null,
				fromDate: before15DaysIoString,
				keyword: null,
				processed: 1,
				providerId: 0,
				qualifiedYn: null,
				searchString: name,
				status: 1,
				timeFrom: before15DaysIoString,
				timeTo: todayIsoString,
				toDate: todayIsoString
			}
			const params = new URLSearchParams();
			params.append('page', 0);
			params.append('size', 10);

			//1 nốt bay màu SSL =))
			let dataArr = [];
			const options = {
				hostname: process.env.hostnameNLTB,
				port: 443,
				path: '/api/session-data/search-report-session-data-reports?' + params.toString(),
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + yourBearToken
				},
				rejectUnauthorized: false // Set rejectUnauthorized to false
			};

			const req = https.request(options, (res) => {
				// console.log(`statusCode: ${res.statusCode}`);

				if (res.statusCode != 200) {
					reject({
						EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
						EC: -1,
						DT: [],
					});
				};

				const contentType = res.headers['content-type'];
				if (!/^application\/json/.test(contentType)) {
					console.log(`Invalid content type. Expected application/json but received ${contentType}`);
					reject({
						EM: "Invalid content type",
						EC: -3,
						DT: [],
					});
				}

				res.on('data', (d) => {
					//   let data = process.stdout.write(d);
					dataArr.push(d);
				});

				res.on('end', () => {

					let data = {};
					try {
						if (dataArr.length > 0) {
							let dataBuffer = Buffer.concat(dataArr);
							data = JSON.parse(dataBuffer.toString());
							console.log('check data Phiên: ' + data);
							data.forEach(obj => {
								for (let key in obj) {
									if (obj[key] == null || obj[key] == 0) delete obj[key];
								}
							})
						}
					} catch (error) {
						reject({
							EM: "vui lòng thử lại sau ...",
							EC: -1,
							DT: [],
						});
					}

					resolve({
						EM: "Get data successfully",
						EC: 0,
						DT: data,
					});
				});

			});

			req.on('error', (error) => {
				console.log("check error Phien: " + error)
				reject({
					EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
					EC: -2,
					DT: "",
				});
			});

			req.write(JSON.stringify(payload));
			req.end();
		});
	} catch (error) {
		reject({
			EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
			EC: -2,
			DT: [],
		});
	}


}


const getTokenService = async () => {
	try {
		return new Promise((resolve, reject) => {
			const payload = {
				username: process.env.usernameNLTB,
				password: process.env.passwordNLTB,
				rememberMe: true,
				responseCaptcha: 'hTaTorNY145de0BdEfdhuA==',
				userCaptcha: '',
			}

			let dataArr = [];

			const options = {
				hostname: process.env.hostnameNLTB,
				port: 443,
				path: '/api/authenticate',
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Cookie': '_gid=GA1.3.587322599.1682866862; _gat_gtag_UA_235995231_1=1; _ga_XPNFBH5L32=GS1.1.1682866861.22.1.1682866900.0.0.0; _ga_KSJYQ8K5LK=GS1.1.1682866862.19.1.1682866900.0.0.0; _ga=GA1.3.790826531.1681994975'
				},
				rejectUnauthorized: false // Set rejectUnauthorized to false
			};

			const req = https.request(options, (res) => {
				console.log(`statusCode: ${res.statusCode}`);
				if (res.statusCode != 200) {
					reject({
						EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
						EC: -1,
						DT: [],
					});
				};

				const contentType = res.headers['content-type'];
				if (!/^application\/json/.test(contentType)) {
					console.log(`Invalid content type. Expected application/json but received ${contentType}`);
					reject({
						EM: "Invalid content type",
						EC: -3,
						DT: [],
					});
				}

				res.on('data', (d) => {
					dataArr.push(d);
				});

				res.on('end', () => {
					let data = [];
					try {
						if (dataArr.length > 0) {
							let dataBuffer = Buffer.concat(dataArr);
							data = JSON.parse(dataBuffer.toString());
						}
					} catch (error) {
						reject({
							EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
							EC: -1,
							DT: [],
						});
					}


					console.log("check data", data)
					resolve({
						EM: "Get data successfully",
						EC: 0,
						DT: data,
					});
				});

			});

			req.on('error', (error) => {
				console.log("check error: " + error)
				reject({
					EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
					EC: -2,
					DT: "",
				});
			});

			req.write(JSON.stringify(payload));
			req.end();
		});
	} catch (e) {
		reject({
			EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
			EC: -2,
			DT: [],
		});
	}

}

const checkTokenService = async (req, res) => {
	try {
		return new Promise((resolve, reject) => {
			dotenv.config();
			const yourBearToken = process.env.tokenNLTB;
			console.log("check process.env.tokenNLTB...................", process.env.tokenNLTB)
			let dataArr = [];

			const options = {
				hostname: process.env.hostnameNLTB,
				port: 443,
				path: '/api/centers/getListCenterByUser',
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': 'Bearer ' + yourBearToken
				},
				rejectUnauthorized: false // Set rejectUnauthorized to false
			};

			const req = https.request(options, (res) => {
				console.log(`statusCode: ${res.statusCode}`);
				console.log(`statusCode: ${res.statusCode}`);
				if (res.statusCode != 200) {
					resolve({
						EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
						EC: -1,
						DT: [],
					});
				};
				const contentType = res.headers['content-type'];
				if (!/^application\/json/.test(contentType)) {
					console.log(`Invalid content type. Expected application/json but received ${contentType}`);
					reject({
						EM: "Invalid content type",
						EC: -3,
						DT: [],
					});
				}
				res.on('data', (d) => {
					dataArr.push(d);
				});

				res.on('end', () => {
					let dataBuffer = [];
					let data = {};
					try {
						dataBuffer = Buffer.concat(dataArr);
						data = JSON.parse(dataBuffer.toString());
						console.log("check data", data)

					} catch (error) {
						reject({
							EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
							EC: -2,
							DT: "",
						});
					}

					resolve({
						EM: "Get data successfully",
						EC: 0,
						DT: data,
					});
				});

			});

			req.on('error', (error) => {
				console.log("check error: " + error)
				reject({
					EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
					EC: -2,
					DT: "",
				});
			});

			// req.write(JSON.stringify(payload));
			req.end();
		});
	} catch (e) {
		reject({
			EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
			EC: -2,
			DT: [],
		});
	}
}

const checkSession = async (tokenLocalNLTB = null, mhv) => {
	try {
		return new Promise((resolve, reject) => {

			const yourBearToken = tokenLocalNLTB ? tokenLocalNLTB : process.env.tokenLocalNLTB;
			const today = new Date();
			// Lấy ngày 15 ngày trước
			const todaySum2 = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
			const before15Days = new Date(todaySum2.getTime() - 37 * 24 * 60 * 60 * 1000);
			// Format ngày dưới dạng ISO-8601
			const before15DaysIoString = before15Days.toISOString();
			const todayIsoString = todaySum2.toISOString();
			console.log("check todayIsoString dưới local", todayIsoString);
			console.log("check before15DaysIoString dưới local", before15DaysIoString);

			const params = new URLSearchParams();
			params.append('ten', mhv?.trim());
			params.append('page', 1);
			params.append('limit', 10);
			console.log("check mhv", mhv)
			const getSessionStu = axios.create({
				headers: {
					'Authorization': `Bearer ${yourBearToken}`
				}
			})

			getSessionStu.get(process.env.hostnameLocal + '/api/HanhTrinh?' + params.toString())
				.then(async response => {
					if(response.status!=200){
						resolve ({
							EM: "Lỗi api vui lòng thử lại sau ...",
							EC: 2,
							DT: "",
						});
					}
					const dtLocal = response?.data?.Data;
					const filteredArrayNotUpdate = dtLocal.filter(obj => !obj.IsSend);
					if (filteredArrayNotUpdate.length > 0) {
						const payload = {
							"Data": filteredArrayNotUpdate,
							total_count: filteredArrayNotUpdate.length
						}
						await getSessionStu.post(process.env.hostnameLocal + '/api/HanhTrinh', payload)
							.then(response => {	
								console.log("check response cập nhật lại các phiên mất", response?.status)
								console.log("check response data cập nhật lại các phiên mất", response?.data)

								return response.status;
							})

						resolve ({
							EM: `<b>Hãy trao cho em huy chương 🏅 sau khi em đã tìm kiếm cật lực và phát hiện ra ${filteredArrayNotUpdate.length} phiên bị mất. 🐧🐧🐧</b> \n`,
							EC: 0,
							DT: filteredArrayNotUpdate,
						});
					} else {
						resolve ({
							EM: "<b>Rât vui là không có phiên nào bị mất. Nếu quý Thầy chắc chắn rằng mình chạy bị thiếu phiên thì chỉ có thể là dữ liệu chưa lên. Thầy vui lòng chạy ra xe mở máy DAT lên để máy tự động upload dữ liệu và Kiểm tra lại. Nếu kiểm tra vẫn không có thì chia buồn cùng thầy 🐧🐧🐧</b> \n",
							EC: 1,
							DT: [],
						});
					}
				})
				.catch(error => {
					reject({
						EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
						EC: -2,
						DT: "",
					});
					console.error(error);
				});


		});
	} catch (error) {
		return ({
			EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
			EC: -2,
			DT: [],
		});
	}
}

let listXe = [];

const inDat = async (tokenLocalNLTB = null, bienso, soThang = 1) => {
	try {
		return new Promise(async (resolve, reject) => {
			const yourBearToken = tokenLocalNLTB ? tokenLocalNLTB : process.env.tokenLocalNLTB;

			const getSessionStu = axios.create({
				baseURL: process.env.hostnameLocal,
				headers: {
					'Authorization': `Bearer ${yourBearToken}`
				},
			})

			if (!listXe?.length) {

				const res = await getSessionStu.get(`/api/xe`)
					.then(response => {
						console.log("check response", response.status)
						if (response.status != 200) {
							return ({
								EM: "Lỗi api ...",
								EC: 1,
								DT: "",
							});
						}
						if (response?.data?.total_count) {
							listXe = response?.data?.Data
							return ({
								EM: "Add Xe success",
								EC: 0,
								DT: "",
							});
						}
					})
					.catch(error => {
						console.log("check error", error)
						return ({
							EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
							EC: -2,
							DT: "",
						});
					});
				if (res.EC != 0) return res;
			}
			if (listXe.length > 0) {
				const objXe = listXe.filter(obj => obj.BienSo == bienso);
				if (objXe.length > 0) {
					console.log('check Xe', objXe[0])

					const params = new URLSearchParams();
					params.append('_idxe', objXe[0].ID);

					if (soThang == 1) {

						const today = new Date();
						// Lấy ngày 15 ngày trước
						const todaySum2 = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
						const before15Days = new Date(todaySum2.getTime() - 30 * 24 * 60 * 60 * 1000);
						// Format ngày dưới dạng ISO-8601
						const before15DaysIoString = before15Days.toISOString().slice(0, 10);
						const todayIsoString = todaySum2.toISOString().slice(0, 10);
						console.log("check todayIsoString dưới local", todayIsoString);
						console.log("check before15DaysIoString dưới local", before15DaysIoString);

						params.append('_ngaybatdau', before15DaysIoString);
						params.append('_ngayketthuc', todayIsoString);
					} else if (soThang == 2) {

						const today = new Date();
						// Lấy ngày 15 ngày trước
						const todaySum2 = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
						const before15Days = new Date(todaySum2.getTime() - 60 * 24 * 60 * 60 * 1000);
						// Format ngày dưới dạng ISO-8601
						const before15DaysIoString = before15Days.toISOString().slice(0, 10);
						const todayIsoString = todaySum2.toISOString().slice(0, 10);
						console.log("check todayIsoString dưới local", todayIsoString);
						console.log("check before15DaysIoString dưới local", before15DaysIoString);

						params.append('_ngaybatdau', before15DaysIoString);
						params.append('_ngayketthuc', todayIsoString);
					}

					await getSessionStu.get('/api/ReportCar/?' + params.toString(), { responseType: 'stream' })
						.then(response => {
							console.log('check response', response.status)
							if (response.status != 200) {
								reject({
									EM: "Lỗi api ...",
									EC: 1,
									DT: "",
								});
							}
							console.log("check response.data", response.data)

							const pathFolderPdf = path.join(__dirname + '..\\..\\') + "filesPDF\\inDat\\" + bienso + ".pdf";
							console.log("check path: " + pathFolderPdf)
							const writeStream = fs.createWriteStream(pathFolderPdf);
							response.data.pipe(writeStream);

							writeStream.on('finish', async () => {
								console.log("check finish")
								resolve({
									EM: "Get data successfully",
									EC: 0,
									DT: pathFolderPdf,
								})
							})

						})
						.catch(error => {
							reject({
								EM: "Lỗi api ...",
								EC: -2,
								DT: "",
							});
						});

				} else {
					//không có xe
					resolve({
						EM: "<b>Không có xe này</b>",
						EC: 1,
						DT: ""
					});
				}
			}
		})


	} catch (error) {
		console.log('check error', error)
		return ({
			EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
			EC: -2,
			DT: "",
		});
	}
}


module.exports = {
	getInfoStudent,
	getSessionStudent,
	getTokenService,
	checkTokenService,
	checkSession,
	inDat
}