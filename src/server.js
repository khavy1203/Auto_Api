import express from 'express';
import bodyParser from "body-parser";
const fileUpload = require('express-fileupload');
import configViewEngine from "./config/viewEngine";
import apiRoutes from "./routes/api";
require('dotenv').config();

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(fileUpload());

configViewEngine(app);
apiRoutes(app);
// const zaloOA = new ZaloOA({
//   oaid: '580996410463386537',
//   secretkey: 'GFjcfsgiXPj2IuNRmdxD',
//   callbackurl: '<your_callback_url>',
// });

const app_id = 'your_app_id';
const app_secret = 'your_app_secret';

// const data = {
//   app_id: app_id,
//   app_secret: app_secret
// };

// app.post('/webhook', (req, res) => {
//   const data = req.body;
//   const sender_id = data.sender.id;
//   const message = data.message.text;

//   axios.post('https://openapi.zalo.me/v2.0/oa/message', qs.stringify({
//     recipient: {
//       user_id: sender_id
//     },
//     message: {
//       text: `Bạn đã gửi tin nhắn: ${message}`
//     }
//   }), {
//     headers: {
//       'Authorization': `Bearer ${access_token}`,
//       'Content-Type': 'application/x-www-form-urlencoded'
//     }
//   })
//     .then(response => {
//       console.log(response.data);
//       res.sendStatus(200);
//     })
//     .catch(error => {
//       console.log(error.response.data);
//       res.sendStatus(500);
//     });
// });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('jwt nodejs and react ' + PORT);
});