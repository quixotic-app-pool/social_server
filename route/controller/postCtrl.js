/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:54:37+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: questionCtrl.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-02-13T14:06:01+08:00
 */

var mongoose = require('mongoose');
var CircularJSON = require('circular-json');
var PostModel = require("../../models/Post")
var UserModel = require("../../models/User")
var NotficationModel = require('../../models/Notification')
var dateFormat = require('dateformat');
var co = require('co');
const ObjectId = mongoose.Types.ObjectId

function fetchList (req, res) {
  var data = req.query;
   //all
   if( data.type == 'post' ) {
     var currentPage = parseInt(data.currentPage);

    //  console.log('currentPage: ' + currentPage);
     var option = {
        limit: 10,
        skip: 10 * currentPage,
        sort: {'_id': -1}
      }
      // console.log('data.user_id' + data.user_id);
      UserModel.findById(ObjectId(data.user_id), function(err, docs) {
        if(err) console.log(err);
        // console.log('docs.subscriptions: '  + docs.subscriptions);
        if(docs) {
          PostModel.find({ from_user: { $in: docs.subscriptions }, type: 'post' }, {}, option).populate({path: 'from_user', select: 'intro.nickName avatarUrl intro.gender'}).then(function(docs2) {
            // console.log('docs2: ' + JSON.stringify(docs2))
            res.json({flag: 'success', data: docs2})
          })
        } else {
          res.json({flag: 'failed'})
        }
      })
   }  else if( data.type == 'comment' ) {
    //  console.log('going to fetch comment');
     var currentPage = parseInt(req.query.currentPage);
     var option = {
        limit: 10,
        skip: 10 * currentPage,
        sort: {'_id': -1}
      }
      PostModel.findById(ObjectId(data.post_id)).populate({path: 'comments', option:option, populate: {path: 'from_user', select: 'intro.nickName avatarUrl intro.gender'}}).lean().then(function(docs){
        // console.log('here I am going to fetch comment list: ' + JSON.stringify(docs))
        res.json({flag: 'success', data: docs.comments})
      }).catch(function(reason){
        console.log(reason);
      })

   } else if( data.type == 'user') {
    //  console.log('user');
    // console.log("fetching user's post");
    //  console.log(JSON.stringify(req.query));
     var user_id = req.query.user_id;
     var page = req.query.currentPage;
     var subType = req.query.subType;
     var matchType = req.query.matchType;
     var option = {
        limit: 10,
        skip: 10 * page,
        sort: {'_id': -1}
      }
      UserModel.findById(ObjectId(user_id)).populate({path: subType, match: {type: matchType}, option:option, populate: {path: 'from_user', select: 'intro.nickName avatarUrl intro.gender'}}).lean().then(function(docs){
        // console.log('here I am going to fetch something: ' + JSON.stringify(docs))
        res.json({flag: 'success', data: docs[subType]})
      }).catch(function(reason){
        console.log(reason);
      })
   }
}

function fetchPost (req, res) {
    var data = req.query
    // console.log('where is id: ' + JSON.stringify(req.query));
    //lean()是一个坑的解决办法，mongoose返回的object被封装，无法做修改，lean可以解锁
    PostModel.findById(ObjectId(data.post_id)).populate([{path: 'from_user', select: 'intro.nickName avatarUrl intro.gender'}, {path: 'comments', populate: {path: 'from_user', select: 'intro.nickName avatarUrl intro.gender'}}]).lean().then(function(docs){
      // console.log('here I am going to fetch post detail: ' + JSON.stringify(docs))
      res.json({flag: 'success', data: docs})
      // if(docs) {
      //   docs.numOfLike = docs.likedBy.length
      //
      //   docs.comments.forEach(function(item) {
      //     item.numOfLike = item.likedBy.length
      //   })
      //
      //   result = docs.likedBy.find(function(item) {
      //     return item == data.user_id
      //   })
      //   //这边把likedby做修改，一个是方便前台做判断，第二个当大量用户bookmark的时候不用向前台传递大量无用信息
      //   if(result){
      //     docs.likedBy = true
      //   } else {
      //     docs.likedBy = false
      //   }
      //   //reply中likedby的修改
      //   docs.reply.forEach(function(item) {
      //     result = item.likedBy.find(function(item) {
      //       return item == data.user_id
      //     })
      //     if(result){
      //       item.likedBy = true
      //     } else {
      //       item.likedBy = false
      //     }
      //   })
      //   // console.log('reply: ' + JSON.stringify(docs));
      //   res.json(docs)
      // } else {
      //   res.json({flag: 'fail'})
      // }
    }).catch(function(reason){
      console.log(reason);
    })
}

function newPost (req, res) {
  var now = new Date();
  // now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
  // console.log('new post coming...');
  var data = req.body.pack;
  console.log('from_user comment: ' + JSON.stringify(data))
  var postEntity = new PostModel({
    type: data.type,
    from_user: data.user_id,
    to_post: data.to_post,
    msg: data.content,
    imgUrls: data.images,
    location: data.location,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: now
  })
  postEntity.save(function(err, docs1){
      if(err) console.log(err);
      // console.log('check: ' + JSON.stringify(docs1));
      if(data.type == 'comment') {
        UserModel.findByIdAndUpdate(ObjectId(data.user_id), {$push: {'comments': docs1._id}}, function (err, docs2) {
          if(err)console.log(err);
          PostModel.findByIdAndUpdate(ObjectId(data.to_post), {$push: {'comments': docs1._id}}, function (err, docs3) {
            if(err)console.log(err);
            res.json({flag: 'success'})
          })
        })
      } else if(data.type == 'post') {
        UserModel.findByIdAndUpdate(ObjectId(data.user_id), {$push: {'posts': docs1._id}}, function (err, docs2) {
          if(err)console.log(err);
          res.json({flag: 'success'})
        })
      }

  })
}

function delPost (req, res) {
  var pack = req.body.pack;
  if(pack.type == 'post') {
    PostModel.findByIdAndRemove( ObjectId(pack.post_id), function(err, data) {
       if (err)console.log(err);
       res.json({flag: 'success'})
     })
  } else if(pack.type == 'comment') {
    PostModel.findByIdAndRemove( ObjectId(pack.post_id), function(err, data) {
       if (err)console.log(err);
      //  data.imgUrls.forEach(function(item){
      //    co(function* () {
      //       var result = yield client.delete(item);
      //       console.log(result);
      //     }).catch(function (err) {
      //       console.log(err);
      //     });
      //  })
       PostModel.findByIdAndUpdate(ObjectId(pack.parent_id), {$pull: {'comments': pack.post_id}}, function(err, data) {
         if(err)console.log(err);
         res.json({flag: 'success'})
       })
     })
  }
}

function comment (req, res) {
  var now = new Date();
  // now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
  var Data = req.body.pack;
  // to_post: data.post_id,
  var postEntity = new PostModel({
    type: Data.type,
    value0: Data.value0,
    from_user: Data.from_user_id,
    to_post: Data.post_id,
    createdAt: now
  })
  postEntity.save(function(err, docs1){
      if(err) console.log(err);
      PostModel.findByIdAndUpdate(ObjectId(Data.post_id), { $push: { "reply": docs1._id }}, function(err, docs2){
        if(err)console.log(err);
        UserModel.findByIdAndUpdate(ObjectId(Data.from_user_id), {$push: {'answers': docs1._id}}, function(err, docs3){
          // notification set
          if(err)console.log(err);
          var notificationEntity = new NotficationModel({
            from_user: Data.from_user_id,
            type: Data.type,
            post: Data.post_id,
            unRead: true,
            createdAt: now
          })
          notificationEntity.save(function(err, docs) {
            if(err)console.log(err);
            UserModel.findByIdAndUpdate(ObjectId(docs2.from_user), {$push: {'notifications': docs._id}}, function(err, data){
              if(err)console.log(err);
              res.json({flag: 'success', post_id: docs2._id})
            })
          })
        })
      })
  })
}

function like (req, res) {
  var Data = req.body.pack
  // console.log('gogint to add like : ' + JSON.stringify(Data));
  //cannot cancel like now
  PostModel.findByIdAndUpdate(ObjectId(Data.post_id), {$push: {'likedBy': Data.user_id}}, function(err, docs1) {
    if(err)console.log(err);
    if(docs1){
      UserModel.findByIdAndUpdate(ObjectId(Data.user_id), {$push: {'likes': Data.post_id}}, function (err, docs2) {
        if(err) console.log(err);
        // console.log('user data: ' + JSON.stringify(data));
        if(docs2) {
          var now = new Date();
          var notificationEntity = new NotficationModel({
            from_user: Data.user_id,
            type: 'like',
            post: Data.post_id,
            unRead: true,
            createdAt: now
          })
          notificationEntity.save(function(err, docs3) {
            if(err)console.log(err);
            UserModel.findByIdAndUpdate(ObjectId(docs1.from_user), {$push: {'notifications': docs3._id}}, function(err, docs4){
              if(err)console.log(err);
              res.json({flag: 'success'})
            })
          })
        }
      })
    }
  })
}

function report (req, res) {
  var to_id = req.body.pack.to_id;
  var from_user_id = req.body.pack.from_user_id;
  PostModel.findByIdAndUpdate(ObjectId(to_id), { $push: { "reportedBy": from_user_id }}, function(err, data){
    if(err)console.log(err);
    res.json({flag: 'success'})
  })
}

module.exports = {
  fetchList,
  fetchPost,
  newPost,
  delPost,
  comment,
  like,
  report
}
