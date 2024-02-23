// 引入express
import express from "express";
import cors from "cors";
import upload from "./utils/upload-imgs.js"; // 上傳圖片
import db from "./utils/connect-mysql.js"; // 資料庫
import testRouter from "./routes/index.js"; // 引入路由
import chatRouter from "./routes/chat.js"; // 引入路由
import regRouter from "./routes/reg.js"; // 引入路由

// import { createServer } from 'http'
// import { Server } from 'socket.io'

//建立web server物件
const app = express();

//sockie io
// const server = createServer(app)
// const io = new Server(server, {
//   cors: {
//     origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
//   },
// })


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
app.listen(port, () => {
  console.log(`express server ${port}`)
})

