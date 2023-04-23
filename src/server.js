import express from 'express';
import bodyParser from "body-parser";
import configViewEngine from "./config/viewEngine";
import functionApi from './functiontAPI';

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

(async function() {
    try {
      const data = await functionApi.apiGetInfoStudent("Phạm Xuân Khả Vy");
      console.log(data);
      // Thực hiện các tác vụ khác tại đây
    } catch (err) {
      console.error(err);
    }
})();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('jwt nodejs and react ' + PORT);
});