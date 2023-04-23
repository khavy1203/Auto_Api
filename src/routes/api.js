import express from "express";
require("dotenv").config();
const routes = express.Router();

const apiRoutes = (app) => {

  // routes.all("*", checkUserJwt, checkUserPermission);

  return app.use("/api/v1/", routes);
}
export default apiRoutes;