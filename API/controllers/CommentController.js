const asyncHandle = require('express-async-handler')
const Comment = require("../model/Comment");
const Sweet = require("../model/Sweet");
const formatResponse = require("../common/ResponseFormat");

const { set } = require('mongoose');
const User = require('../model/User');
const Share = require('../model/Share');
const { uploadImage } = require('../config/cloudinaryConfig');
const UploadImageMiddleware = require('../middleware/UploadImageMiddleware');

const moment = require("moment-timezone");
const path = require('path');
const { createNotification } = require('./NotifyController');
moment.tz('Asia/Ho_Chi_Minh')


const create_Comment = asyncHandle(async (req, res) => {

  const sweet_id = req.params.SweetID;

  const user_id = req.user.userId;
  //const user_id = req.body.user_id;
  const content = req.body.content || '';
  const image = req.files ? await uploadImage(req.files) : null;

  // let content = null;
  // let image = null;
  // try {
  //   if (!req.files && (!req.body.content || req.body.content.trim() === '')) {
  //     return res.status(400).json(formatResponse(null, false, 'Content is required when no image is provided'));
  //   } else {
  //     content = req.body.content.trim();
  //     image = req.files ? await uploadImage(req.files) : null;
  //   }
  // } catch (error) {
  //   console.error("Lỗi khi truyền vào tham số: ", error.message)
  //   return res.status(400).json(formatResponse(null, false, 'Content is required when no image is provided'));
  // }



  let comment = null;
  const sweet = await Sweet.findById(sweet_id);
  const share = await Share.findById(sweet_id);

  let QuantityComment_Sweet = 0;
  let QuantityComment_Share = 0;
  let QuantityComment = 0;

  if (sweet) {
    comment = await Comment.create({
      tweet_id: sweet_id,
      user_id: user_id,
      content: content,
      image: image,
    });
    console.log('check in controller')
    const add_Comment_To_Sweet = await Sweet.findByIdAndUpdate(sweet_id, { $addToSet: { comments: comment._id } });
    //Tạo thông báo
    const sweetPresent = await Sweet.findById(sweet_id);
    const dataAddNotify = {
      userId: sweetPresent.user_id,
      content: `${req.user.displayName}${sweetPresent.comments.length > 1 ? ` và ${sweetPresent.comments.length - 1} người khác` : ''} đã bình luận bài viết của bạn.`,
      relateTo: user_id,
      tweetId: sweet_id
    }

    await createNotification(dataAddNotify);

    QuantityComment_Sweet = sweetPresent.comments.length;

  } else if (share) {
    comment = await Comment.create({
      tweet_id: sweet_id,
      user_id: user_id,
      content: content,
      image: image
    });
    const add_Comment_To_Share = await Share.findByIdAndUpdate(sweet_id, { $addToSet: { comments: comment._id } });
    const sharePresent = await Share.findById(sweet_id);
    QuantityComment_Share = sharePresent.comments.length;

  } else return res.status(400).json(formatResponse("", false, "Không tìm thấy bài đăng!!"));

  try {
    if (sweet) {
      QuantityComment = QuantityComment_Sweet;
    } else QuantityComment = QuantityComment_Share;
  } catch (error) {
    return res.status(400).json(formatResponse("", false, "Không tìm thấy bài đăng!!"));
  }

  const data = {
    UserName: await getDisplayName_By_ID(user_id),
    SweetID: comment.tweet_id,
    Content: comment.content,
    Image: comment.image,
    CreateComment: moment(comment.created_at).format(),
    QuantityComment: QuantityComment,

  }

  return res.status(200).json(formatResponse(data, true, 'Đã tạo comment từ bài viết thành công!'));
})

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
    DisplayName: use.displayName,
    UserName: use.username,
  }
}


const update_Comment = asyncHandle(async (req, res) => {
  const commentID = req.params.CommentID;

  const content = req.body.content;
  const image = req.files ? await uploadImage(req.files) : null;

  const comment = await Comment.findById(commentID);

  try {
    if (!comment) {
      console.log("Không thấy Comment!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy Comment!"));
    }

    try {
      if (comment.updated_at == null) {

        const content_History = comment.content;
        const image_History = comment.image;
        const updated_History = comment.created_at;

        const historyUpdate = {
          content: content_History,
          images: image_History,
          updated_at: updated_History,
        };

        const addDataToHistory = await Comment.findByIdAndUpdate(commentID, { $push: { edit_history: historyUpdate } }); // , { new: true }

        if (!!req.files && req.files.length > 0) {
          await Comment.findByIdAndUpdate(commentID, { $set: { content: content, image: image, updated_at: new Date() } });

        } else {
          await Comment.findByIdAndUpdate(commentID, { $set: { content: content, updated_at: new Date() } });

        }
      } else {

        const content_History = comment.content;
        const image_History = comment.image;
        const updated_History = comment.updated_at;

        const historyUpdate = {
          content: content_History,
          images: image_History,
          updated_at: updated_History,
        };

        const addDataToHistory = await Comment.findByIdAndUpdate(commentID, { $push: { edit_history: historyUpdate } }); // , { new: true }

        const updateData = await Comment.findByIdAndUpdate(commentID, { $set: { content: content, image: image, updated_at: new Date() } });
      }
    } catch (error) {
      return res.status(400).json(formatResponse(null, false, "Lỗi khi cập nhật Comment!"));
    }

    const commentAfterUpdate = await Comment.findById(commentID);

    if (commentAfterUpdate) {
      commentAfterUpdate
    } else {
      //nothing
    }

    const data = {
      UserID: await getDisplayName_By_ID(commentAfterUpdate.user_id),
      Content: commentAfterUpdate.content,
      Image: commentAfterUpdate.image.map(i => i.toString()),
      QuantityLike: commentAfterUpdate.likes.length,
      CreateAt: moment(commentAfterUpdate.created_at).format(),
      UpdateAt: moment(commentAfterUpdate.updated_at).format()
    };

    return res.status(200).json(formatResponse(data, true, "Sửa đổi thành công"));
  } catch (error) {
    console.log("Error", error.message)
    return res.status(400).json(formatResponse(null, false, "Sửa đổi thất bại!"));
  }
});

const get_History_Update_Comment = asyncHandle(async (req, res) => {
  const comment_id = req.query.CommentID;

  const comment = await Comment.findById(comment_id);
  const edit_historys = comment.edit_history;

  if (!comment) {
    console.log("Không thấy Comment!");
    return res.status(400).json(formatResponse(null, false, "Không tìm thấy Comment!"));

  }

  let list_History_Update = [];
  const now = moment();

  for (let i = edit_historys.length - 1; i >= 0; i--) {
    const content = edit_historys[i].content;
    const images = edit_historys[i].images;
    const updated_at = moment(edit_historys[i].updated_at);
    const durationByText = await formatTimeDifference(updated_at, now);

    list_History_Update.push({ Content: content, Image: images, Duration: durationByText, UpdateAt: moment(updated_at).format("HH:mm - DD/MM/YYYY") });
  }



  const data = {
    UpdateNumber: edit_historys.length,
    History_Update: list_History_Update,
  }
  return res.status(200).json(formatResponse(data, true, "Đã lấy được danh sách lịch sử chỉnh sửa Comment"));

})

async function get_SweetID_Or_ShareID(commentID) {
  const comment = await Comment.findById(commentID);
  if (comment) {

    const sweetID = comment.tweet_id;
    console.log("Tìm thấy comment!!", sweetID);
    return sweetID;

  } else {
    console.log("Comment không tồn tại!");

  }
}

const delete_Comment = asyncHandle(async (req, res) => {
  const commentID = req.params.CommentID;

  const sweetID = await get_SweetID_Or_ShareID(commentID);

  const sweet = await Sweet.findById(sweetID);
  const share = await Share.findById(sweetID);

  let QuantityComment_Sweet = 0;
  let QuantityComment_Share = 0;
  let QuantityComment = 0;

  try {
    if (sweet) {
      const indexToRemove = sweet.comments.findIndex(comment => comment._id.toString() === commentID);
      if (indexToRemove !== -1) {
        sweet.comments.splice(indexToRemove, 1);
        try {
          await sweet.save();
          const sweetPresent = await Sweet.findById(sweetID);
          QuantityComment_Sweet = sweetPresent.comments.length;
          console.log('Đã lưu sweet thành công.');
        } catch (error) {
          console.error('Lỗi khi lưu sweet:', error);
        }

        // console.log('Đã xóa comment thành công từ sweet.', indexToRemove);
      }
    }
    else if (share) {
      const indexToRemove = share.comments.findIndex(comment => comment._id.toString() === commentID);
      if (indexToRemove !== -1) {
        share.comments.splice(indexToRemove, 1);
        try {
          await share.save();
          const sharePresent = await Share.findById(sweetID);
          QuantityComment_Share = sharePresent.comments.length;
          console.log('Đã lưu bài Share thành công.');
        } catch (error) {
          console.error('Lỗi khi lưu bài Share:', error);
        }
      }
    }
    else res.status(400).json(formatResponse(null, false, "Không tìm thấy Comment!!"))
  } catch (error) {
    console.error("Lỗi khi xóa comment", error);
    return res.status(400).json(formatResponse(null, false, "Lỗi khi xóa Comment!!"))
  }

  const commentD = await Comment.findByIdAndDelete(commentID);

  try {
    if (sweet) {
      QuantityComment = QuantityComment_Sweet;
    } else QuantityComment = QuantityComment_Share;
  } catch (error) {
    return res.status(400).json(formatResponse("", false, "Không tìm thấy bài đăng!!"));
  }

  const data = {
    SweetID: sweetID,
    QuantityComment: QuantityComment,
  }
  return res.status(200).json(formatResponse(data, true, "Xóa Comment thành công!!"));
})

const check_User_Like_Comment = asyncHandle(async (req, res) => {
  const comment_id = req.query.CommentID;
  const user_id = req.user.userId
  // const user_id = req.query.userId

  try {
    const comment = await Comment.findById(comment_id);

    if (comment) {
      const user_id_In_List_Like_Comment = comment && comment.likes && comment.likes.findIndex(userId => userId && userId.toString() === user_id);

      if (user_id_In_List_Like_Comment !== -1) {
        const data = {
          State: true,
          QuantityLike: comment.likes
        }
        return res.status(200).json(formatResponse(data, true, "Người dùng đang like Comment!"));
      }
      else {
        const data = {
          State: false,
          QuantityLike: comment.likes
        }
        return res.status(200).json(formatResponse(data, true, "Người dùng chưa like Comment!"));
      }
    } else return res.status(400).json(formatResponse(null, false, "Không tìm thấy Comment!"));

  } catch (error) {
    console.error("Lỗi: ", error.message)
    res.status(404).json(formatResponse(null, false, "Lỗi khi tương tác với Comment"));
  }

});

const add_OR_Delete_User_To_List_Like_Comment = asyncHandle(async (req, res) => {
  const comment_id = req.params.CommentID;
  const user_id = req.user.userId
  //const user_id = req.body.user_id;

  try {
    const comment = await Comment.findById(comment_id);

    const user_id_In_List_Like_Comment = comment.likes.findIndex(user => user._id.toString() === user_id);

    if (user_id_In_List_Like_Comment === -1) {
      comment.likes.push(user_id);
      comment.save();
      const data = {
        State: true,
        QuantityLike: comment.likes.length
      }
      return res.status(200).json(formatResponse(data, true, "Đã like comment!"));
    } else {
      comment.likes.splice(user_id_In_List_Like_Comment, 1);
      comment.save();
      const data = {
        State: false,
        QuantityLike: comment.likes.length
      }
      return res.status(200).json(formatResponse(data, true, "Bỏ thích comment thành công!"));
    }

  } catch (error) {
    return res.status(404).json(formatResponse("", false, "Lỗi khi tương tác với comment"));
  }

})


const get_List_User_To_Like_Comment = asyncHandle(async (req, res) => {

  const id_Comment = req.query.CommentID;
  const comment = await Comment.findById(id_Comment).populate("likes", "displayName username");

  try {
    try {
      if (!comment) {
        console.log("Không thấy comment!");
        return res.status(400).json(formatResponse(null, false, "Không tìm thấy Comment!"));
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách like", error.message);
      return res.status(400).json(formatResponse(null, false, "Lỗi khi tìm Comment!"));
    }

    const List_Userid_ToLike = comment.likes;
    const displayNameS = [];
    for (let i = List_Userid_ToLike.length - 1; i >= 0; i--) {
      const userID = List_Userid_ToLike[i];
      const displayName = await getDisplayName_By_ID(userID);
      if (displayName) {
        console.log("Tìm thấy UserID và có thể biết được DisplayName");
        displayNameS.push(displayName);
      }
    }


    const data = {
      QuantityLike: comment.likes.length,
      List_UserName_ToLike: displayNameS
    }

    return res.status(200).json(formatResponse(data, true, "Lấy danh sách User đã like Comment thành công"));

  } catch (error) {
    return res.status(400).json(formatResponse(null, false, "Lấy danh sách User đã like Comment thất bại!"));
  }

});

const create_ReplyComment = asyncHandle(async (req, res) => {
  const comment_id = req.params.CommentID;

  const user_id = req.user.userId
  //const user_id = req.body.user_id;
  const content = req.body.content;
  const image = await uploadImage(req.files);

  try {
    const comment = await Comment.findById(comment_id);
    //const commentReply = comment.comment_reply;
    const commentReply = {
      user_id: user_id,
      content: content,
      image: image,
    }

    const add_Reply_To_Comment = await Comment.findByIdAndUpdate(comment_id, { $push: { comment_reply: commentReply } });

    const commentPresent = await Comment.findById(comment_id);
    const data = {
      UserName: await getDisplayName_By_ID(commentReply.user_id._id),
      Content: commentReply.content,
      Image: commentReply.image,
      CreateAt: moment(commentReply.create_at).format(),
      QuantityCommentReply: commentPresent.comment_reply.length,
    }
    //Tạo notify
    const dataAddNotify = {
      userId: commentPresent.user_id,
      content: `${req.user.displayName} đã trả lời bình luận của bạn.`,
      relateTo: user_id,
      tweetId: commentPresent.tweet_id
    }

    await createNotification(dataAddNotify);

    return res.status(200).json(formatResponse(data, true, `Trả lời Comment có id: ${comment_id} thành công!!`))

  } catch (error) {
    console.log("Lỗi khi trả lời Comment!!", error.message);
    return res.status(400).json(formatResponse(null, false, `Lỗi khi trả lời Comment!!`))
  }
})


const add_OR_Delete_User_To_List_Like_ReplyComment = asyncHandle(async (req, res) => {
  const comment_id = req.params.CommentID;
  const replyComment_id = req.params.ReplyCommentID;

  const user_id = req.user.userId
  //const user_id = req.body.user_id;

  try {
    const comment = await Comment.findById(comment_id);
    const comment_Reply = comment.comment_reply;

    for (const comment_reply of comment_Reply) {
      if (replyComment_id === comment_reply._id.toString()) {
        const user_id_In_List_Like_ReplyComment = comment_reply.likes.findIndex(cr => cr._id.toString() === user_id);
        if (user_id_In_List_Like_ReplyComment === -1) {
          comment_reply.likes.push(user_id);
          comment.save();
          const data = {
            QuantityLike: comment_reply.likes.length
          }
          return res.status(200).json(formatResponse(data, true, "Đã like Reply_Comment!"));
        } else {
          comment_reply.likes.splice(user_id_In_List_Like_ReplyComment, 1);
          comment.save();
          const data = {
            QuantityLike: comment_reply.likes.length
          }
          return res.status(200).json(formatResponse(data, true, "Bỏ thích Reply_Comment!"));
        }
      }
    }
  } catch (error) {
    res.status(404).json(formatResponse("", false, "Lỗi khi tương tác với comment"));
  }
})

const get_List_User_To_Like_ReplyComment = asyncHandle(async (req, res) => {

  const comment_id = req.query.CommentID;
  const replyComment_id = req.query.ReplyCommentID;

  const comment = await Comment.findById(comment_id)
    .populate({
      path: 'comment_reply',
      populate: [
        { path: 'likes', select: 'displayName username' }
      ]
    })

  const replyComment = comment.comment_reply;

  try {
    if (!comment || !replyComment) {
      console.log("Không thấy comment!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy Comment!"));
    }
    else {
      replyComment.forEach(async rc => {
        if (rc._id.toString() === replyComment_id) {
          const List_Userid_ToLike = rc.likes;
          const List_Userid_ToLikeSort = [];
          for (let i = List_Userid_ToLike.length - 1; i >= 0; i--) {
            const userID = List_Userid_ToLike[i];
            const displayNameS = await getDisplayName_By_ID(userID);
            List_Userid_ToLikeSort.push(displayNameS);
          }
          const data = {
            QuantityLike: List_Userid_ToLike.length,
            List_UserName_ToLike: List_Userid_ToLikeSort
          }
          return res.status(200).json(formatResponse(data, true, "Lấy danh sách User đã like Reply Comment thành công"));
        }
      });
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách like", error.message);
    return res.status(400).json(formatResponse(null, false, "Lỗi khi tìm Comment!"));
  }


});

const update_ReplyComment = asyncHandle(async (req, res) => {

  const commentID = req.params.CommentID;
  const replyComment_id = req.params.ReplyCommentID;


  const content = req.body.content;
  const image = await uploadImage(req.files);

  const comment = await Comment.findById(commentID);
  const replyComment = comment.comment_reply;

  try {
    if (!comment || !replyComment) {
      console.log("Không thấy Comment!");
      return res.status(400).json(formatResponse(null, false, "Không tìm thấy Comment!"));
    }
    else {
      for (const rc of replyComment) {
        if (rc._id.toString() === replyComment_id) {
          try {
            if (rc.updated_at == null) {

              const content_History = rc.content;
              const image_History = rc.image;
              const updated_History = rc.create_at;

              const historyUpdate = {
                content: content_History,
                images: image_History,
                updated_at: updated_History,
              };
              const replyComment = comment.comment_reply.id(replyComment_id);
              const addDataToHistory = replyComment.edit_history.push(historyUpdate)  //.findByIdAndUpdate(replyComment_id, { $push : {rc:  historyUpdate}}); // , { new: true }

              //const addDataToHistory = await rc.updateOne({$set: {edit_history: historyUpdate}})  //.findByIdAndUpdate(replyComment_id, { $push : {rc:  historyUpdate}}); // , { new: true }

              if (replyComment) {
                replyComment.content = content,
                  replyComment.image = image,
                  replyComment.updated_at = new Date();
              }
              await comment.save();
              //const updateDataToReplyComment = replyComment.updateOne({ $set: { content: content, image: image, updated_at: new Date()}});  

            } else {

              const content_History = rc.content;
              const image_History = rc.image;
              const updated_History = rc.updated_at;

              const historyUpdate = {
                content: content_History,
                images: image_History,
                updated_at: updated_History,
              };

              const replyComment = comment.comment_reply.id(replyComment_id);
              const addDataToHistory = replyComment.edit_history.push(historyUpdate)  //.findByIdAndUpdate(replyComment_id, { $push : {rc:  historyUpdate}}); // , { new: true }

              //const addDataToHistory = await rc.updateOne({$set: {edit_history: historyUpdate}})  //.findByIdAndUpdate(replyComment_id, { $push : {rc:  historyUpdate}}); // , { new: true }

              if (replyComment) {
                replyComment.content = content,
                  replyComment.image = image,
                  replyComment.updated_at = new Date();
              }
              await comment.save();
            }
          } catch (error) {
            return res.status(400).json(formatResponse(null, false, "Lỗi khi cập nhật ReplyComment!"));
          }
        }
      }
    }


    const commentAfterUpdate = await Comment.findById(commentID)
      .populate({
        path: "comment_reply",
        populate: {
          path: "user_id",
          select: "displayName",
        }
      })
    const commentReplyAfterUpdate = commentAfterUpdate.comment_reply;

    let data;
    commentReplyAfterUpdate.forEach(cr => {
      if (cr._id.toString() === replyComment_id) {
        console.log('Đối tượng ReplyComment mới:', cr);
        data = {
          UserID: cr.user_id,
          Content: cr.content,
          Image: cr.image.map(i => i.toString()),
          QuantityLike: cr.likes.length,
          CreateAt: moment(cr.create_at).format(),
          UpdateAt: moment(cr.updated_at).format()
        };
      }
    });
    return res.status(200).json(formatResponse(data, true, "Sửa đổi thành công"));

  } catch (error) {
    console.log("Error", error.message)
    return res.status(400).json(formatResponse(null, false, "Sửa đổi thất bại!"));
  }
});

const get_History_Update_ReplyComment = asyncHandle(async (req, res) => {
  const comment_id = req.query.CommentID;
  const replyComment_id = req.query.ReplyCommentID;

  const comment = await Comment.findById(comment_id);
  const replyComment = comment.comment_reply;


  if (!comment) {
    console.log("Không thấy Comment!");
    return res.status(400).json(formatResponse(null, false, "Không tìm thấy Comment!"));

  }
  let quantityUpdate = 0;
  let list_History_Update = [];

  replyComment.forEach(rc => {
    if (rc._id.toString() === replyComment_id) {
      const edit_history = rc.edit_history;
      edit_history.forEach(edh => {
        quantityUpdate++;
        list_History_Update.push({ Content: edh.content, Image: edh.images, UpdateAt: moment(edh.updated_at).format() });
      })
    }


  });

  const data = {
    UpdateNumber: quantityUpdate,
    History_Update: list_History_Update,
  }
  return res.status(200).json(formatResponse(data, true, "Đã lấy được danh sách lịch sử chỉnh sửa ReplyComment"));

})

const delete_ReplyComment = asyncHandle(async (req, res) => {
  const commentID = req.params.CommentID;
  const replyComment_id = req.params.ReplyCommentID;

  const comment = await Comment.findById(commentID);
  const replyComment = comment.comment_reply.id(replyComment_id);


  try {

    if (!comment || !replyComment) {
      return res.status(404).json(formatResponse(null, false, "không thấy Comment!!"));
    }

    comment.comment_reply = comment.comment_reply.filter(cr => cr._id.toString() !== replyComment_id);
    await comment.save();
    const data = {
      QuantityCommentReply: comment.comment_reply.length
    }
    return res.status(200).json(formatResponse(data, true, "Xóa ReplyComment thành công!!"));

  } catch (error) {
    console.error("Lỗi khi xóa comment", error);
    return res.status(400).json(formatResponse(null, false, "Lỗi khi xóa ReplyComment!!"))
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
    // Nếu lớn hơn 7 ngày, hiển thị số tuần
    // const weeks = Math.floor(duration.asDays() / 7);
    // return `${weeks} tuần trước`;
    return moment(fromDate).format("DD/MM/YYYY - HH:mm");
  }
}



const get_List_ReplyComment = asyncHandle(async (req, res) => {

  const comment_id = req.query.CommentID;

  try {
    const comment = await Comment.findById(comment_id)
      .populate({
        path: "comment_reply",
        populate: {
          path: "user_id",
          select: "displayName",
        }
      })

    const replyComment = comment.comment_reply;

    let quantityLike;
    const replyCommentS = [];
    let duration;
    let quantityReplyComment = 0;

    const sortData = replyComment.sort((a, b) => {
      return new Date(a.create_at) - new Date(b.create_at);
    });

    for (const rc of sortData) {
      quantityReplyComment++,
        quantityLike = rc.likes.length,
        duration = await formatTimeDifference(moment(rc.create_at), moment())


      replyCommentS.push({
        UserName: await getDisplayName_By_ID(rc.user_id),
        Content: rc.content,
        Image: rc.image,
        CreateAt: duration,
        QuantityLike: quantityLike,
      })
    };

    const data = {
      QuantityReplyComment: quantityReplyComment,
      Info_All_ReplyComment: replyCommentS,
    }

    return res.status(200).json(formatResponse(data, true, "Lấy các ReplyComment thành công"));

  } catch (error) {
    return res.status(400).json(formatResponse(null, false, "Lấy các ReplyComment thất bại!"));
  }
})





module.exports = {
  create_Comment,
  update_Comment,
  get_History_Update_Comment,
  delete_Comment,
  check_User_Like_Comment,
  add_OR_Delete_User_To_List_Like_Comment,
  get_List_User_To_Like_Comment,

  create_ReplyComment,
  update_ReplyComment,
  get_History_Update_ReplyComment,
  delete_ReplyComment,
  add_OR_Delete_User_To_List_Like_ReplyComment,
  get_List_User_To_Like_ReplyComment,

  get_List_ReplyComment,
};