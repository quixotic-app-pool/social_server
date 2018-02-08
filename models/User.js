/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:48:26+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: User.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-08T14:54:06+08:00
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId

var userSchema = new Schema({
    oId: { type: String, default: ''},
    avatarUrl: { type: String, default: ''},
    posts: [{ type: ObjectId,ref: 'Post' }],
    comments: [{ type: ObjectId,ref: 'Post' }],
    notifications: [{ type: ObjectId,ref: 'Notification' }],
    likePosts: [{ type: ObjectId,ref: 'Post' }],
    likeComments:[{ type: ObjectId,ref: 'Post' }],
    subscriptions: [{ type: ObjectId,ref: 'User' }],
    intro: {
      gender: { type: String, default: ''},
      age: { type: String, default: ''},
      xingZuo: { type: String, default: ''},
      nichName: { type: String, default: ''},
      h: { type: String, default: ''},
      weight: { type: String, default: ''},
      imgUrls: [{ type: String, default: ''}],
      timeline_imgUrls: [{ type: String, default: ''}],
       myInfo: [{title: {type: String, default: ''}, value: {type: String, default: ''}}],
       myTags: [{type: String, default: ''}],
       sports: [{type: String, default: ''}],
       music: [{type: String, default: ''}],
       food: [{type: String, default: ''}],
       tv: [{type: String, default: ''}],
       book: [{type: String, default: ''}],
       place: [{type: String, default: ''}],
       myAns: [{title: {type: String, default: ''}, value: {type: String, default: ''}}]
    }
    createdAt: { type: Date, default: Date.now() }
})
module.exports = mongoose.model('User', userSchema);
