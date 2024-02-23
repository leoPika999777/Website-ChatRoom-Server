import express from "express";
import db from './../utils/connect-mysql.js'

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h2>router test 成功</h2>");
});

// 取得ROOM
router.get('/rooms', async (req, res) => {
  
  const output = {
    success: false,
    courseFav: [],
  }
  try {
    const sql = `SELECT * FROM room r LEFT JOIN user u on r.user_id=u.user_id;; `
    const [result] = await db.query(sql)

    // output.courseFav = result
    // output.success = true
    return res.json(result)
  } catch (ex) {
    console.log(ex)
  }
})

export default router;
