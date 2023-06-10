import express from "express";
import nltbController from "../controller/nltbController";
import nltbLocalController from "../controller/nltbLocalController";
import {attachToken} from "../middleware/tokenAction";
require("dotenv").config();
const routes = express.Router();

const apiRoutes = (app) => {

  routes.all("*", attachToken);
  routes.get("/nltb/detailUser", nltbController.detailUser);

  routes.post("/nltb/queryDataOnMHV", nltbController.fetchAPIonMhv);
  routes.post("/nltb/queryDataOnMKH", nltbController.fetchAPIonMaKH);
  routes.get("/nltb/getToken", nltbController.getToken);
  routes.get("/nltb/checkToken", nltbController.checkToken);

  routes.post("/nltbLocal/inDat", nltbLocalController.nltbLocalInDat);
  routes.post("/nltbLocal/queryDataOnMHVOnLocal", nltbLocalController.fetchAPIonHVOnLocal);

  return app.use("/api/v1/", routes);
}
export default apiRoutes;



