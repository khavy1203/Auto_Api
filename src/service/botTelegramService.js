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
    getInfoStudent
}