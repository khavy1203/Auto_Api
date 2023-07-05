import express from "express";
import nltbController from "../controller/nltbController";
import nltbLocalController from "../controller/nltbLocalController";
import toolAutoController from "../controller/toolAutoController";

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

  routes.get("/generateImageBaoCao1", toolAutoController.generateImageBaoCao1);
  routes.post("/queryFetchStudentOnDatabaseOnMKH", toolAutoController.queryFetchStudentOnDatabaseOnMKH);
  routes.post("/queryFetchStudentOnDatabaseOnMHV", toolAutoController.queryFetchStudentOnDatabaseOnMHV);
  routes.post("/indat", toolAutoController.indat);
  routes.post("/convertJP2", toolAutoController.convertJP2);
  routes.post("/inMauTheoDoiThietBi", toolAutoController.inMauTheoDoiThietBi);


  return app.use("/api/v1/", routes);
}
export default apiRoutes;



