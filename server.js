/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:46:12+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: server.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-01-03T13:55:22+08:00
 */

var express  = require('express');
var mongoose = require('mongoose');
var app      = express();


// 使用body-parser解析post请求的参数，如果没有，req.body为undefined。
var route = require('./route/Route');
var database = require('./config/Database')

//Routes
app.use(route);
// app.use(express.static(__dirname + '/imageuploaded'));
var port = process.env.PORT || 9000;
var db = mongoose.connect(database.url)


//数据库连接状态
db.connection.on("error", function (error) {
  console.log("数据库连接失败：" + error);
});

db.connection.on("open", function () {
  console.log("数据库连接成功");
})

db.connection.on('disconnected', function () {
  console.log('数据库连接断开');
})

app.listen(port);
console.log("App listening on port : " + port);
