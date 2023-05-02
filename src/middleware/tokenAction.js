import nltbService from "../service/nltbService";
const fs = require('fs');
const https = require('https');
const path = require('path');
const dotenv = require('dotenv');
require('dotenv').config();

const getToken = async (req, res) => {
  try {
    const data = await nltbService.getTokenService();
    console.log("check data in getToken", data)
    if (data?.DT?.id_token != null) {
      dotenv.config();
      const envConfig = dotenv.parse(fs.readFileSync('.env'));
      console.log("check envConfig", envConfig),

        // Thay đổi giá trị của biến API_SECRET
      process.env.tokenNLTB = `${data?.DT?.id_token}`;
      envConfig.tokenNLTB = `${data?.DT?.id_token}`;

      const envContent = Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n');
      // Ghi lại nội dung của biến môi trường vào file .env
      console.log("check envContent", envContent)
      fs.writeFileSync('.env', envContent);

      // Lưu lại và đóng file
      dotenv.config();

      console.log("check biến môi trường mới", process.env.tokenNLTB)
    }
    return ({
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
};

const checkToken = async (req, res) => {
  try {
    dotenv.config();
    const data = await nltbService.checkTokenService();
    return ({
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

const attachToken = async (req, res, next) => {
  try {
    const ulrAPINLTB = '/api/v1/nltb/';
    console.log('check req.url', req.url);
    if (ulrAPINLTB.includes(req.url)) {
      const res1 = await checkToken();
      console.log("check res 1", res1);
      if (res1?.DT?.status == 401) {
        const data = await getToken();
        req.token = data?.DT?.id_token;
      }
    }
    next();

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
  attachToken,
  checkToken,
  getToken
};