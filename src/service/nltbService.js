const XLSX = require('xlsx');
const { saveAs } = require('file-saver');
const path = require('path');
const fs = require('fs');
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

const apiGetInfoStudent = async (Name) => {

    return new Promise((resolve, reject) => {
        let yourBearToken = process.env.tokenNLTB;

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

        // const options = {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': 'Bearer ' + yourBearToken
        //     },
        //     body: JSON.stringify(payload),
        //     agent: new https.Agent({ rejectUnauthorized: false })
        // };

        const params = new URLSearchParams();
        params.append('page', 0);
        params.append('size', 10);

        // fetch('https://dat.gplx.gov.vn/api/student-results/search-report-qua-trinh-dao-tao?' + params.toString(), options)
        //     .then((res) => console.log('check', res.json()))
        //     .then((data) => {
        //         console.log('check data', data)

        //         const workbook = XLSX.utils.book_new();

        //         // Chuyển đổi dữ liệu thành định dạng Excel
        //         const worksheet = XLSX.utils.json_to_sheet(data.Data);

        //         // Thêm worksheet vào workbook
        //         XLSX.utils.book_append_sheet(workbook, worksheet, 'ThongTinHocVien');
        //         console.log('check workbook', workbook)
        //         XLSX.writeFile(workbook, `ThongTinHocVien.xlsx`);
        //     })
        //     .catch(error => console.log('Error:', error));


        //1 nốt bay màu SSL =))
        let dataArr = [];
        const options = {
            hostname: '117.1.28.135',
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

                data.forEach(obj => {
                    for (let key in obj) {
                        if (obj[key] == null || obj[key] == 0) delete obj[key];
                    }
                })
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
// 

module.exports = {
    apiGetInfoStudent,
    fetchAPIonFile
}