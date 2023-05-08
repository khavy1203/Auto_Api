import nltbService from "../service/nltbService";
import botTelegramService from "../service/botTelegramService";
import { resolve } from "path";
const fs = require('fs');
const https = require('https');
const path = require('path');
const dotenv = require('dotenv');
const axios = require('axios');

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

const getTokenTelegram = async (req, res) => {
  try {
    const data = await botTelegramService.getTokenService();
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
    return ({
      EM: "error from sever", //error message
      EC: "-1", //error code
      DT: "",
    });
  }
};

const checkTokenTelegram = async (req, res) => {
  try {
    dotenv.config();
    const data = await botTelegramService.checkTokenService();
    return ({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    console.log("check error", e)
    return ({
      EM: "error from sever", //error message
      EC: "-1", //error code
      DT: "",
    });
  }
}

const attachToken = async (req, res, next) => {
  try {
    const ulrAPINLTB = '/nltb/';
    const ulrAPINLTBLocal = '/nltbLocal/';
    console.log('check req.url', req.url);
    console.log("req.url.includes(ulrAPINLTB)", req.url.includes(ulrAPINLTB))
    console.log("check req.url.includes(ulrAPINLTBLocal)",req.url.includes(ulrAPINLTBLocal))
    if (req.url.includes(ulrAPINLTB)) {
      console.log("vô 1")
      const res1 = await checkToken();
      console.log("check res 1", res1);
      if (res1?.DT?.status == 401) {
        const data = await getToken();
        req.token = data?.DT?.id_token;
      }else{
        req.token = process.env.tokenNLTB;
      }
    }else if (req.url.includes(ulrAPINLTBLocal)) {
      console.log("vô 2")
      const res1 = await checkTokenInLocalNLTB();
      console.log("check res 1", res1);
      if (res1?.EC != 0) {
        const data = await getTokenInLocalNLTB();
        req.token = data?.DT;
      }else{
        req.token = process.env.tokenLocalNLTB;
      }

    }
    console.log("check req.token", req.token)
    next();

  } catch (e) {
    console.error("check error", e)
    return ({
      EM: "error from sever", //error message
      EC: "-1", //error code
      DT: "",
    });
  }
}

const checkTokenInLocalNLTB = async () => {
	return new Promise((resolve,reject) => {

		const yourBearToken = process.env.tokenLocalNLTB;

		const getSessionStu = axios.create({
			baseURL: process.env.hostnameLocal,
			headers: {
				'Authorization': `Bearer ${yourBearToken}`
			}
		})

		getSessionStu.get('/api/loaixe')
			.then(response => {
				resolve({
					EM: "Get data successfully",
					EC: 0,
					DT: response?.data?.Data,
				});
			})
			.catch(error => {
				resolve({
					EM: "Something wrong ...",
					EC: -2,
					DT: "",
				});
			});
	}); 
}

const getTokenInLocalNLTB = async () => {
  return new Promise((resolve,reject) => {

		const yourBearToken = process.env.tokenLocalNLTB;

		const getSessionStu = axios.create({
			baseURL: process.env.hostnameLocal,
			headers: {
				'Authorization': `Bearer ${yourBearToken}`
			}
		})
    const payload = {
      "Username": process.env.usernameLocalNLTB,
      "Password": process.env.passwordLocalNLTB
    }
		getSessionStu.post('/api/Login', payload)
			.then(response => {
        if (response?.data?.Token != null) {
          dotenv.config();
          const envConfig = dotenv.parse(fs.readFileSync('.env'));
            // Thay đổi giá trị của biến API_SECRET
          process.env.tokenLocalNLTB = `${response?.data?.Token}`;
          envConfig.tokenLocalNLTB = `${response?.data?.Token}`;
    
          const envContent = Object.entries(envConfig).map(([key, value]) => `${key}=${value}`).join('\n');
          // Ghi lại nội dung của biến môi trường vào file .env
          console.log("check envContent", envContent)
          fs.writeFileSync('.env', envContent);
    
          // Lưu lại và đóng file
          dotenv.config();
          resolve({
            EM: "Get data successfully",
            EC: 0,
            DT: response?.data?.Token,
          });
        }else{
          resolve({
            EM: "Get Token fail",
            EC: -2,
            DT: "",
          });
        }
				
			})
			.catch(error => {
				resolve({
					EM: "Something wrong ...",
					EC: -2,
					DT: "",
				});
			});
	}); 
}

module.exports = {
  attachToken,
  checkToken,
  getToken,
  getTokenTelegram,
  checkTokenTelegram,
  checkTokenInLocalNLTB,
  getTokenInLocalNLTB,
}