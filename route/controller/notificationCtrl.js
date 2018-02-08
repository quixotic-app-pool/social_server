/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:54:30+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: notificationCtrl.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-01-28T18:32:37+08:00
 */

var CircularJSON = require('circular-json');
var NotificationModel = require("../../models/Notification")
var UserModel = require("../../models/User")
var dateFormat = require('dateformat');
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId

function fetchNum (req, res) {
  var user_id = req.query.user_id;
  UserModel.findById(ObjectId(user_id)).populate({path: 'notifications', select: 'unRead -_id'}).then(function(data){
    // console.log("fetching notifications num: " + JSON.stringify(data.notifications));
    var num = 0;
    data.notifications.forEach(function(item) {
      if(item.unRead == true) {
        num++
      }
    })
    // console.log(num);
    res.json({flag:'success', numOfNotif: num})
  })

}

function fetchList (req, res) {
  console.log('fetching notifications...');
  var user_id = req.query.user_id;
  var page = req.query.currentPage;
  var option = {
     limit: 10,
     skip: 10 * page,
     sort: {'_id': -1}
   }
  //  console.log(JSON.stringify(req.query));
  UserModel.findById(ObjectId(user_id)).populate({path: 'notifications', options: option, populate: [{path: 'from_user', select: 'nickName avatarUrl gender'}, {path: 'post'}]}).then(function(data){
    // console.log('inside：' + JSON.stringify(data));
    var cleanedData = data.notifications.filter(function(item) {
      if(!item.post) {
        NotificationModel.findByIdAndRemove(ObjectId(item._id), function(err,data) {
          // console.log('after removing: ' + data)
        })
        return false
      }
      return true
    })
    res.json(cleanedData)
  })
}

function update (req, res) {
  var _id = req.body._id
  NotificationModel.findByIdAndUpdate( ObjectId(_id), {unRead: false}, function(err, docs){
    if(err) {
      console.log(err);
    } else {
      res.json({flag: 'success'});
    }
  })
}

module.exports = {
  fetchNum,
  fetchList,
  update
}
