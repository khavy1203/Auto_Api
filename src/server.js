import express from 'express';
import bodyParser from "body-parser";
const fileUpload = require('express-fileupload');
import configViewEngine from "./config/viewEngine";
import apiRoutes from "./routes/api";
import botTelegram from './helpers/botTelegram';
import tx from './helpers/tx';

require('dotenv').config();

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(fileUpload());

configViewEngine(app);
apiRoutes(app);
botTelegram();
// tx();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('jwt nodejs and react ' + PORT);
});