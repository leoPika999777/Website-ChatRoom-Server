import express from "express";
import db from "./../utils/connect-mysql.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("<h2>router test 成功</h2>");
});

//新增ROOM

router.post("/addroom", async (req, res) => {
  const output = {
    success: false,
    postData: req.body, // 除錯用
  };

  //21-1-1 新增sql

  const { room_name, room_password
    , user_id } = req.body;

  //撈取登入的member_id
  // if (!res.locals.jsonwebtoken?.user_id) {
  //   return res.json({ success: false, error: "Unauthorized" });
  // }
  // const user_id = res.locals.jsonwebtoken?.user_id;

  const sql =
    "INSERT INTO room ( `room_name`,`room_password`, `user_id`) VALUES (?, ?, ?)";

  //21-3
  try {
    const [result] = await db.query(sql, [ room_name, room_password,user_id]);
    output.result = result;
    output.success = !!result.affectedRows;
  } catch (ex) {
    output.exception = ex;
  }
  res.json(output);
});

// 取得ROOM
router.get("/rooms", async (req, res) => {
  const output = {
    success: false,
    courseFav: [],
  };
  try {
    const sql = `SELECT * FROM room r LEFT JOIN user u on r.user_id=u.user_id;; `;
    const [result] = await db.query(sql);

    // output.courseFav = result
    // output.success = true
    return res.json(result);
  } catch (ex) {
    console.log(ex);
  }
});

// 詳細頁
router.get('/api/detail/:room_id', async (req, res) => {
  const room_id = +req.params.room_id
  const sql = `SELECT * 
  FROM room
  WHERE room_id = ? `
  const [rows] = await db.query(sql, [room_id])
  if (rows.length) {
    res.json(rows[0])
  } else {
    res.json({})
  }
})

export default router;
