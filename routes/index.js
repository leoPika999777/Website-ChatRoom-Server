import express from "express";
import db from './../utils/connect-mysql.js'

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h2>router test</h2>");
});


export default router;
