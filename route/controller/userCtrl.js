/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:53:49+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: userCtrl.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-13T14:19:47+08:00
 */
var mongoose = require('mongoose');
var CircularJSON = require('circular-json');
var UserModel = require("../../models/User")
var PostModel = require("../../models/Post")
var dateFormat = require('dateformat');

const ObjectId = mongoose.Types.ObjectId

function info (req, res) {
  var _id = req.query.user_id
  console.log('user info: ' + JSON.stringify(req.query))
  UserModel.findById(ObjectId(_id), function(err, docs){
      if(err) console.log(err);
      // console.log('user info: ' + JSON.stringify(docs));
      res.json({flag: 'success', data: docs});
    })
}

function profileList (req, res) {

  var Data = req.query
  var currentPage = parseInt(Data.currentPage);
  var option = {
     limit: 10,
     skip: 10 * currentPage,
     sort: {'_id': -1}
   }

  //  console.log('option:' + JSON.stringify(req.query));
   var selected = {
     '_id': 1,
     'subscribed': 1,
     'intro.imgUrls': 1,
     'intro.h': 1,
     'intro.birthDate': 1,
     'intro.gender': 1,
     'intro.weight': 1
   }
   if(Data.type) {
     UserModel.findById(ObjectId(Data.user_id)).populate({path: Data.type, option:option, select: 'intro.nickName avatarUrl intro.gender'}).lean().then(function(docs){
      //  console.log('check: ' + JSON.stringify(docs));
        if(docs){
          res.json({flag: 'success', data: docs})
        } else {
          res.json({flag: 'failed'})
        }
     })
   } else {
     //main page

    //  UserModel.find({ 'intro.gender': req.query.gender }, selected, option, function(err, docs){
     UserModel.find({}, selected, option, function(err, docs){
       if(err) console.log(err);
      //  console.log('?: ' + JSON.stringify(docs));
       res.json({flag: 'success', data: docs})
     }).catch(function(reason){
       console.log(reason);
     })
   }
}

function profile (req, res) {
    UserModel.findById(ObjectId(req.query._id), function(err, docs) {
      if(err) console.log(err);
      res.json({flag: 'success', data: docs})
    })
}

function updateProfile (req, res) {
  var now = new Date();
  // now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
  var _id = req.body.pack.user_id;
  var data = req.body.pack.intro
  console.log('_id:' + _id);
  console.log('profile pack: ' + JSON.stringify(data))
  var intro = {
    gender: data.gender,
    birthDate: data.birthDate,
    nickName: data.nickName,
    h: data.h,
    weight: data.weight,
    imgUrls: data.imgUrls,
    myInfo: data.myInfo,
    myTags: data.myTags,
    sports: data.sports,
    music: data.music,
    food: data.food,
    tv: data.tv,
    book: data.book,
    place: data.place,
    myAns: data.myAns
  }
  UserModel.findByIdAndUpdate(ObjectId(_id), {intro: intro}, function(err,docs) {
    if(err) console.log(err);
    console.log('data.docs: ' + JSON.stringify(docs.intro));
    res.json({flag: 'success', data: docs.intro})
  })
}

function subscribe (req, res) {
  var data = req.body.pack;
  var fromUser_id = data.from_id
  var toUser_id = data.to_id
  UserModel.findByIdAndUpdate(ObjectId(fromUser_id), {$push: {'subscriptions': toUser_id}}, function(err, data) {
    if(err)console.log(err);
    UserModel.findByIdAndUpdate(ObjectId(toUser_id), {$push: {'subscribed': fromUser_id}}, function(err, data2) {
      if(err)console.log(err);
      res.json({flag: 'success'})
    })
  })
}

function unsubscribe (req, res) {
  var data = req.body.pack;
  var fromUser_id = data.from_id
  var toUser_id = data.to_id
  UserModel.findByIdAndUpdate(ObjectId(fromUser_id), {$pull: {'subscriptions': toUser_id}}, function(err, data) {
    if(err)console.log(err);
    UserModel.findByIdAndUpdate(ObjectId(toUser_id), {$pull: {'subscribed': fromUser_id}}, function(err, data2) {
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
  subscribe,
  unsubscribe
}
