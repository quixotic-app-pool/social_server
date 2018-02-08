/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:53:49+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: userCtrl.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-01-11T17:12:11+08:00
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

function like (req, res) {
  var _id = req.body._id;
  var from_user_id = req.body.from_user_id;
  var like = req.body.like;
  PostModel.findByIdAndUpdate(ObjectId(_id), { $inc: { "numOfLike": like } }, function(err, docs) {
    if(err)console.log(err);
    UserModel.findByIdAndUpdate(ObjectId(from_user_id), {$push: { "numOfLike": docs._id }}, function(err, data){
      if(err)console.log(err);
      res.json({succss: 'ok'})
    })
  })
}

function bookmark (req, res) {
  var _id = req.body._id;
  var from_user_id = req.body.from_user_id;
  UserModel.findByIdAndUpdate(ObjectId(from_user_id), {$push: { "bookmarks": _id }}, function(err, data){
    if(err)console.log(err);
    res.json({succss: 'ok'})
  })
}

module.exports = {
  info,
  bookmark
}
