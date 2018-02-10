/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-02-10T17:02:10+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: Activity.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-10T17:04:20+08:00
 */

 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;
 const ObjectId = mongoose.Schema.Types.ObjectId

 var activitySchema = new Schema({
   //new or held
     type: {type: String, default: ''},
     address: {type: String, default: ''},
     date: {type: Date, default: Date.now()},
     link: {type: String, default: ''},
     imgUrl: {type: String, default: ''},
     createdAt: { type: Date, default: Date.now() }
 })
 module.exports = mongoose.model('Activity', activitySchema);
