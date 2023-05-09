const dotenv = require('dotenv');
const https = require('https');
const axios = require('axios');
require("dotenv").config();

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

const checkSession = async (tokenTongCuc = null, tokenLocalNLTB = null, mhv) => {
	try {
		const pr1 = new Promise((resolve, reject) => {

			const yourBearToken = tokenTongCuc ? tokenTongCuc : process.env.tokenNLTB;
			const today = new Date();
			// Lấy ngày 15 ngày trước
			const todaySum2 = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
			const before15Days = new Date(todaySum2.getTime() - 30 * 24 * 60 * 60 * 1000);
			// Format ngày dưới dạng ISO-8601
			const before15DaysIoString = before15Days.toISOString();
			const todayIsoString = todaySum2.toISOString();
			console.log("check todayIsoString dưới local", todayIsoString);
			console.log("check before15DaysIoString dưới local", before15DaysIoString);

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
				searchString: mhv,
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

					let data = [];
					try {
						if (dataArr.length > 0) {
							let dataBuffer = Buffer.concat(dataArr);
							data = JSON.parse(dataBuffer.toString());
							data.forEach(obj => {
								for (let key in obj) {
									if (obj[key] == null || obj[key] == 0) delete obj[key];
								}
							})
						}
					} catch (error) {
						reject({
							EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
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
				console.log("check error Phien1: " + error)
				reject({
					EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
					EC: -2,
					DT: "",
				});
			});

			req.write(JSON.stringify(payload));
			req.end();
		});
		const pr2 = new Promise((resolve, reject) => {

			const yourBearToken = tokenLocalNLTB ? tokenLocalNLTB : process.env.tokenLocalNLTB;
			const today = new Date();
			// Lấy ngày 15 ngày trước
			const todaySum2 = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
			const before15Days = new Date(todaySum2.getTime() - 30 * 24 * 60 * 60 * 1000);
			// Format ngày dưới dạng ISO-8601
			const before15DaysIoString = before15Days.toISOString();
			const todayIsoString = todaySum2.toISOString();
			console.log("check todayIsoString dưới local", todayIsoString);
			console.log("check before15DaysIoString dưới local", before15DaysIoString);

			const params = new URLSearchParams();
			params.append('ten', mhv.trim());
			params.append('ngaybatdau', before15DaysIoString.slice(0, 10));
			params.append('ngayketthuc', todayIsoString.slice(0, 10));
			params.append('page', 1);
			params.append('limit', 10);
			console.log("check mhv", mhv)
			const getSessionStu = axios.create({
				headers: {
					'Authorization': `Bearer ${yourBearToken}`
				}
			})

			getSessionStu.get(process.env.hostnameLocal + '/api/HanhTrinh?' + params.toString())
				.then(response => {
					resolve({
						EM: "Get data successfully",
						EC: 0,
						DT: response?.data?.Data,
					});
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
		const prAll = await Promise.all([pr1, pr2]).then((values) => {
			const dtTongcuc = values[0]?.DT;
			const dtLocal = values[1]?.DT;
			console.log('check length', dtTongcuc.length, dtLocal.length)

			const filteredArrayNotUpdate = dtLocal.filter(obj2 => !dtTongcuc.some(obj1 => obj1.sessionGuid == obj2.SessionId));
			if (filteredArrayNotUpdate.length > 0) {
				return ({
					EM: `<b>Hãy trao cho em huy chương 🏅 sau khi em đã tìm kiếm cật lực và phát hiện ra ${filteredArrayNotUpdate.length} phiên bị mất. Hãy liên hệ cho em để được cíu 🐧🐧🐧</b> \n`,
					EC: 0,
					DT: filteredArrayNotUpdate,
				});
			} else {
				return ({
					EM: "<b>Rât vui là không có phiên nào bị mất. Nếu quý Thầy chắc chắn rằng mình chạy bị thiếu phiên thì chỉ có thể là dữ liệu chưa lên. Thầy vui lòng chạy ra xe mở máy DAT lên để máy tự động upload dữ liệu và Kiểm tra lại. Nếu kiểm tra vẫn không có thì chia buồn cùng thầy 🐧🐧🐧</b> \n",
					EC: 1,
					DT: [],
				});
			}

		}).catch((error) => {
			console.log('check error: ', error)
			return ({
				EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
				EC: -2,
				DT: [],
			});
		});
		return prAll;

	} catch (error) {
		return ({
			EM: "Sever đang bảo trì vui lòng truy cập tính năng lại sau ......",
			EC: -2,
			DT: [],
		});
	}
}



module.exports = {
	getInfoStudent,
	getSessionStudent,
	getTokenService,
	checkTokenService,
	checkSession,
}