/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:48:09+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: Notification.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-01-12T16:29:54+08:00
 */

 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;
 const ObjectId = mongoose.Schema.Types.ObjectId

 var notificationSchema = new Schema({
     from_user: { type: ObjectId, ref: 'User' },
     type: { type: String, default: '' },
     post: { type: ObjectId, ref: 'Post' },
     unRead: { type: Boolean, default: true },
     createdAt: { type: Date, default: Date.now() }
 })
 module.exports = mongoose.model('Notification', notificationSchema);
