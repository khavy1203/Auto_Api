const dotenv = require('dotenv');
const https = require('https');
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
			EM: "Something wrong ...",
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

					let data = [];
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
					EM: "Something wrong ...",
					EC: -2,
					DT: []
				});
			});

			req.write(JSON.stringify(payload));
			req.end();
		});
	} catch (error) {
		reject({
			EM: "error server from api ...",
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
						EM: "error server from api ...",
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
							console.log('check data Phiên: ' + data);
							data.forEach(obj => {
								for (let key in obj) {
									if (obj[key] == null || obj[key] == 0) delete obj[key];
								}
							})
						}
					} catch (error) {
						reject({
							EM: "error server from api ...",
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
					EM: "Something wrong ...",
					EC: -2,
					DT: "",
				});
			});

			req.write(JSON.stringify(payload));
			req.end();
		});
	} catch (error) {
		reject({
			EM: "error server from api ...",
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
						EM: "error server from api ...",
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
							EM: "error server from api ...",
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
					EM: "Something wrong ...",
					EC: -2,
					DT: "",
				});
			});

			req.write(JSON.stringify(payload));
			req.end();
		});
	} catch (e) {
		reject({
			EM: "error server from api ...",
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
						EM: "error server from api ...",
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
							EM: "Something wrong ...",
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
					EM: "Something wrong ...",
					EC: -2,
					DT: "",
				});
			});

			// req.write(JSON.stringify(payload));
			req.end();
		});
	} catch (e) {
		reject({
			EM: "error server from api ...",
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
}