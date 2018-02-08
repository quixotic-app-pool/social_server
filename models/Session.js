/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-15T14:34:15+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: Session.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-01-15T16:45:03+08:00
 */

 var mongoose = require('mongoose');
 var Schema = mongoose.Schema;
 const ObjectId = mongoose.Schema.Types.ObjectId

 var sessionSchema = new Schema({
   sessionId: { type: String, default: ''},
   session_key: { type: String, default: ''},
   openid: { type: String, default: '' },
   createdAt: { type: Date, default: Date.now() }
 })
 module.exports = mongoose.model('Session', sessionSchema);
