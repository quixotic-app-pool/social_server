/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:46:41+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: Route.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-08T15:04:21+08:00
 */

var express = require('express');
var dateFormat = require('dateformat');
var CircularJSON = require('circular-json');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId
var router = express.Router();
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)
router.use(bodyParser.json());                                     // parse application/json
router.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded


var https = require('https');
var WXBizDataCrypt = require('../wechat_api/WXBizDataCrypt')
var SessionModel = require('../models/Session')
var UserModel = require("../models/User")


//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('#################Welcome to server of english corner!######################')
  var now = new Date();
  console.log('Time: ', dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT"));
  next();
});

var userCtrl = require("./controller/userCtrl");
var notificationCtrl = require("./controller/notificationCtrl");
var postCtrl = require("./controller/postCtrl");

//wechat interaction
router.get('/api/wechatactivity', function(req, res){
      // console.log('/api/wechatactivity: ' + req.query.code)
      var reqData = req.query
      var appId = ''
      var url = 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appId+'&secret=&js_code=' + reqData.code + '&grant_type=authorization_code'
      var back = res;
      var _3rd_session;
      https.get(url, res => {
          res.setEncoding("utf8");
          let body = "";
          res.on("data", data => {
            body += data;
          });
          res.on("end", () => {
            body = JSON.parse(body);
            var userInfo = JSON.parse(reqData.userInfo);
            // console.log(body);
            // here we decode the data
            var pc = new WXBizDataCrypt(appId, body.session_key)
            var data = pc.decryptData(reqData['encryptedData'] , reqData.iv)
            // console.log('解密后 data: ', data)
            const exec = require('child_process').exec;
            exec('head -n 80 /dev/urandom | tr -dc A-Za-z0-9 | head -c 168', function(err,stdout,stderr){
              // _3rd_session = stdout;
              _3rd_session = 'id_sampledfdsyuiyuiy2123';
              // console.log('3rd_session:' + stdout);
              // console.log("req.query.UserSessionExpire: "+ JSON.stringify(req.query.UserSessionExpire));
              if(reqData.UserSession !== 'undefined'){
                console.log('session exists');
                SessionModel.findOneAndUpdate({sessionId: reqData.UserSession}, {session: _3rd_session, session_key: body.session_key, openid: body.openid}, function(err, docs){
                  if(err)console.log(err);
                   UserModel.findOneAndUpdate({oId: body.openid}, { nickName: userInfo.nickName, avatarUrl: userInfo.avatarUrl, gender: userInfo.gender}, function(err, docs2){
                     if(err)console.log(err);
                    //  console.log('docs2: ' + JSON.stringify(docs2));
                     back.json({flag: 'success', user_id: docs2._id, user_position:docs2.position, session: {sessionId: _3rd_session, createdAt: docs.createdAt}})
                   })
                })
              } else {
                console.log('session not exists');
                var now = new Date();
                var sessionEntity = new SessionModel({
                      sessionId: _3rd_session,
                      session_key: body.session_key,
                      openid: body.openid,
                      createdAt: now
                    })
                sessionEntity.save(function(err, docs){
                    if(err) console.log(err);
                    UserModel.findOne({oId: body.openid}, function(err, docs2){
                      if(err)console.log(err);
                      if(docs2) {
                        back.json({flag: 'success', user_id: docs2._id, user_position:docs2.position, session: {sessionId: _3rd_session, createdAt: now}})
                      } else {
                        // console.log('reqData: ' + typeof reqData.userInfo);
                        // console.log('reqData.userInfo.nickName: ' + userInfo.nickName);
                        // console.log('reqData.userInfo.avatarUrl: ' + userInfo.avatarUrl);
                        // console.log('reqData.userInfo.gender: ' + userInfo.gender);
                        var userEntity = new UserModel({
                          oId: body.openid,
                          nickName: userInfo.nickName,
                          avatarUrl: userInfo.avatarUrl,
                          gender: userInfo.gender
                        })
                        userEntity.save(function(err, data) {
                          if(err)console.log(err);
                          back.json({flag: 'success', user_id: data._id, user_position:data.position, session: {sessionId: _3rd_session, createdAt: now}})
                        })
                      }
                    })
                })
              }
            })
          });
        });
})

//notification
router.get('/api/fetchnotificationnum', notificationCtrl.fetchNum)
router.get('/api/fetchnotificationlist', notificationCtrl.fetchList)
router.post('/api/updatenotification', notificationCtrl.update)

//member
router.get('/api/memberlist', memberCtrl.memberlist);
router.get('/api/member', memberCtrl.member);

//post
router.get('/api/fetchpostlist', postCtrl.fetchpostlist);
router.get('/api/fetchpost', postCtrl.fetchpost);
router.post('/api/newpost', postCtrl.newpost);
router.post('/api/delpost', postCtrl.delpost);

//activity
router.post('/api/activitylist', postCtrl.activitylist);

//comment
router.get('/api/commentlist', postCtrl.commentlist);
router.post('/api/comment', postCtrl.comment);
router.post('/api/like', postCtrl.like);
router.post('/api/report', postCtrl.report);

//user
router.get('/api/user', userCtrl.info);
router.post('/api/subscribe', userCtrl.subscribe);

module.exports = router;
