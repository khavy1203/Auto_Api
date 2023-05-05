import express from 'express';
import bodyParser from "body-parser";
const fileUpload = require('express-fileupload');
import configViewEngine from "./config/viewEngine";
import apiRoutes from "./routes/api";
import botTelegram from './helpers/botTelegram';
const fs = require('fs');
const pdfPrinter = require('pdf-to-printer');

require('dotenv').config();

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(fileUpload());

configViewEngine(app);
apiRoutes(app);
botTelegram();

// pdfPrinter.print('./9d8790ac-2cdd-41f6-b4b4-4358f408ae8a.pdf', { printer: '192.168.10.94' })
// .then(d => console.log(d))
// .catch(e =>console.error(e));


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('jwt nodejs and react ' + PORT);
});