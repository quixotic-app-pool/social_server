/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-02-10T17:04:49+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: activityCtrl.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-10T18:03:25+08:00
 */

 var mongoose = require('mongoose');
 var CircularJSON = require('circular-json');
 var UserModel = require("../../models/User")
 var PostModel = require("../../models/Post")
 var dateFormat = require('dateformat');

 const ObjectId = mongoose.Types.ObjectId
 var ActivityModel = require("../../models/Activity")

 function activityList (req, res) {
   var currentPage = parseInt(req.query.currentPage);
   var option = {
      limit: 10,
      skip: 10 * currentPage,
      sort: {'_id': -1}
    }
    // console.log('option:' + JSON.stringify(option));
    ActivityModel.find({ type: req.query.type }, {}, option, function(err, data){
      if(err) console.log(err);
      // console.log('data after popluation: ' + JSON.stringify(data));
      res.json(data)
    }).catch(function(reason){
      console.log(reason);
    })
 }

 module.exports = {
   activityList
 }
