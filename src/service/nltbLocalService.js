const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');
require("dotenv").config();
const printer = require('pdf-to-printer');

const dowloadFilePDFFromNLTBLocal = async (tokenLocalNLTB = null, MHV) => {
    try {
        console.log("đã vô dowloadFilePDFFromNLTBLocal")
        console.log("MHV đã xác nhận chuẩn bị truy vấn:", MHV)
        const yourBearToken = tokenLocalNLTB ? tokenLocalNLTB : process.env.tokenLocalNLTB;

        const getSessionStu = axios.create({
            baseURL: process.env.hostnameLocal,
            headers: {
                'Authorization': `Bearer ${yourBearToken}`
            },
            responseType: 'stream'
        })

        const restAPI = await getSessionStu.get('/api/reporthvth/' + MHV)
            .then(response => {
                console.log('check response', response.status)
                if(response.status!=200){
                    return ({
                        EM: "Lỗi api ...",
                        EC: 1,
                        DT: "",
                    });
                }
                return ({
                    EM: "Get data successfully",
                    EC: 0,
                    DT: response.data
                });
            })
            .catch(error => {
                console.log("check error", error)
                return ({
                    EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
                    EC: -2,
                    DT: "",
                });
            });
        return restAPI;
    } catch (error) {
        console.log('check error', error)
        return ({
            EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
            EC: -2,
            DT: "",
        });
    }

}

const getMHVforCCCD = async (tokenLocalNLTB = null, CCCD) => {
    try {
        console.log("đã vô dowloadFilePDFFromNLTBLocal")
        console.log("CCCD đã xác nhận chuẩn bị truy vấn:", CCCD)
        const yourBearToken = tokenLocalNLTB ? tokenLocalNLTB : process.env.tokenLocalNLTB;

        const getSessionStu = axios.create({
            baseURL: process.env.hostnameLocal,
            headers: {
                'Authorization': `Bearer ${yourBearToken}`
            },
        })

        const restAPI = await getSessionStu.get(`/api/HocVienTH?soCmt=${CCCD}&page=1&limit=10`)
            .then(response => {
                console.log('check response?.data?.Data[0]?.MaDK', response?.data)
                console.log("check response", response.status)
                if(response.status!=200){
                    return ({
                        EM: "Lỗi api ...",
                        EC: 1,
                        DT: "",
                    });
                }
                return ({
                    EM: "Get data successfully",
                    EC: 0,
                    DT: response?.data?.Data[0]?.MaDK
                });
            })
            .catch(error => {
                console.log("check error", error)
                return ({
                    EM: "Sever đang bảo trì, vui long truy cập lại sau ... ...",
                    EC: -2,
                    DT: "",
                });
            });
        return restAPI;
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
    dowloadFilePDFFromNLTBLocal,
    getMHVforCCCD
}