import nltbService from "../service/nltbService";

const detailUser = async (req, res) => {
  try {
    // let name = req.params.name ;
    let name = "phạm xuân khả vy";

    let data = await nltbService.apiGetInfoStudent(name);
    console.log(data);
    res.status(200).json({
      EM: data.EM,
      EC: data.EC,
      DT: data.DT,
    });
  } catch (e) {
    return res.status(500).json({
      EM: "error from sever", //error message
      EC: "-1", //error code
      DT: "",
    });
  }
};

module.exports = {
  detailUser
}