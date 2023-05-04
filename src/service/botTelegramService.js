const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const https = require('https');
require("dotenv").config();

const getInfoStudent = async (token = null, name) => {

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
            if(res.statusCode != 200){
                reject({
                    EM: "Something wrong ...",
                    EC: -2,
                    DT: [],
                });
            }
            res.on('data', (d) => {
                //   let data = process.stdout.write(d);
                dataArr.push(d);
            });

            res.on('end', () => {

                let data = [];
                if(dataArr.length>0){
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
                DT: "",
            });
        });

        req.write(JSON.stringify(payload));
        req.end();
    });
}

const getSessionStudent = async (token = null, name) => {

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
            if(res.statusCode != 200){
                reject({
                    EM: "Something wrong ...",
                    EC: -2,
                    DT: [],
                });
            }
            res.on('data', (d) => {
                //   let data = process.stdout.write(d);
                dataArr.push(d);
            });

            res.on('end', () => {

                let data = [];
                if(dataArr.length>0){
                    let dataBuffer = Buffer.concat(dataArr);
                    data = JSON.parse(dataBuffer.toString());
                    console.log('check data Phiên: ' + data);
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
}

module.exports = {
    getInfoStudent, 
    getSessionStudent
}