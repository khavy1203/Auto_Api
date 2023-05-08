const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const nltbLocalService = require('../service/nltbLocalService');

const nltbLocalInDat = async (req, res) => {
    try {
        // let name = req.params.name ;
        const CCCD = "52001-20221215-155456";
        let data = await nltbLocalService.dowloadFilePDFFromNLTBLocal(req?.token, CCCD);
        console.log(data);
        res.status(200).json({
            EM: data.EM,
            EC: data.EC,
            DT: data.DT,
        });
    } catch (e) {
        console.log("check error", e)
        return res.status(500).json({
            EM: "error from sever", //error message
            EC: "-1", //error code
            DT: "",
        });
    }
}

module.exports = {
    nltbLocalInDat
}