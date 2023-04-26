import nltbService from "../service/nltbService";
const XLSX = require('xlsx');
const { saveAs } = require('file-saver');
const path = require('path');
const fs = require('fs');
const https = require('https');

const detailUser = async (req, res) => {
  try {
    // let name = req.params.name ;
    let name = "phạm xuân khả vy";

    let data = await nltbService.apiGetInfoStudent(name);
    console.log(data);
    res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    return res.status(500).json({
      EM: "error from sever", //error message
      EC: "-1", //error code
      DT: "",
    });
  }
};

const apiGetInfoStudent = async (mhv) => {
  if (mhv)
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
        searchString: mhv
      }
      const params = new URLSearchParams();
      params.append('page', 0);
      params.append('size', 10);

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

// hàm để chia mảng gốc thành các mảng con
function chunkArray(arr, chunkSize) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

const fetchAPIonFile = async (req, res) => {
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
    let resDataXLSX = [];


    const FETCH_BATCH_SIZE = 500; // Số lần fetch mỗi batch
    const BACKOFF_FACTOR = 2; // Hệ số tăng thời gian chờ giữa các lần fetch

    let fetchCount = 0; // Biến đếm số lần fetch
    let waitTime = 0; // Thời gian chờ giữa các lần fetch

    while (fetchCount < rows.length) {
      // Lấy batch mới
      const batch = rows.slice(fetchCount, fetchCount + FETCH_BATCH_SIZE);

      // Thực hiện fetch
      try {
        const pr2 =  batch.map(async (row, rowIndex) => {
          if (row[1]) {
            let result = row[1];
            // console.log('check result', result)
            if (result) {
              const res = await apiGetInfoStudent(result);
              if (res.EC == 0 && res?.DT[0]?.studentName) {
                const { studentName, studentId, studentDateOfBirth, driverLicenseLevelName, courseId, centerName, totalTime, totalDistance, moreTime, note, moreDistance, qualifiedNote } = res.DT[0];
                // const nameArr = studentName.split(" ");
                // const lastName = nameArr.pop();
                // const name = nameArr.join(" ");
                const newObj = { "Họ và Tên": studentName, 'Mã học viên': studentId, 'Ngày sinh': studentDateOfBirth, 'Hạng đào tạo': driverLicenseLevelName, 'Mã khoá học': courseId, 'Đơn vị đào tạo': centerName, 'Thời gian đào tạo': totalTime, 'Quãng đường đào tạo': totalDistance, 'Thời gian thiếu': moreTime, 'Quãng đường thiếu': moreDistance, 'Ghi chú': note, 'Yêu cầu': qualifiedNote }
                if (res.EC == 0) resDataXLSX.push(newObj)
                console.log(`Row ${rowIndex}: ${result}`);
                console.log(`Row ${rowIndex}: ${row}`);
              }
              // else{
              //   resDataXLSX.push({"Họ": '',"Tên": '', 'Mã học viên':result, 'Ngày sinh':'', 'Hạng đào tạo':'', 'Mã khoá học':'', 'Đơn vị đào tạo':'', 'Thời gian đào tạo':'', 'Quãng đường đào tạo':'', 'Thời gian thiếu': '', 'Quãng đường thiếu': '', 'Ghi chú':'Dữ liệu học viên không có', 'Yêu cầu' : ''})
              // }
            }
          }
        });
        await Promise.all(pr2);
        // Xử lý kết quả fetch

        fetchCount += FETCH_BATCH_SIZE; // Tăng biến đếm số lần fetch
        waitTime = 0; // Reset thời gian chờ giữa các lần fetch
      } catch (error) {
        // Xử lý lỗi fetch
        console.error(error);

        waitTime = Math.pow(BACKOFF_FACTOR, fetchCount / FETCH_BATCH_SIZE) * 1000; // Tính thời gian chờ giữa các lần fetch dựa trên số lần fetch đã thực hiện
        await new Promise((resolve) => setTimeout(resolve, waitTime)); // Chờ thời gian giữa các lần fetch
      }
    }

    // const pr1 = chunkedArr.map(async (childArrData) => {
    //   const pr2 = await childArrData.map(async (row, rowIndex) => {
    //     if (row[1]) {
    //       let result = row[1];
    //       // console.log('check result', result)
    //       if (result) {
    //         const res = await apiGetInfoStudent(result);
    //         if (res.EC == 0 && res?.DT[0]?.studentName) {
    //           const { studentName, studentId, studentDateOfBirth, driverLicenseLevelName, courseId, centerName, totalTime, totalDistance, moreTime, note, moreDistance, qualifiedNote } = res.DT[0];
    //           const nameArr = studentName.split(" ");
    //           const lastName = nameArr.pop();
    //           const name = nameArr.join(" ");
    //           const newObj = { "Họ": name, "Tên": lastName, 'Mã học viên': studentId, 'Ngày sinh': studentDateOfBirth, 'Hạng đào tạo': driverLicenseLevelName, 'Mã khoá học': courseId, 'Đơn vị đào tạo': centerName, 'Thời gian đào tạo': totalTime, 'Quãng đường đào tạo': totalDistance, 'Thời gian thiếu': moreTime, 'Quãng đường thiếu': moreDistance, 'Ghi chú': note, 'Yêu cầu': qualifiedNote }
    //           if (res.EC == 0) resDataXLSX.push(newObj)
    //           console.log(`Row ${rowIndex}: ${result}`);
    //           console.log(`Row ${rowIndex}: ${row}`);
    //         }
    //         // else{
    //         //   resDataXLSX.push({"Họ": '',"Tên": '', 'Mã học viên':result, 'Ngày sinh':'', 'Hạng đào tạo':'', 'Mã khoá học':'', 'Đơn vị đào tạo':'', 'Thời gian đào tạo':'', 'Quãng đường đào tạo':'', 'Thời gian thiếu': '', 'Quãng đường thiếu': '', 'Ghi chú':'Dữ liệu học viên không có', 'Yêu cầu' : ''})
    //         // }
    //       }
    //     }
    //   });
    //   await Promise.all(pr2);
    // })

    // await Promise.all(pr1);

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
    console.log("check resDataXLSX", updatedSTTArray)

    const workbookWrite = XLSX.utils.book_new();
    // Chuyển đổi dữ liệu thành định dạng Excel
    const worksheetWrite = XLSX.utils.json_to_sheet(updatedSTTArray);
    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(workbookWrite, worksheetWrite, 'ThongTinHocVien');
    XLSX.writeFile(workbookWrite, `ThongTinHocVien.xlsx`);
    saveAs('ThongTinHocVien.xlsx');

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
};

module.exports = {
  detailUser,
  fetchAPIonFile
}