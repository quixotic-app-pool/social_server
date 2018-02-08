/**
 * @Author: MichaelChen <mymac>
 * @Date:   2018-01-03T13:54:37+08:00
 * @Email:  teacherincafe@163.com
 * @Project: one_server
 * @Filename: questionCtrl.js
 * @Last modified by:   mymac
 * @Last modified time: 2018-01-29T17:52:24+08:00
 */


var mongoose = require('mongoose');
var CircularJSON = require('circular-json');
var PostModel = require("../../models/Post")
var UserModel = require("../../models/User")
var NotficationModel = require('../../models/Notification')
var dateFormat = require('dateformat');
const ObjectId = mongoose.Types.ObjectId

function fetchList (req, res) {
  // var temp = new UserModel({
  //   name: 'michael',
  //   avatar: 'my avatar'
  // })
  // temp.save()
  console.log('fetching list...');
  // console.log(JSON.stringify(req.query));
  // console.log('req.query.by: ' + req.query.by);
  var by = req.query.by;
   //all
   if( by == 'all' ) {
    //  console.log('all');
     var currentPage = parseInt(req.query.currentPage);
     //
    //  console.log('currentPage: ' + typeof currentPage);
     var option = {
        limit: 10,
        skip: 10 * currentPage,
        sort: {'_id': -1}
      }
      // console.log('option:' + JSON.stringify(option));
      PostModel.find({ type: { $ne: 'reply' } }, {}, option).populate({path: 'from_user', select: 'nickName avatarUrl gender points position'}).exec().then(function(data){
        // console.log('data after popluation: ' + JSON.stringify(data));
        res.json(data)
      }).catch(function(reason){
        console.log(reason);
      })
   } else if(by == 'type') {
    //  console.log('type');
       var type = req.query.type;
       var currentPage = req.query.currentPage;
       var option = {
          limit: 10,
          skip: 10 * currentPage,
          sort: {'_id': -1}
        }
       PostModel.find({type: type}, {}, option).populate({path: 'from_user', select: 'nickName avatarUrl gender points position'}).exec().then(function(data){
        //  console.log('data after popluation: ' + JSON.stringify(data));
         res.json(data)
       }).catch(function(reason){
         console.log(reason);
       })
   } else if( by == 'user') {
    //  console.log('user');
    //  console.log(JSON.stringify(req.query));
     var user_id = req.query.user_id;
     var page = req.query.currentPage;
     var type = req.query.type;
     var option = {
        limit: 10,
        skip: 10 * page,
        sort: {'_id': -1}
      }
      // console.log('type？ : ' + type);
      UserModel.findById(ObjectId(user_id)).populate({path: type, options: option, populate: {path: 'from_user', select: 'nickName avatarUrl gender points position'}}).lean().then(function(data){
        // console.log('inside query');
        console.log(type+ ': ' + docs[type]);
        var docs = data[type]
        docs.forEach(function(item){
          if(item.type == 'reply') {
            item.numOfBM = item.bookmarkedBy.length
            item.numOfLike = item.likedBy.length
            item.bookmarkedBy = []
            item.likedBy = []
          }
        })

        console.log('docs: ' + JSON.stringify(docs));
        res.json(docs);
      })
   }
}

function fetch (req, res) {
    var data = req.query
    // console.log('where is id: ' + JSON.stringify(req.query));
    //lean()是一个坑的解决办法，mongoose返回的object被封装，无法做修改，lean可以解锁
    PostModel.findById(ObjectId(data.post_id)).populate([{path: 'from_user', select: 'nickName avatarUrl gender points position'}, {path: 'reply', populate: {path: 'from_user', select: 'nickName avatarUrl gender points position'}}]).lean().then(function(docs){
      // console.log('data after popluation: ' + JSON.stringify(data));
      console.log('fetching test: ' + docs);
      if(docs) {

        docs.numOfBM = docs.bookmarkedBy.length
        docs.numOfLike = docs.likedBy.length

        docs.reply.forEach(function(item) {
          item.numOfBM = item.bookmarkedBy.length
          item.numOfLike = item.likedBy.length
        })

        var result;
        result = docs.bookmarkedBy.find(function(item) {
          return item == data.user_id
        })
        //这边把bookmarkedby做修改，一个是方便前台做判断，第二个当大量用户bookmark的时候不用向前台传递大量无用信息
        if(result){
          docs.bookmarkedBy = true
        } else {
          docs.bookmarkedBy = false
        }
        //reply中bookmark的修改
        docs.reply.forEach(function(item) {
          result = item.bookmarkedBy.find(function(item) {
            return item == data.user_id
          })
          if(result){
            item.bookmarkedBy = true
          } else {
            item.bookmarkedBy = false
          }
        })

        result = docs.likedBy.find(function(item) {
          return item == data.user_id
        })
        //这边把likedby做修改，一个是方便前台做判断，第二个当大量用户bookmark的时候不用向前台传递大量无用信息
        if(result){
          docs.likedBy = true
        } else {
          docs.likedBy = false
        }
        //reply中likedby的修改
        docs.reply.forEach(function(item) {
          result = item.likedBy.find(function(item) {
            return item == data.user_id
          })
          if(result){
            item.likedBy = true
          } else {
            item.likedBy = false
          }
        })
        // console.log('reply: ' + JSON.stringify(docs));
        res.json(docs)
      } else {
        res.json({flag: 'fail'})
      }
    }).catch(function(reason){
      console.log(reason);
    })
}

function post (req, res) {
  var now = new Date();
  // now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
  var data = req.body.pack;
  var postEntity = new PostModel({
    type: data.type,
    value0: data.value0,
    value1: data.value1,
    additional: data.additional,
    from_user: data.user_id,
    lang: data.lang,
    createdAt: now
  })
  postEntity.save(function(err, docs1){
      if(err) console.log(err);
      // console.log(JSON.stringify(docs));
      UserModel.findByIdAndUpdate(ObjectId(data.user_id), {$push: {'questions': docs1._id}}, function (err, docs2) {
        if(err)console.log(err);
        res.json({flag: 'success', post_id: docs1._id})
      })
  })
}

function edit (req, res) {
  console.log('going to edit...');
  var now = new Date();
  // now = dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT")
  var data = req.body.pack;

  PostModel.findByIdAndUpdate(ObjectId(data.post_id), {value0: data.value0, value1: data.value1, additional: data.additional, lang: data.lang, createdAt: now}, function(err, docs) {
    if(err)console.log(err);
    res.json({flag: 'success', post_id: docs._id})
  })
}

function featureclose (req, res) {
  var Data = req.body.pack;
  // console.log('0');
  if(Data.closeOnly) {
    PostModel.findByIdAndUpdate(ObjectId(Data.post_id), {closed: Data.closed}, function(err, data) {
      if(err)console.log(err);
      // TODO: notify user
      console.log('closeonly');
      res.json({flag: 'success'})
    })
  } else {
    PostModel.findByIdAndUpdate(ObjectId(Data.post_id), {closed: Data.closed, featuredApplied: true}, function(err, docs1) {
      if(err)console.log(err);
      // console.log('1');
      PostModel.findByIdAndUpdate(ObjectId(Data.feature_id), {featured: true}, function(err, docs2) {
        if(err)console.log(err);
        // console.log('Data.feature_id: ' + Data.feature_id);
        UserModel.findByIdAndUpdate(ObjectId(docs2.from_user), {$push: {'featuredAns': Data.feature_id}, $inc: {'points': 1}}, function(err, docs3) {
          if(err)console.log(err);
          // console.log('feature?: ' + JSON.stringify(docs3));
          var now = new Date();
          var notificationEntity = new NotficationModel({
            from_user: Data.user_id,
            type: 'feature',
            post: Data.post_id,
            unRead: true,
            createdAt: now
          })
          notificationEntity.save(function(err, docs4) {
            if(err)console.log(err);
            UserModel.findByIdAndUpdate(ObjectId(docs2.from_user), {$push: {'notifications': docs4._id}}, function(err, docs5){
              if(err)console.log(err);
              res.json({flag: 'success'})
            })
          })
        })
      })
    })
  }
}

function del (req, res) {
  var pack = req.body.pack;
  console.log('going to delete');
  PostModel.findByIdAndRemove( ObjectId(pack.post_id), function(err, data) {
     if (err)console.log(err);
     console.log('delete done, lets check');
     PostModel.findByIdAndUpdate(ObjectId(pack.question_id), {$pull: {'reply': pack.post_id}}, function(err, data) {
       if(err)console.log(err);
      // TODO: 这里有一个坑，就是当母问题被删，跟起相关联的收藏，点赞等数据怎么处理，如果一次性更新工作量很大，现在想到的最好办法就是
      //当用户点击指定问题发现无法获取的时候后台检查并删除和更新相对应记录，这样可以分散工作量！
       console.log(JSON.stringify(data));
       res.json({flag: 'success'})
     })
   })
}

function answer (req, res) {
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
  // console.log('bookmark: ' + Data.user_id);
  if(Data.likedBy) {
    PostModel.findByIdAndUpdate(ObjectId(Data.post_id), {$pull: {'likedBy': Data.user_id}}, function(err, data) {
      if(err)console.log(err);
      if(data){
        UserModel.findByIdAndUpdate(ObjectId(Data.user_id), {$pull: {'likes': Data.post_id}}, function (err, data) {
          if(err) console.log(err);
          res.json({flag: 'success'})
        })
      }
    })
  } else {
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
}

function bookmark (req, res) {
  var Data = req.body.pack
  // console.log('bookmark: ' + Data.user_id);
  if(Data.bookmarked) {
    PostModel.findByIdAndUpdate(ObjectId(Data.post_id), {$pull: {'bookmarkedBy': Data.user_id}}, function(err, data) {
      if(err)console.log(err);
      if(data){
        UserModel.findByIdAndUpdate(ObjectId(Data.user_id), {$pull: {'bookmarks': Data.post_id}}, function (err, data) {
          if(err) console.log(err);
          res.json({flag: 'success'})
        })
      }
    })
  } else {
    PostModel.findByIdAndUpdate(ObjectId(Data.post_id), {$push: {'bookmarkedBy': Data.user_id}}, function(err, data) {
      if(err)console.log(err);
      if(data){
        UserModel.findByIdAndUpdate(ObjectId(Data.user_id), {$push: {'bookmarks': Data.post_id}}, function (err, data) {
          if(err) console.log(err);
          // console.log('user data: ' + JSON.stringify(data));
          if(data) {
            res.json({flag: 'success'})
          }
        })
      }
    })
  }
}

function report (req, res) {
  console.log(JSON.stringify(req.body.pack));
  var to_id = req.body.pack.to_id;
  var from_user_id = req.body.pack.from_user_id;
  PostModel.findByIdAndUpdate(ObjectId(to_id), { $push: { "reportedBy": from_user_id }}, function(err, data){
    if(err)console.log(err);
    res.json({flag: 'success'})
  })
}

function enableOrDisable (req, res) {
  var to_id = req.body.to_id;
  var onOrOff = req.body.update
  PostModel.findByIdAndUpdate(ObjectId(to_id), { "notificationIsOn": onOrOff }, function(err, data){
    if(err)console.log(err);
    res.json({succss: 'ok'})
  })
}
module.exports = {
  fetchList,
  fetch,
  post,
  edit,
  featureclose,
  del,
  answer,
  like,
  bookmark,
  report,
  enableOrDisable
}
