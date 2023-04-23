import express from 'express';
import bodyParser from "body-parser";
import configViewEngine from "./config/viewEngine";
import apiRoutes from "./routes/api";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

configViewEngine(app);
apiRoutes(app);


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log('jwt nodejs and react ' + PORT);
});