const asyncHandle = require('express-async-handler')
const Sweet = require("../model/Sweet");
const User = require("../model/User")
const formatResponse = require('../common/ResponseFormat');
const { set } = require('mongoose');
const Comment = require('../model/Comment');
const { query } = require('express');
const { create_Comment } = require('./CommentController');
const Share = require('../model/Share');

const { uploadImage } = require('../config/cloudinaryConfig');
const { upload } = require('./AuthController');
const UploadImageMiddleware = require('../middleware/UploadImageMiddleware');

const moment = require("moment-timezone");
const path = require('path');
const { createNotification } = require('./NotifyController');
moment.tz('Asia/Ho_Chi_Minh')


const create_Sweet = asyncHandle(async (req, res) => {

  const user_id = req.user.userId;
  // const user_id = req.body.user_id;
  const content = req.body.content;
  const image = req.files && await uploadImage(req.files);

  try {
    const createNew = await Sweet.create({
      user_id: user_id,
      content: content,
      image: image,
    });

    const data = {

      User: await getDisplayName_By_ID(createNew.user_id),
      Content: createNew.content,
      Image: createNew.image.map(i => i.toString()),
      CreateAt: moment(createNew.created_at).format(),
      QuantityLike: createNew.likes.length,
      QuantityComment: createNew.comments.length,
      QuantityShare: createNew.shares.length,

    };

    return res.status(200).json(formatResponse(data, true, "Tạo bài viết thành công"));
  } catch (error) {
    console.log(error)
    return res.status(400).json(formatResponse(null, false, "Lỗi khi tạo bài viết!"));
  }

});

async function getDisplayName_By_ID(id) {
  const use = await User.findById(id);
  if (!use) {
    console.log("Không tìm thấy User!");
    return null;
  }
  else if (use.displayName === null) {
    return use.username;
  }
  else if (use.username === null) {
    return use.displayName;
  }
  return {
    _id: use._id,
    DisplayName: use.displayName,
    UserName: use.username,
  }
}

async function get_Sweet_By_Id(id) {
  try {
    const sweet = await Sweet.findById(id)
      .populate('user_id', 'displayName username')
      .populate('likes', 'displayName username')
      .populate('shares', 'displayName username');

    const share = await Share.findById(id)
      .populate('user_id', 'displayName username')
      .populate('likes', 'displayName username')

    if(sweet){
      console.log('Đối tượng Sweet được tìm thấy:', sweet);
      return sweet;
    }else if(share){
      console.log('Đối tượng Share được tìm thấy:', share);
      return share;
    }else{
      console.log('Ko tìm thấy bài viết');
      return null;
    }
    
  } catch (error) {
    console.error('Lỗi khi lấy đối tượng Sweet:', error.message);
    return null;
  }
}

const update_Sweet = asyncHandle(async (req, res) => {

  const sweet_id = req.params.SweetID;

  const content = req.body.content;
  const image = await uploadImage(req.files);

  const sweet = await Sweet.findById(sweet_id);

  try {
    if (!sweet) {
      console.log("Không thấy bài viết!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));
    }

    try {
      if (sweet.updated_at == null) {

        const content_History = sweet.content;
        const image_History = sweet.image;
        const updated_History = sweet.created_at;

        const historyUpdate = {
          content: content_History,
          images: image_History,
          updated_at: updated_History,
        };

      } else {

        const content_History = sweet.content;
        const image_History = sweet.image;
        const updated_History = sweet.updated_at;

        const historyUpdate = {
          content: content_History,
          images: image_History,
          updated_at: updated_History,
        };

        const addDataToHistory = await Sweet.findByIdAndUpdate(sweet_id, { $push: { edit_history: historyUpdate } }); // , { new: true }

        if (!!req.files && req.files?.length>0)
        {
          await Sweet.findByIdAndUpdate(sweet_id, { $set: { content: content, image: image, updated_at: new Date() } });
        } else {
           await Sweet.findByIdAndUpdate(sweet_id, { $set: { content: content, updated_at: new Date() } });

        }

      }
    } catch (error) {
      return res.status(400).json(formatResponse(null, false, "Lỗi khi cập nhật bài viết!"));
    }


    const sweetAfterUpdate = await get_Sweet_By_Id(sweet_id);

    if (sweetAfterUpdate) {
      console.log('Đối tượng Sweet mới:', sweetAfterUpdate);
      sweetAfterUpdate
    } else {
      console.log('Không tìm thấy đối tượng Sweet.');
    }

    const data = {
      _id: sweet_id,
      UserID: await getDisplayName_By_ID(sweetAfterUpdate.user_id),
      Content: sweetAfterUpdate.content,
      Image: sweetAfterUpdate.image.map(i => i.toString()),
      QuantityLike: sweetAfterUpdate.likes.length,
      QuantityComment: sweetAfterUpdate.comments.length,
      QuantityShare: sweetAfterUpdate.shares.length,
      CreateAt: moment(sweetAfterUpdate.created_at).format(),
      UpdateAt: moment(sweetAfterUpdate.updated_at).format()
    };

    return res.status(200).json(formatResponse(data, true, "Sửa đổi thành công"));
  } catch (error) {
    console.log("Error", error.message)
    return res.status(400).json(formatResponse(null, false, "Sửa đổi thất bại!"));
  }
});

const get_History_Update_Sweet = asyncHandle(async (req, res) => {
  const sweet_id = req.query.SweetID;

  const sweet = await Sweet.findById(sweet_id);
  const share = await Share.findById(sweet_id);

  
  

  try {
    if(sweet){
      const edit_historySweet = sweet.edit_history;
      let list_History_Update = [];
      const now = moment();
    
    
      for (let i = edit_historySweet.length - 1; i >= 0; i--) {
        const content = edit_historySweet[i].content;
        const images = edit_historySweet[i].images;
        const updated_at = moment(edit_historySweet[i].updated_at);
        const durationByText = await formatTimeDifference(updated_at, now);
    
        list_History_Update.push({Content: content,Image: images, Duration: durationByText, UpdateAt: moment(updated_at).format("HH:mm - DD/MM/YYYY")});
      }
    
      const data = {
        UpdateNumber: edit_historySweet.length,
        History_Update: list_History_Update,
      }
      return res.status(200).json(formatResponse(data, true, "Đã lấy được danh sách lịch sử chỉnh sửa bài viết"));
  
    }else if(share){
      const edit_historyShare = share.edit_history;
      let list_History_Update = [];
      const now = moment();
    
    
      for (let i = edit_historyShare.length - 1; i >= 0; i--) {
        const content = edit_historyShare[i].content;
        const images = edit_historyShare[i].images;
        const updated_at = moment(edit_historyShare[i].updated_at);
        const durationByText = await formatTimeDifference(updated_at, now);
    
        list_History_Update.push({Content: content,Image: images, Duration: durationByText, UpdateAt: moment(updated_at).format("HH:mm - DD/MM/YYYY")});
      }
    
      const data = {
        UpdateNumber: edit_historyShare.length,
        History_Update: list_History_Update,
      }
      return res.status(200).json(formatResponse(data, true, "Đã lấy được danh sách lịch sử chỉnh sửa bài Share"));
    }else{
      console.log("Không thấy bài viết!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));
    }

  } catch (error) {
    return res.status(400).json(formatResponse(null, false, "Lỗi khi lấy lịch sử chỉnh sửa!"));
  }


})

async function delete_Sweet_By_ID(id) {
  try {
    const sweet = await Sweet.findByIdAndDelete(id);
    if (!sweet) {
      console.log("Không tìm thấy bài viết");
      return null;
    }
    console.log("Bài viết đã xóa!!");
  } catch (error) {
    console.log("Lỗi khi xóa bài viết", error.message);
  }
}

const deleted_Sweet = asyncHandle(async (req, res) => {

  const sweet_id = req.params.SweetID;

  const sweet = await Sweet.findById(sweet_id);
  const share = await Share.findById(sweet_id);
  try {
    if(sweet){
      const delete_Sweet = await delete_Sweet_By_ID(sweet_id);
      const delete_Comment = await Comment.deleteMany({ tweet_id: sweet_id })
  
      const delete_Share = await Share.deleteMany({ sweet_id: sweet_id })
  
      const share = await Share.find({ sweet_id: sweet_id });
  
      for (const shareID of share) {
        const delete_Comment_In_Share = await Comment.deleteMany({ sweet_id: shareID });
      }
  
      return res.status(200).json(formatResponse(null, true, "Đã xóa bài viết!"));
  
    }else if(share){
      const delete_Share = await Share.findByIdAndDelete(sweet_id);

      const delete_Comment_In_Share = await Comment.deleteMany({ sweet_id: sweet_id });
      
    }else{
      console.log("Không thấy bài viết!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));
    }

    
  } catch (error) {
    return res.status(400).json(formatResponse(null, false, "Lỗi khi thực hiện xóa bài viết!"));
  }
});

const deleted_Sweet_Temporary = asyncHandle(async (req, res) => {

  const sweet_id = req.params.SweetID;

  const sweet = await Sweet.findById(sweet_id);
  const share = await Share.findById(sweet_id);

  try {

    if(sweet){
      const delete_Sweet = await Sweet.findByIdAndUpdate(sweet_id, { $set: { isDelete: true } });
      const delete_Share = await Share.updateMany({ sweet_id: sweet_id }, { $set: { isDelete: true } });

      return res.status(200).json(formatResponse(null, true, "Đã xóa bài viết!"));
    }else if(share){
      const delete_Share = await Share.findByIdAndUpdate(sweet_id, { $set: { isDelete: true } });
    }else{
      console.log("Không thấy bài viết!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));
    }
    
  } catch (error) {
    console.error("Lỗi khi xóa bài viết tạm thời: ". error.message)
    return res.status(400).json(formatResponse(null, false, "Lỗi khi thực hiện xóa bài viết!"));
  }
});


const get_List_Sweet_Deleted_Temporary = asyncHandle(async (req, res) => {
  const user_id = req.user.userId
  // const user_id = req.query.user_id;

  try {
    const list_Sweet_Deleted_Temporary = await Sweet.find({ user_id: user_id, isDelete: true }).populate('user_id', 'displayName username')
      
    const dataSweet = await Promise.all(list_Sweet_Deleted_Temporary.map( async (item) => {
      const create_at = moment(item.created_at);
      const durationByText = await formatTimeDifference(create_at, moment());
      if(item instanceof Sweet){
        return {
          _id: item._id,
          UserName: item.user_id,
          Content: item.content,
          Image: item.image,
          QuantityLike: item.likes.length,
          QuantityComment: item.comments.length,
          QuantityShare: item.shares.length,
          CreateAt: moment(item.created_at).format(),
          Duration: durationByText,
        }
      }
      
    }))

    const data = {
      QuantitySweetInBin: list_Sweet_Deleted_Temporary.length,
      InFo_Sweet: dataSweet,
    }

    return res.status(200).json(formatResponse(data, true, "Lấy danh sách bài viết đã xóa thành công!"));

  } catch (error) {
    console.log("lỗi: ", error);
    return res.status(400).json(formatResponse(null, false, "Lỗi khi thực hiện lấy các bài viết đã xóa!"));
  }

})

const restore_Sweet = asyncHandle(async (req, res) => {

  const sweet_id = req.params.SweetID;
  const sweet = await Sweet.findById(sweet_id);

  try {

    if (!sweet) {
      console.log("Không thấy bài viết!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));
    }

    const restore_Sweet = await Sweet.findByIdAndUpdate(sweet_id, { $set: { isDelete: false } });
    const restore_Share = await Share.updateMany({ sweet_id: sweet_id }, { $set: { isDelete: false } });

    return res.status(200).json(formatResponse(null, true, "Đã khôi phục bài viết thành công!"));

  } catch (error) {
    return res.status(400).json(formatResponse(null, false, "Lỗi khi thực hiện khôi phục bài viết!"));
  }
})


const add_OR_Delete_User_To_List_Like_Sweet = asyncHandle(async (req, res) => {
  const sweet_id = req.params.SweetID;
  const user_id = req.user.userId;
  // const user_id = req.body.user_id;

  console.log(req.user)

  const sweet = await Sweet.findById(sweet_id);
  const share = await Share.findById(sweet_id);

  try {
    if(sweet){
      const user_id_In_List_Like_Sweet = sweet.likes.findIndex(userId => userId?.toString() === user_id.toString());
      if (user_id_In_List_Like_Sweet === -1) {
        sweet.likes.push(user_id);
        sweet.save();
        const data = {
          State: true,
          QuantityLike: sweet.likes.length
        }
        const dataAddNotify = {
          content: `${req.user.displayName}${sweet.likes.length > 1 ? ` và ${sweet.likes.length - 1} người khác` : ''} đã thích bài viết của bạn.`,
          relateTo: user_id,
          tweetId: sweet_id,
          userId:sweet.user_id
        }
        await createNotification(dataAddNotify);
        return res.status(200).json(formatResponse(data, true, "Đã like bài viết!"));
      } else {
        sweet.likes.splice(user_id_In_List_Like_Sweet, 1);
        sweet.save();
        const data = {
          State: false,
          QuantityLike: sweet.likes.length,
          
        }
        return res.status(200).json(formatResponse(data, true, "Bỏ thích bài viết thành công!"));
      }  
    }else if (share){
      const user_id_In_List_Like_Share = share.likes.findIndex(userId => userId?.toString() === user_id.toString());
      if (user_id_In_List_Like_Share === -1) {
        share.likes.push(user_id);
        share.save();
        const data = {
          State: true,
          QuantityLike: share.likes.length
        }
        const dataAddNotify = {
          userId:share.user_id,
          content: `${req.user.displayName} đã thích bài viết của bạn.`,
        }
        await createNotification(dataAddNotify);
        return res.status(200).json(formatResponse(data, true, "Đã like bài Share!"));
      } else {
        share.likes.splice(user_id_In_List_Like_Share, 1);
        share.save();
        const data = {
          State: false,
          QuantityLike: share.likes.length
        }
        return res.status(200).json(formatResponse(data, true, "Bỏ thích bài Share thành công!"));
      }
    }else{
      console.log("Không thấy bài viết!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));
    }

  } catch (error) {
    console.log(error)
    res.status(404).json(formatResponse(null, false, "Lỗi khi tương tác với bài viết"));
  }

})

async function get_List_DisplayName_By_UserID(listUserID) {
  const displayNameS = [];
  for (let i = listUserID.length - 1; i >= 0; i--) {
    const userID = listUserID[i];
    const displayName = await getDisplayName_By_ID(userID);
    if (displayName) {
      console.log("Tìm thấy UserID và có thể biết được DisplayName");
      displayNameS.push(displayName);
    }
  }
  return displayNameS;
}

const get_List_User_To_Like = asyncHandle(async (req, res) => {

  const id_Sweet = req.query.SweetID;
  const sweet = await Sweet.findById(id_Sweet).populate('likes', 'displayName username');
  const share = await Share.findById(id_Sweet).populate('likes', 'displayName username');

  let quantityLike;
  try {
    if(sweet){
      const sweetPresent = await get_Sweet_By_Id(id_Sweet);

      const List_Userid_ToLike = sweetPresent.likes;
  
      const list_NameUser_ToLike = await get_List_DisplayName_By_UserID(List_Userid_ToLike);
  
      quantityLike = sweetPresent.likes.length;

      const data = {
        QuantityLike: quantityLike,
        List_UserName_ToLike: list_NameUser_ToLike
      }
      return res.status(200).json(formatResponse(data, true, "Lấy danh sách User đã like Sweet thành công"));  
    
    }else if(share){
      const sweetPresent = await get_Sweet_By_Id(id_Sweet);

      const List_Userid_ToLike = sweetPresent.likes;
  
      const list_NameUser_ToLike = await get_List_DisplayName_By_UserID(List_Userid_ToLike);
  
      quantityLike = sweetPresent.likes.length;
      
      const data = {
        QuantityLike: quantityLike,
        List_UserName_ToLike: list_NameUser_ToLike
      }
      return res.status(200).json(formatResponse(data, true, "Lấy danh sách User đã like bài Share thành công"));
    }else {
      console.log("Không thấy bài viết!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));
    }


  } catch (error) {
    return res.status(400).json(formatResponse(null, false, "Lấy danh sách User đã like Sweet thất bại!"));
  }

});

const get_List_User_To_Share = asyncHandle(async (req, res) => {

  const id_Sweet = req.query.SweetID;
  const sweet = await Sweet.findById(id_Sweet).populate("shares", "displayName username");

  let quantityShare;
  try {
    try {
      if (!sweet) {
        console.log("Không thấy bài viết!");
        return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));
      }
    } catch (error) {
      console.log("Lỗi khi lấy danh sách Share", error);
      return res.status(400).json(formatResponse(null, false, "Lỗi khi tìm bài viết!"));
    }

    const sweetPresent = await get_Sweet_By_Id(id_Sweet);

    const List_Userid_ToShare = sweetPresent.shares;

    const list_NameUser_ToShare = await get_List_DisplayName_By_UserID(List_Userid_ToShare);

    quantityShare = sweetPresent.shares.length;

    const data = {
      QuantityShare: quantityShare,
      List_UserName_ToShare: list_NameUser_ToShare
    }

    return res.status(200).json(formatResponse(data, true, "Lấy danh sách User đã Share Sweet thành công"));

  } catch (error) {
    return res.status(400).json(formatResponse(null, false, "Lấy danh sách User đã Share Sweet thất bại!"));
  }
});

async function get_Comment_Info_To_Sweet_OutStanding(list_CommentID, userID) {
  const comment_Info = [];
  const sortData = list_CommentID.sort((a, b) => {
    const interactionCount_a = (a.likes ? a.likes.length : 0) + (a.comment_Reply ? a.comment_Reply.length : 0);
    const interactionCount_b = (b.likes ? b.likes.length : 0) + (b.comment_Reply ? b.comment_Reply.length : 0);

    if (interactionCount_b === interactionCount_a) {
      return new Date(b.created_at) - new Date(a.created_at);
    } else return interactionCount_b - interactionCount_a;
  });
  for (const commentID of sortData) {
    const comment = await Comment.findById(commentID).populate('likes', 'displayName');
    const userName = await getDisplayName_By_ID(comment.user_id);
    const countLike = comment.likes.length;
    const duration = await formatTimeDifference(moment(comment.created_at), moment())

    const stateLike = comment.likes.some(like => like._id.toString() === userID.toString());

    comment_Info.push({
      _id: comment._id,
      DisplayName: userName,
      Content: comment.content,
      Image: comment.image,
      QuantityLike: countLike,
      User_Like: comment.likes,
      QuantityReplyComment: comment.comment_reply.length,
      CreateAt: duration,
      StateLike: stateLike,
    });
  }
  return comment_Info;
}

const get_List_Comment_To_Sweet_OutStanding = asyncHandle(async (req, res) => {
  let skipNumble = parseInt(req.query.skip) || 0;
  let limitNumble = parseInt(req.query.limit) || 15;

  const user_id = req.user.userId;
  console.log("id", user_id);
  const id_Sweet = req.query.SweetID;

  const sweet = await Sweet.findById(id_Sweet).populate("comments");
  const share = await Share.findById(id_Sweet).populate("comments");

  try {
    if(sweet){
      const list_Comment = sweet.comments;
      const getComment = await get_Comment_Info_To_Sweet_OutStanding(list_Comment, user_id);
  
      const data = {
        QuantityComment: sweet.comments.length,
        QuantityCommentGetOut: limitNumble,
        List_UserName_ToComment: getComment.slice(skipNumble, skipNumble + limitNumble)
      }
  
      return res.status(200).json(formatResponse(data, true, ""));
  
    }else if(share){
      const list_Comment = share.comments;
      const getComment = await get_Comment_Info_To_Sweet_OutStanding(list_Comment, user_id);
  
      const data = {
        QuantityComment: share.comments.length,
        QuantityCommentGetOut: limitNumble,
        List_UserName_ToComment: getComment.slice(skipNumble, skipNumble + limitNumble)
      }
  
      return res.status(200).json(formatResponse(data, true, ""));
    }else return res.status(400).json(formatResponse("", false, "Không tìm thấy bài viết!!"));
  
  }catch (error) {
      console.log("Lỗi khi lấy danh sách Comment của bài Share", error);
      res.status(404).json(formatResponse("", false, "Lỗi khi lấy danh sách Comment của bài Share!"))
  }
  
    

})

async function get_Comment_Info_To_Sweet_Recently(list_CommentID, userID) {
  const comment_Info = [];
  const sortData = list_CommentID.sort((a, b) => {
    return new Date(b.created_at) - new Date(a.created_at);
  });
  for (const commentID of sortData) {
    const comment = await Comment.findById(commentID).populate('likes', 'displayName');
    const userName = await getDisplayName_By_ID(comment.user_id);
    const countLike = comment.likes.length;
    const duration = await formatTimeDifference(moment(comment.created_at), moment())

    const stateLike = comment.likes.some(like => like._id.toString() === userID.toString());

    comment_Info.push({
      _id: comment._id,
      DisplayName: userName,
      Content: comment.content,
      Image: comment.image,
      QuantityLike: countLike,
      User_Like: comment.likes,
      QuantityReplyComment: comment.comment_reply.length,
      CreateAt: duration,
      StateLike: stateLike,
    });
  }
  return comment_Info;
}

const get_List_Comment_To_Sweet_Recently = asyncHandle(async (req, res) => {
  let skipNumble = parseInt(req.query.skip) || 0;
  let limitNumble = parseInt(req.query.limit) || 15;

  const user_id = req.user.userId;
  const id_Sweet = req.query.SweetID;

  const sweet = await Sweet.findById(id_Sweet).populate("comments");
  const share = await Share.findById(id_Sweet).populate("comments");

  try {
    if(sweet){
      const list_Comment = sweet.comments;
      const getComment = await get_Comment_Info_To_Sweet_Recently(list_Comment, user_id);
  
      const data = {
        QuantityComment: sweet.comments.length,
        QuantityCommentGetOut: limitNumble,
        List_UserName_ToComment: getComment.slice(skipNumble, skipNumble + limitNumble)
      }
  
      return res.status(200).json(formatResponse(data, true, ""));
  
    }else if(share){
      const list_Comment = share.comments;
      const getComment = await get_Comment_Info_To_Sweet_Recently(list_Comment, user_id);
  
      const data = {
        QuantityComment: share.comments.length,
        QuantityCommentGetOut: limitNumble,
        List_UserName_ToComment: getComment.slice(skipNumble, skipNumble + limitNumble)
      }
  
      return res.status(200).json(formatResponse(data, true, ""));
    }else return res.status(400).json(formatResponse("", false, "Không tìm thấy bài viết!!"));
  
  }catch (error) {
      console.log("Lỗi khi lấy danh sách Comment của bài Share", error);
      res.status(404).json(formatResponse("", false, "Lỗi khi lấy danh sách Comment của bài Share!"))
  }

})

async function get_Comment_Info_To_Sweet_Furthest(list_CommentID, userID) {
  const comment_Info = [];
  const sortData = list_CommentID.sort((a, b) => {
    return new Date(a.created_at) - new Date(b.created_at);
  });
  for (const commentID of sortData) {
    const comment = await Comment.findById(commentID).populate('likes', 'displayName');
    const userName = await getDisplayName_By_ID(comment.user_id);
    const countLike = comment.likes.length;
    const duration = await formatTimeDifference(moment(comment.created_at), moment())

    const stateLike = comment.likes.some(like => like._id.toString() === userID.toString());

    comment_Info.push({
      _id: comment._id,
      DisplayName: userName,
      Content: comment.content,
      Image: comment.image,
      QuantityLike: countLike,
      User_Like: comment.likes,
      QuantityReplyComment: comment.comment_reply.length,
      CreateAt: duration,
      StateLike: stateLike,
    });
  }
  return comment_Info;
}

const get_List_Comment_To_Sweet_Furthest = asyncHandle(async (req, res) => {
  let skipNumble = parseInt(req.query.skip) || 0;
  let limitNumble = parseInt(req.query.limit) || 15;

  const user_id = req.user.userId;
  const id_Sweet = req.query.SweetID;

  const sweet = await Sweet.findById(id_Sweet).populate("comments");
  const share = await Share.findById(id_Sweet).populate("comments");

  try {
    if(sweet){
      const list_Comment = sweet.comments;
      const getComment = await get_Comment_Info_To_Sweet_Furthest(list_Comment, user_id);
  
      const data = {
        QuantityComment: sweet.comments.length,
        QuantityCommentGetOut: limitNumble,
        List_UserName_ToComment: getComment.slice(skipNumble, skipNumble + limitNumble)
      }
  
      return res.status(200).json(formatResponse(data, true, ""));
  
    }else if(share){
      const list_Comment = share.comments;
      const getComment = await get_Comment_Info_To_Sweet_Furthest(list_Comment, user_id);
  
      const data = {
        QuantityComment: share.comments.length,
        QuantityCommentGetOut: limitNumble,
        List_UserName_ToComment: getComment.slice(skipNumble, skipNumble + limitNumble)
      }
  
      return res.status(200).json(formatResponse(data, true, ""));
    }else return res.status(400).json(formatResponse("", false, "Không tìm thấy bài viết!!"));
  
  }catch (error) {
      console.log("Lỗi khi lấy danh sách Comment của bài Share", error);
      res.status(404).json(formatResponse("", false, "Lỗi khi lấy danh sách Comment của bài Share!"))
  }

})

async function formatTimeDifference(fromDate, toDate) {

  const duration = moment.duration(toDate.diff(fromDate));

  if (duration.asMinutes() < 1) {
    return 'Vừa xong';
  } else if (duration.asHours() < 1) {
    const minutes = Math.floor(duration.asMinutes());
    return `${minutes} phút trước`;
  } else if (duration.asDays() < 1) {
    const hours = Math.floor(duration.asHours());
    return `${hours} giờ trước`;
  } else if (duration.asDays() < 7) {
    const days = Math.floor(duration.asDays());
    return `${days} ngày trước`;
  } else {
    // const weeks = Math.floor(duration.asDays() / 7);
    // return `${weeks} tuần trước`;
    return moment(fromDate).format("DD/MM/YYYY - HH:mm");
  }
}

const get_A_Sweet = asyncHandle(async (req, res) => {
  const sweetID = req.query.SweetID;
  const user_id = req.user.userId;
  // const user_id = req.query.UserID;

  const sweet = await Sweet.findById(sweetID)
    .populate('user_id', 'displayName username')
    .populate('likes', 'displayName username')
    .populate('shares', 'displayName username')

  const share = await Share.findById(sweetID)
    .populate('user_id', 'displayName username')
    .populate('likes', 'displayName username')
    .populate('shares', 'displayName username');

  try {

    const comment = await Comment.find({ tweet_id: sweetID },
      {
        _id: 1,
        user_id: 1,
        content: 1,
        image: 1,
        likes: 1,
        comment_reply: { user_id: 1, content: 1, image: 1, likes: 1, create_at: 1 },
        created_at: 1
      })
      .populate("user_id", "displayName username")
      .populate("likes", "displayName username")
      .populate({
        path: 'comment_reply',
        populate: [
          { path: 'user_id', select: 'displayName username' },
          { path: 'likes', select: 'displayName username' }
        ]
      })

    const getComment = await get_Comment_Info_To_Sweet_OutStanding(comment, user_id);

    const now = moment();

    let data = "";
    let stateLike;
    if (sweet) {
      const createdAt_Sweet = moment(sweet.created_at);
      const durationByText_Sweet = await formatTimeDifference(createdAt_Sweet, now);

      const check_UserLike = sweet.likes.some(like => like.equals(user_id));
      if(check_UserLike){
        stateLike = true;
      }else stateLike = false;

      data = {
        _id: sweet._id,
        UserName: sweet.user_id,
        Content: sweet.content,
        Image: sweet.image,
        QuantityLike: sweet.likes.length,
        ListUserTolike: sweet.likes,
        QuantityComment: sweet.comments.length,
        ListUserToComment: getComment,
        QuantityShare: sweet.shares.length,
        ListUserToShare: sweet.shares,
        CreateAt: moment(sweet.created_at).format(),
        Duration: durationByText_Sweet,
        StateLike: stateLike,
        State: false
      }
    } else if (share) {
      const createdAt_Share = moment(share.created_at);
      const durationByText_Share = await formatTimeDifference(createdAt_Share, now);

      const sweet = await Sweet.findById(share.sweet_id)
        .populate('user_id', 'displayName username')
        .populate('likes', 'displayName username')
        .populate('shares', 'displayName username');
      const durationByText_Sweet = await formatTimeDifference(sweet.created_at, now);

      const check_UserLike = share.likes.some(like => like.equals(user_id));
      if(check_UserLike){
        stateLike = true;
      }else stateLike = false;

      data = {
        _id: share._id,
        UserName: share.user_id,
        Content: share.content,
        Image: share.image,

        SweetID: sweet._id,
        UserName_Origin: sweet.user_id,
        Duration_Origin: durationByText_Sweet,
        Content_Origin: sweet.content,
        Image_Origin: sweet.image,

        QuantityLike: share.likes.length,
        ListUserTolike: share.likes,
        QuantityComment: share.comments.length,
        ListUserToComment: getComment,
        QuantityShare: share.shares.length,
        ListUserToShare: share.shares,
        CreateAt: moment(share.created_at).format(),
        Duration: durationByText_Share,
        StateLike: stateLike,
        State: true
      }
    }

    return res.status(200).json(formatResponse(data, true, "Lấy bài viết theo id thành công!"));
  } catch (error) {
    console.error(error.message);
    return res.status(400).json(formatResponse(null, false, "Lấy bài viết thất bại!"));
  }
})

const get_Many_Sweet_And_Share_For_You = asyncHandle((async (req, res) => {
  let skipNumble = parseInt(req.query.skip) || 0;
  let limitNumble = parseInt(req.query.limit) || 10;
  const user_id = req.user.userId
  try {
    const getSweet = await Sweet.find({ isDelete: false }).populate('user_id', 'displayName username');
    const getShare = await Share.find({ isDelete: false }).populate('user_id', 'displayName username');
    const combineSweetShare = getSweet.concat(getShare);
    const sortData = combineSweetShare.sort((a, b) => {
      const interactionCount_a = (a.likes ? a.likes.length : 0) + (a.comments ? a.comments.length : 0) + (a.shares.length);
      const interactionCount_b = (b.likes ? b.likes.length : 0) + (b.comments ? b.comments.length : 0) + (b.shares.length);

      if (interactionCount_b === interactionCount_a) {
        return new Date(b.created_at) - new Date(a.created_at);
      } else return interactionCount_b - interactionCount_a;
    });
    const now = moment();
    const processedData = await Promise.all(sortData.map(async (item) => {
      const createdAt = moment(item.created_at);
      const durationByText = await formatTimeDifference(createdAt, now);
      const sweetOrigin = await Sweet.findById(item.sweet_id).populate('user_id', 'displayName username');

      let durationByText_Origin = "";
      if (sweetOrigin) {
        const createSweet = sweetOrigin.created_at;
        const createdAt_Origin = moment(createSweet);
        durationByText_Origin = await formatTimeDifference(createdAt_Origin, now);
      }
      let stateLike;
      const check_UserLike = item.likes.includes(user_id);
      if(check_UserLike){
        stateLike = true;
      }else stateLike = false;

      if (item instanceof Sweet) {
        return {
          _id: item._id,
          UserName: item.user_id,
          Content: item.content,
          Image: item.image,
          QuantityLike: item.likes.length,
          QuantityComment: item.comments.length,
          QuantityShare: item.shares.length,
          CreateAt: moment(item.created_at).format(),
          Duration: durationByText,
          StateLike: stateLike,
          State: false
        };
      } else {
        return {
          _id: item._id,
          UserName: item.user_id,
          Content: item.content,
          Image: item.image,
          SweetID: item.sweet_id,
          UserName_Origin: sweetOrigin?.user_id,
          Duration_Origin: durationByText_Origin,
          Content_Origin: sweetOrigin?.content,
          Image_Origin: sweetOrigin?.image,
          QuantityLike: item.likes.length,
          QuantityComment: item.comments.length,
          QuantityShare: item.shares.length,
          CreateAt: moment(item.created_at).format(),
          Duration: durationByText,
          StateLike: stateLike,
          State: true,
        };
      }
    }));

    const paginatedData = processedData.slice(skipNumble, skipNumble + limitNumble)
    const data = {
      InFo_Sweet: paginatedData,
    }

    return res.status(200).json(formatResponse(data, true, `Lấy ra ${paginatedData.length} bài viết thành công!`));

  } catch (error) {
    console.log(error)
    console.error('Lỗi khi lấy danh sách bài viết:', error.message);
    return res.status(400).json(formatResponse(null, false, "Lấy các bài viết thất bại!"));
  }

}))

const get_Many_Sweet_And_Share_Following = asyncHandle((async (req, res) => {
  let skipNumble = parseInt(req.query.skip) || 0;
  let limitNumble = parseInt(req.query.limit) || 10;

  // const user_id = req.query.UserID;
  const user_id = req.user.userId;
  const user = await User.findById(user_id);
  const followingS = user.following;

  try {
    const getSweet = await Sweet.find({ isDelete: false, user_id: { $in: followingS } }).populate('user_id', 'displayName username');
    const getShare = await Share.find({ isDelete: false, user_id: { $in: followingS } }).populate('user_id', 'displayName username');

    const combineSweetShare = getSweet.concat(getShare);

    const sortData = combineSweetShare.sort((a, b) => {
      const interactionCount_a = (a.likes ? a.likes.length : 0) + (a.comments ? a.comments.length : 0) + (a.shares.length);
      const interactionCount_b = (b.likes ? b.likes.length : 0) + (b.comments ? b.comments.length : 0) + (b.shares.length);

      if (interactionCount_b === interactionCount_a) {
        return new Date(b.created_at) - new Date(a.created_at);
      } else return interactionCount_b - interactionCount_a;

    });

    const now = moment();

    const processedData = await Promise.all(sortData.map(async (item) => {
      const createdAt = moment(item.created_at);
      const durationByText = await formatTimeDifference(createdAt, now);
      const sweet = await Sweet.findById(item.sweet_id).populate('user_id', 'displayName username');

      let durationByText_Origin = "";
      if (sweet) {
        const createSweet = sweet.created_at;
        const createdAt_Origin = moment(createSweet);
        durationByText_Origin = await formatTimeDifference(createdAt_Origin, now);
      }

      let stateLike;
      const check_UserLike = item.likes.includes(user_id);
      if(check_UserLike){
        stateLike = true;
      }else stateLike = false;


      if (item instanceof Sweet) {
        return {
          _id: item._id,
          UserName: item.user_id,
          Content: item.content,
          Image: item.image,
          QuantityLike: item.likes.length,
          QuantityComment: item.comments.length,
          QuantityShare: item.shares.length,
          CreateAt: moment(item.created_at).format(),
          Duration: durationByText,
          StateLike: stateLike,
          State: false
        };
      } else {
        return {
          _id: item._id,
          UserName: item.user_id,
          Content: item.content,
          Image: item.image,

          SweetID: item.sweet_id,
          UserName_Origin: sweet.user_id,
          Duration_Origin: durationByText_Origin,
          Content_Origin: sweet.content,
          Image_Origin: sweet.image,

          QuantityLike: item.likes.length,

          QuantityComment: item.comments.length,

          QuantityShare: item.shares.length,

          CreateAt: moment(item.created_at).format(),
          Duration: durationByText,
          StateLike: stateLike,
          State: true
        };
      }
    }));

    const paginatedData = processedData.slice(skipNumble, skipNumble + limitNumble)

    const data = {
      InFo_Sweet: paginatedData,
    }

    return res.status(200).json(formatResponse(data, true, `Lấy ra ${paginatedData.length} bài viết thành công!`));

  } catch (error) {
    console.error('Lỗi khi lấy danh sách bài viết:', error.message);
    return res.status(400).json(formatResponse(null, false, "Lấy các bài viết thất bại!"));
  }

}))

const get_Sweet_To_UserID = asyncHandle(async (req, res) => {

  let skipNumble = parseInt(req.query.skip) || 0;
  let limitNumble = parseInt(req.query.limit)|| 50;

  const user_id_token = req.user.userId;
  // const user_id = req.query.UserID;
  const user_id = req.params.UserID;



  //const user_id = req.query.UserID;


  try {
    const getSweet = await Sweet.find({ isDelete: false, user_id: user_id }).populate('user_id', 'displayName username');
    const getShare = await Share.find({ isDelete: false, user_id: user_id }).populate('user_id', 'displayName username');

    const combineSweetShare = getSweet.concat(getShare);

    const sortData = combineSweetShare.sort((a, b) => {
      if (a.isPin === true && b.isPin !== true) {
        return -1; //trả về số âm a đứng b
      }

      else if (b.isPin === true && a.isPin !== true) {
        return 1; //trả về số dương b đứng a
      }

      return new Date(b.created_at) - new Date(a.created_at);
    });

    const now = moment();

    const processedData = await Promise.all(sortData.map(async (item) => {
      const createdAt = moment(item.created_at);
      const durationByText = await formatTimeDifference(createdAt, now);
      const sweet = await Sweet.findById(item.sweet_id).populate('user_id', 'displayName username');

      let durationByText_Origin = "";
      if (sweet) {
        const createSweet = sweet.created_at;
        const createdAt_Origin = moment(createSweet);
        durationByText_Origin = await formatTimeDifference(createdAt_Origin, now);
      }

      let stateLike;
      const check_UserLike = item.likes.includes(user_id_token);
      if(check_UserLike){
        stateLike = true;
      }else stateLike = false;

      if (item instanceof Sweet) {
        return {
          _id: item._id,
          UserName: item.user_id,
          Content: item.content,
          Image: item.image,
          QuantityLike: item.likes.length,
          QuantityComment: item.comments.length,
          QuantityShare: item.shares.length,
          CreateAt: moment(item.created_at).format(),
          Duration: durationByText,
          StateLike: stateLike,
          State: false,
          Ispin: item.isPin
        };
      } else {
        return {
          _id: item._id,
          UserName: item.user_id,
          Content: item.content,
          Image: item.image,

          SweetID: item.sweet_id,
          UserName_Origin: sweet.user_id,
          Duration_Origin: durationByText_Origin,
          Content_Origin: sweet.content,
          Image_Origin: sweet.image,

          QuantityLike: item.likes.length,

          QuantityComment: item.comments.length,

          QuantityShare: item.shares.length,

          CreateAt: moment(item.created_at).format(),
          Duration: durationByText,
          StateLike: stateLike,
          State: true,
          Ispin: item.isPin
        };
      }
    }));

    const paginatedData = processedData.slice(skipNumble, skipNumble + limitNumble)

    const data = {
      Info: paginatedData,
    }
    return res.status(200).json(formatResponse(data, true, `Lấy ra ${paginatedData.length} bài viết theo UserID: ${user_id} thành công!`));

  } catch (error) {
    console.error(`Lỗi khi lấy danh sách bài viết theo UserID: ${user_id}`, error.message);
    return res.status(400).json(formatResponse(null, false, `Lấy các bài viết theo UserID: ${user_id} thất bại!`));
  }

})

const pin_Or_Unpin_Sweet = asyncHandle(async (req, res) => {
  const sweet_id = req.params.SweetID;

  try {
    let sweet = await Sweet.findById(sweet_id);
    let share = !sweet ? await Share.findById(sweet_id) : null;

    if (!sweet && !share) {
      return res.status(400).json(formatResponse(null, false, "ID không hợp lệ!"));
    }

    const getSweet = await Sweet.find({ isDelete: false }).populate('user_id', 'displayName username');
    const getShare = await Share.find({ isDelete: false }).populate('user_id', 'displayName username');
    const combineSweetShare = getSweet.concat(getShare);

    for (const ss of combineSweetShare) {
      ss.isPin = false;
      await ss.save();
    }

    if (sweet) {
      sweet.isPin = !sweet.isPin;
      await sweet.save();
      const message = sweet.isPin
        ? `Ghim bài viết có id ${sweet_id} thành công!`
        : `Bỏ ghim bài viết có id ${sweet_id} thành công!`;
      return res.status(200).json(formatResponse(sweet.isPin, true, message));
    } else if (share) {
      share.isPin = !share.isPin;
      await share.save();
      const message = share.isPin
        ? `Ghim bài share có id ${sweet_id} thành công!`
        : `Bỏ ghim bài share có id ${sweet_id} thành công!`;
      return res.status(200).json(formatResponse(share.isPin, true, message));
    }
  } catch (error) {
    console.error("Lỗi khi ghim bài viết!!", error.message);
    return res.status(400).json(formatResponse(null, false, "Lỗi khi ghim bài viết!!"));
  }
});

module.exports = {
  create_Sweet,
  update_Sweet,
  get_History_Update_Sweet,

  deleted_Sweet,
  deleted_Sweet_Temporary,
  get_List_Sweet_Deleted_Temporary,
  restore_Sweet,
  
  add_OR_Delete_User_To_List_Like_Sweet,
  
  get_List_User_To_Like,
  get_List_User_To_Share,

  get_List_Comment_To_Sweet_OutStanding,
  get_List_Comment_To_Sweet_Recently,
  get_List_Comment_To_Sweet_Furthest,

  get_A_Sweet,
  get_Many_Sweet_And_Share_For_You,
  get_Many_Sweet_And_Share_Following,

  pin_Or_Unpin_Sweet,
  get_Sweet_To_UserID,
  
}