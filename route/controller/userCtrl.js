/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:53:49+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: userCtrl.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-10T17:23:48+08:00
 */
var mongoose = require('mongoose');
var CircularJSON = require('circular-json');
var UserModel = require("../../models/User")
var PostModel = require("../../models/Post")
var dateFormat = require('dateformat');

const ObjectId = mongoose.Types.ObjectId

function info (req, res) {
  var _id = req.query.user_id
  // console.log('data: ' + JSON.stringify(_id));
  UserModel.findById(ObjectId(_id), function(err, docs){
      if(err) console.log(err);
      // console.log('user info: ' + JSON.stringify(docs));
      res.json({flag: 'success', data: docs});
    })
}

function profileList (req, res) {
  var currentPage = parseInt(req.query.currentPage);
  var option = {
     limit: 10,
     skip: 10 * currentPage,
     sort: {'_id': -1}
   }
   // console.log('option:' + JSON.stringify(option));
   UserModel.find({ gender: req.query.gender }, {}, option, function(err, data){
     if(err) console.log(err);
     // console.log('data after popluation: ' + JSON.stringify(data));
     res.json(data)
   }).catch(function(reason){
     console.log(reason);
   })
}

function profile (req, res) {
    UserModel.findById(ObjectId(data.post_id), function(err, data) {
      if(err) console.log(err);
      res.json(data)
    })
}

function updateProfile (req, res) {
  var now = new Date();
  // now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
  var data = req.body.pack;
  var userEntity = new UserModel({
    type: data.type,
    value0: data.value0,
    value1: data.value1,
    additional: data.additional,
    from_user: data.user_id,
    lang: data.lang,
    createdAt: now
  })
  userEntity.save(function(err, docs1){
      if(err) console.log(err);
      res.json({flag: 'success'})
  })
}

function subscribe (req, res) {
  var data = req.body.pack;
  var fromUser_id = data.from_id
  var toUser_id = data.to_id
  UserModel.findByIdAndUpdate(ObjectId(fromUser_id), {subscriptions: toUser_id}, function(err, data) {
    if(err)console.log(err);
    UserModel.findByIdAndUpdate(ObjectId(toUser_id), {subscribedBy: fromUser_id}, function(err, data2) {
      if(err)console.log(err);
      res.json({flag: 'success'})
    })
  })
}
module.exports = {
  info,
  profileList,
  profile,
  updateProfile,
  subscribe
}
