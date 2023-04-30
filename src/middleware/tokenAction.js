require("dotenv").config();
const fs = require('fs');
const https = require('https');

const getTokenService = async (req, res) => {
  return new Promise((resolve, reject) => {
    const payload = {
      username: '52001',
      password: 'hRmqcv5&',
      rememberMe: true,
      responseCaptcha: 'hTaTorNY145de0BdEfdhuA==',
      userCaptcha: '',
    }

    let dataArr = [];

    const options = {
      hostname: '117.1.28.135',
      port: 443,
      path: '/api/authenticate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      rejectUnauthorized: false // Set rejectUnauthorized to false
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('data', (d) => {
        dataArr.push(d);
      });

      res.on('end', () => {
        let dataBuffer = Buffer.concat(dataArr);
        let data = JSON.parse(dataBuffer.toString());

        console.log("check data", data)
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
const getToken = async (req, res) => {
  try {
    const data = await getTokenService();
    if(data?.DT?.id_token != null){
      fs.writeFileSync('.env', `tokenNLTB = "${data?.DT?.id_token}"`);
    }
    return({
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

const checkTokenService = async (req, res) => {
  return new Promise((resolve, reject) => {
    let yourBearToken = process.env.tokenNLTB;
    let dataArr = [];

    const options = {
      hostname: '117.1.28.135',
      port: 443,
      path: '/api/centers/getListCenterByUser',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + yourBearToken
      },
      rejectUnauthorized: false // Set rejectUnauthorized to false
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on('data', (d) => {
        dataArr.push(d);
      });

      res.on('end', () => {
        let dataBuffer = Buffer.concat(dataArr);
        let data = JSON.parse(dataBuffer.toString());

        console.log("check data", data)
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

    // req.write(JSON.stringify(payload));
    req.end();
  });
}

const checkToken = async (req, res) => {
  try {
    const data = await checkTokenService();
    return({
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
  //check token
  const res1 = await checkToken();
  if(res1?.DT?.status == 401){
    const data = await getToken();
    req.token = data?.DT?.id_token;
  }
  next();
}

module.exports = {
  attachToken
};