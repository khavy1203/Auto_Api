require('dotenv').config();
const listCourseOld = ['CD_K148B','CD_K149B','CD_K99C','CD_K150B','CD_K151B','CD_K152B','CD_K100C','CD_K101C','CD_K153B','CD_K154B','CD_K102C','CD_K155B','CD_K103C','CD_K157B','CD_K158B','CD_K156B','CD_K159B','CD_K160B','CD_K104C','CD_K105C','CD_K106C','CD_K107C','CD_K108C','CD_K109C','CD_K162B','CD_K163B','CD_K164B','CD_K165B','CD_K167B','CD_K166B','CD_K168B','CD_115C','CD_110C','CD_111C','CD_112C','CD_113C','CD_114C','CD_169B','CD_K170B','CD_171B','CD_172B','CD_K173B','CD_174B','CD_K175B','CD_176B','CD_K177B','CD_K178B','CD_116C','CD_57TĐ','CD_20B1','CD_180B','CD_181B','CD_182B','CD_55TĐ','CD_56TĐ','CD_20B1','CD_57TĐ','CD_58TĐ','CD_183B','CD_118C','CD_118C','CD_184B','CD_59TĐ','CD_119C','CD_185B','CD_60TĐ','CD_120C','CD_121C','CD_19B1','CD_186B','CD_61TĐ','CD_21B1','CD_122C','CD_62TĐ','CD_B2(23/7)','CD_187B','CD_22B1','CD_188B','CD_63TĐ','CD_124C','CD_K05 B2 LÊN C','CD_123C','CD_K06 B2 LÊN C','CD_189B','CD_64TĐ','CD_190B','CD_65TĐ','CD_23B1','CD_125C','CD_66TĐ','CD_191B','CD_TestMayDat','CD_126C','CD_48TĐ','CD_114C','CD_117C','CD_49TĐ','CD_K175B','CD_112C','CD_67TĐ','CD_24B1','CD_192B','CD_171B','B2K01','CD_127C'];
const config = {
  user: process.env.usernameDTB,
  password: process.env.passwordDTB,
  server: process.env.servernameDTB,
  port: parseInt(process.env.portDTB),
  database: process.env.databaseDTB,
  options: {
    encrypt: false, // Sử dụng giao thức không bảo mật (plaintext)
  },

};
module.exports = {
    listCourseOld,
    config
}