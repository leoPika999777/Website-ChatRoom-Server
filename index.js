// 引入express
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import upload from "./utils/upload-imgs.js"; // 上傳圖片
import db from "./utils/connect-mysql.js"; // 資料庫
import testRouter from "./routes/index.js"; // 引入路由
import chatRouter from "./routes/chat.js"; // 引入路由
import regRouter from "./routes/reg.js"; // 引入路由

import { createServer } from 'http'
import { Server } from 'socket.io'



//建立web server物件
const app = express();

//sockie io
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },
})


// top-level middlewares // 依檔頭Content-Type來決定是否解析
app.use(cors()); // 放所有路由的前面
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// 定義路由
app.get("/", (req, res) => {
  res.send("<h2>abc</h2>");
});

app.use("/test", testRouter); // 當成 middleware 使用

// 上傳圖片的路由
// 加入 middleware upload.single()
// app.post("/try-upload", upload.single("avatar"), (req, res) => {
//   res.json(req.file);
// });

// app.post("/try-uploads", upload.array("photos"), (req, res) => {
//   res.json(req.files);
// });

// 設定靜態內容的資料夾 // public裡面的內容相當於在根目錄
app.use(express.static("public"));

//ＣＨＡＴＲＯＯＭ路由
app.use("/chat", chatRouter);


//註冊路由
app.use("/reg", regRouter);

//1to1
io.on('connection', (socket) => {
  console.log('a user connected')
  // socket.emit('test', 'hello')

  // socket.on('client', (arg) => {
  //   console.log('server recieved: ', arg)
  // })
  // socket.on('getUser', (user) => {
  //   if (user === 'a') {
  //     socket.join('room a')
  //     io.to('room a').emit('room', 'room a', new Date().toString())
  //   } else {
  //     socket.join('room b')
  //     io.to('room b').emit('room', 'room b', new Date().toString())
  //   }
  // })
  socket.emit('connection', 'success')
  socket.on('user message', (userId, receiverId, message) => {
    console.log('user message: ', message)
    socket.broadcast.emit('room', userId, message)
  })
  // socket.join('room')
  // socket.on('user message', (userId, message)=>{
  //   console.log(userId, message)
  //   io.to('room').emit('room', userId, message)
  // })

  // io.to('room').emit('room', 'server', 'room opened')
})


//登入 表單資料
app.post("/login-jwt", async (req, res) => {
  const output = {
    success: false,
    code: 0,
    postData: req.body,
    user_id: 0,
    account: "",
    user_name: "",
    photo:"",
    token: ""
  };
  if (!req.body.account || !req.body.password) {
    // 資料不足
    output.code = 410;
    return res.json(output);
  }
  const sql = "SELECT * FROM user WHERE account=?";
  const [rows] = await db.query(sql, [req.body.account]);
  if (!rows.length) {
    // 帳號是錯的
    output.code = 400;
    return res.json(output);
  }
  const row = rows[0];
  const pass = await bcrypt.compare(req.body.password, row.password);
  if (!pass) {
    // 密碼是錯的
    output.code = 420;
    return res.json(output);
  }
  output.code = 200;
  output.success = true;
  output.user_id = row.user_id;
  output.account = row.account;
  output.user_name = row.user_name;
  output.photo = row.photo;
  output.token = jwt.sign(
    { user_id: row.user_id, account: row.account },
    process.env.JWT_SECRET
  );
  res.json(output);
});



//1227-1
app.get("/profile", async (req, res) => {
  // res.locals.jwt: {id, account}
  const output = {
    success: false,
    error: "",
    data: {},
  };
  if(!res.locals.jwt?.user_id){
    output.error = "沒有權限";
    return res.json(output);
  }
  const [rows] = await db.query("SELECT `user_id`, `account`, `user_name` FROM `members` WHERE user_id=?", [res.locals.jwt.user_id]);
  if(!rows.length){
    output.error = "沒有這個會員";
    return res.json(output);
  }
  output.success = true;
  output.data = rows[0];
  res.json(output);
});



//登出

app.get("/logout", async (req, res) => {
  //刪掉admin的屬性 
  delete req.session.admin;
  res.redirect('/');
});




// 上傳單ㄧ照片的路由
app.post('/try-upload', upload.single('avatar'), (req, res) => {
  res.json(req.file)
})
// 上傳複數照片的路由
app.post('/try-uploads', upload.array('photos'), (req, res) => {
  res.json(req.files)
})

// 設定靜態內容的資料夾,相當於在根目錄
app.use(express.static('public'))

// 404 錯誤處理
app.use((req, res) => {
  res.status(404).send(`<h1>404 not found</h1>`)
})


const port = process.env.WEB_PORT || 3003; // 如果沒設定就使用3003

// 伺服器啟動
server.listen(port, () => {
  console.log(`express server ${port}`)
})

