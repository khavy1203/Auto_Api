const XLSX = require('xlsx');
const { saveAs } = require('file-saver');
const path = require('path');
const fs = require('fs');
const https = require('https');

const apiGetInfoStudent = async (Name) => {

    return new Promise((resolve, reject) => {
        let yourBearToken = "eyJhbGciOiJIUzUxMiJ9.eyJqdGkiOiI2OGY5ODkyYi1hM2ZjLTRjNzYtYmUwYy00MGJkMDE4NzRhZGIiLCJzdWIiOiI1MjAwMSIsImFjY291bnRUeXBlIjoiUk9MRV9UUkFJTklOR19VTklUUyIsImF1dGgiOiJkYXNoYm9hcmQ6dmlldyxyZXBvcnRfc3R1ZGVudF9wcm9ncmVzczp2aWV3LHJlcG9ydF9zdHVkZW50X3Byb2dyZXNzOmV4cG9ydCxyZXBvcnRfc3R1ZGVudF9zZXNzaW9uOnZpZXcscmVwb3J0X3N0dWRlbnRfc2Vzc2lvbjpleHBvcnQscmVwb3J0X2NvbXBsZXRpb25fc3RhdGlzdGljOnZpZXcscmVwb3J0X2NvbXBsZXRpb25fc3RhdGlzdGljOmV4cG9ydCxkYXRhX3ZlaGljbGU6dmlldyxkYXRhX3ZlaGljbGU6ZXhwb3J0LGRhdGFfY291cnNlOnZpZXcsZGF0YV9jb3Vyc2U6ZXhwb3J0LGRhdGFfc3R1ZGVudDp2aWV3LGRhdGFfc3R1ZGVudDpleHBvcnQsZGF0YV90dXRvcjp2aWV3LGRhdGFfdHV0b3I6ZXhwb3J0LHN5c3RlbV9ub3RpZmljYXRpb25zOnZpZXcsc2Vzc2lvbl9tYW5hZ2VtZW50OnZpZXcsc2Vzc2lvbl9tYW5hZ2VtZW50OmV4cG9ydCIsImV4cCI6MTY4NDU5MTc1OH0.L1RwEPmblNuqfz-HaoJjMMMGFXSkpIZjbVbE54NzTIlOCeHdbeq1yGqBLumo0_JSFNMibSnMsE__C0MMrlBPGg"

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
            console.log(`statusCode: ${res.statusCode}`);

            res.on('data', (d) => {
                //   let data = process.stdout.write(d);
                dataArr.push(d);
            });

            res.on('end', () => {

                let dataBuffer = Buffer.concat(dataArr);
                let data = JSON.parse(dataBuffer.toString());

                data.forEach(obj =>{
                    for(let key in obj){
                        if(obj[key] == null || obj[key] == 0 )delete obj[key];
                    }
                })
                const workbook = XLSX.utils.book_new();
                // Chuyển đổi dữ liệu thành định dạng Excel
                const worksheet = XLSX.utils.json_to_sheet(data);
                // Thêm worksheet vào workbook
                XLSX.utils.book_append_sheet(workbook, worksheet, 'ThongTinHocVien');
                XLSX.writeFile(workbook, `ThongTinHocVien.xlsx`);
                saveAs('ThongTinHocVien.xlsx');

                resolve(data);
            });

        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(JSON.stringify(payload));
        req.end();
    });
}

module.exports = {
    apiGetInfoStudent
}