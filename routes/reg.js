import express from "express";
import db from './../utils/connect-mysql.js'
import bcrypt from "bcryptjs";




const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h2>REG router test</h2>");
});

router.post("/add", async (req, res) => {
  const output = {
    success: false,
    postData: req.body, // 除錯用
  };

  //21-1-1 新增sql

  const { user_name, account, password, photo } = req.body;
  const hash = await bcrypt.hash(password, 8);
  const sql =
    "INSERT INTO user (`user_name`, `account`, `password`, `photo`) VALUES (?, ?, ?, ?)";

  //21-3
  try {
    const [result] = await db.query(sql, [user_name, account, hash, photo]);
    output.result = result;
    output.success = !!result.affectedRows;
  } catch (ex) {
    output.exception = ex;
  }
  res.json(output);
});

export default router;
