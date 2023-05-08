const XLSX = require('xlsx');
const { saveAs } = require('file-saver');
const fs = require('fs');
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

const apiGetInfoStudent = async (token = null, Name) => {

    return new Promise((resolve, reject) => {
        console.log("check token: " + token)
        console.log("check process.env.tokenNLTB: " + process.env.tokenNLTB)

        const yourBearToken = token || process.env.tokenNLTB;

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
            searchString: Name
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

            res.on('data', (d) => {
                //   let data = process.stdout.write(d);
                dataArr.push(d);
            });

            res.on('end', () => {

                let dataBuffer = Buffer.concat(dataArr);
                let data = JSON.parse(dataBuffer.toString());
                console.log('check data: ' + data);
                data.forEach(obj => {
                    for (let key in obj) {
                        if (obj[key] == null || obj[key] == 0) delete obj[key];
                    }
                })
                console.log('check data: ' + data)
                const workbook = XLSX.utils.book_new();
                // Chuyển đổi dữ liệu thành định dạng Excel
                const worksheet = XLSX.utils.json_to_sheet(data);
                // Thêm worksheet vào workbook
                XLSX.utils.book_append_sheet(workbook, worksheet, 'ThongTinHocVien');
                XLSX.writeFile(workbook, `ThongTinHocVien.xlsx`);
                saveAs('ThongTinHocVien.xlsx');

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
}

const fetchAPIonFile = async (file) => {

}

const getTokenService = async () => {
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
                resolve({
                    EM: "error server from api ...",
                    EC: -1,
                    DT: [],
                });
            };
            res.on('data', (d) => {
                dataArr.push(d);
            });

            res.on('end', () => {
                let data = [];
                if (dataArr.length > 0) {
                    let dataBuffer = Buffer.concat(dataArr);
                    data = JSON.parse(dataBuffer.toString());
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
}
const checkTokenService = async (req, res) => {
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

            res.on('data', (d) => {
                dataArr.push(d);
            });

            res.on('end', () => {
                let dataBuffer = Buffer.concat(dataArr);
                let data = JSON.parse(dataBuffer.toString());

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

        // req.write(JSON.stringify(payload));
        req.end();
    });
}

const apiGetInfoStudentOnSource = async (maKH, page) => {
    if (maKH)
        return new Promise((resolve, reject) => {
            const yourBearToken = process.env.tokenNLTB;

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
                searchString: maKH
            }
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('size', 20);

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
                console.log(`statusCode: ${res.statusCode}`);

                res.on('data', (d) => {
                    dataArr.push(d);
                });

                res.on('end', () => {
                    let dataBuffer = Buffer.concat(dataArr);
                    let data = JSON.parse(dataBuffer.toString());

                    data.forEach(obj => {
                        for (let key in obj) {
                            if (obj[key] == null || obj[key] == 0) delete obj[key];
                        }
                    })

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
}


module.exports = {
    apiGetInfoStudent,
    fetchAPIonFile,
    getTokenService,
    checkTokenService,
    apiGetInfoStudentOnSource,
}