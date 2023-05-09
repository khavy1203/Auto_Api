const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
require("dotenv").config();
const printer = require('pdf-to-printer');

const dowloadFilePDFFromNLTBLocal = async (tokenLocalNLTB = null, CCCD) => {
    console.log("đã vô dowloadFilePDFFromNLTBLocal")

    const yourBearToken = tokenLocalNLTB ? tokenLocalNLTB : process.env.tokenLocalNLTB;

    const getSessionStu = axios.create({
        baseURL: process.env.hostnameLocal,
        headers: {
            'Authorization': `Bearer ${yourBearToken}`
        },
        responseType: 'stream'
    })

    const restAPI = await getSessionStu.get('/api/reporthvth/' + CCCD)
        .then(response => {
            const pathFolderPdf = path.join(__dirname + '../../') + "filesPDF/" + CCCD + ".pdf";
            console.log("check path: " + pathFolderPdf)
            const writeStream = fs.createWriteStream(pathFolderPdf);
            response.data.pipe(writeStream);
            // printer
            // .print(pathFolderPdf)
            // .then(console.log)
            // .catch(console.error);

            return ({
                EM: "Get data successfully",
                EC: 0,
                DT: ""
            });
        })
        .catch(error => {
            console.log('check error', error)
            return ({
                EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
                EC: -2,
                DT: "",
            });
            console.error(error);
        });
    return restAPI;
}

module.exports = {
    dowloadFilePDFFromNLTBLocal
}