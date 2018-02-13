/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:48:26+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: User.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-13T13:17:51+08:00
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
    likes: [{ type: ObjectId,ref: 'Post' }],
    subscriptions: [{ type: ObjectId,ref: 'User' }],
    subscribed: [{ type: ObjectId,ref: 'User' }],
    intro: {
      gender: { type: String, default: ''},
      birthDate: { type: String, default: ''},
      nickName: { type: String, default: ''},
      h: { type: String, default: ''},
      weight: { type: String, default: ''},
      imgUrls: [{ type: String, default: ''}],
      myInfo: {
        行业: { type: String, default: ''},
        工作领域: { type: String, default: ''},
        公司: { type: String, default: ''},
        来自: { type: String, default: ''},
        经常出没: { type: String, default: ''},
        个人签名: { type: String, default: ''}
      },
      myTags: [{type: String, default: ''}],
      sports: [{type: String, default: ''}],
      music: [{type: String, default: ''}],
      food: [{type: String, default: ''}],
      tv: [{type: String, default: ''}],
      book: [{type: String, default: ''}],
      place: [{type: String, default: ''}],
      myAns: [{title: {type: String, default: ''}, value: {type: String, default: ''}}]
    },
    createdAt: { type: Date, default: Date.now() }
})
module.exports = mongoose.model('User', userSchema);
