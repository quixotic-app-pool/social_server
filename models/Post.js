/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:48:16+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: Question.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-11T14:54:51+08:00
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId

var postSchema = new Schema({
    type: { type: String, default: '' },
    likedBy: [{ type: ObjectId, ref: 'User' }],
    imgUrls: [{type: String, default: ''}],
    msg: { type: String, default: '' },
    location: { type: String, default: '' },
    latitude: { type: String, default: '' },
    longitude: { type: String, default: '' },
    from_user: { type: ObjectId, ref: 'User' },
    to_post: { type: ObjectId, ref: 'Post'},
    comments: [{ type: ObjectId, ref: 'Post'}],
    sharedBy: [{ type: ObjectId, ref: 'User' }],
    reportedBy: [{ type: ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now() }
})
module.exports = mongoose.model('Post', postSchema);
