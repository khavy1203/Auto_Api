import express from "express";
import nltbController from "../controller/nltbController"
require("dotenv").config();
const routes = express.Router();

const apiRoutes = (app) => {

  // routes.all("*", checkUserJwt, checkUserPermission);
  routes.get("/nltb/detailUser", nltbController.detailUser);
  routes.post("/nltb/queryData", nltbController.fetchAPIonFile);
  
  return app.use("/api/v1/", routes);
}
export default apiRoutes;