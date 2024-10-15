const asyncHandle = require('express-async-handler')
const Share = require("../model/Share")
const Sweet = require("../model/Sweet")
const User = require("../model/User")
const Comment = require('../model/Comment');
const formatResponse = require('../common/ResponseFormat');
const { set } = require('mongoose');
const { query } = require('express');
const {uploadImage} = require('../config/cloudinaryConfig');
const UploadImageMiddleware = require('../middleware/UploadImageMiddleware');

const moment = require('moment-timezone');
const { createNotification } = require('./NotifyController');
moment.tz('Asia/Ho_Chi_Minh')

const create_Share = asyncHandle(async (req, res) => {

    const sweet_id = req.params.SweetID;
    const user_id = req.user.userId
    // const user_id = req.body.user_id;
    const content = req.body.content || '';
    const image = req.files ? await uploadImage(req.files) : null;

    const sweet = await Sweet.findById(sweet_id).populate('user_id', 'displayName username');
    if(sweet){
      const createNew = await Share.create({
        sweet_id: sweet_id,
        user_id: user_id,
        content: content,
        image: image,
      });

      const index_UserID_In_Share = sweet.shares.findIndex(share => share._id.toString() === user_id);
      
      if(index_UserID_In_Share === -1){
        const add_UserID_To_Share = await Sweet.findByIdAndUpdate(sweet_id, {$push: {shares: createNew.user_id}}).populate("user_id", "displayName");
        await sweet.save();
        const dataAddNotify = {
          content: `${req.user.displayName}${sweet.shares.length > 1 ? ` và ${sweet.shares.length - 1} người khác` : ''} đã chia sẻ bài viết của bạn.`,
          relateTo: user_id,
          tweetId: sweet_id,
          userId:sweet.user_id
        }
        await createNotification(dataAddNotify);
      }

      const sweetAfterUpdate = await Sweet.findById(sweet_id).populate('user_id', 'displayName username');


      const data = {
        UserName: await getDisplayName_By_ID(user_id),
        CreateAt: moment(createNew.created_at).format(),
        Content: createNew.content,
        Image: createNew.image,
        Sweet_Origin: createNew.sweet_id,
        UserName_Origin: sweet.user_id,
        CreateAT_Origin: moment(sweet.created_at).format(),
        Content_Origin: sweet.content,
        Image_Origin: sweet.image,
        QuantityShare_Origin: sweetAfterUpdate.shares.length,
        QuantityLike: createNew.likes.length,
        QuantityComment: createNew.comments.length,
      };

      return res.status(200).json(formatResponse(data, true, "Share bài viết thành công!!"));
   
    }else return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết để Share!"));
 
});

async function getDisplayName_By_ID(id){
  const use = await User.findById(id);
  if(!use){
    console.log("Không tìm thấy User!");
    return null;
  }
  else if(use.displayName===null){
    return use.username;
  }
  else if(use.username===null){
    return use.displayName;
  }
  return {DisplayName: use.displayName,
          UserName: use.username,}
}

const update_Share = asyncHandle(async (req, res) => {
    
    const share_id = req.params.ShareID;
    
    const content = req.body.content;
    const image = await uploadImage(req.files);

    const share = await Share.findById(share_id);

    try {
      if (!share) {
        console.log("Không thấy bài Share!");
        return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài Share!"));
  
      }
      try {
        if (share.updated_at == null) {
  
          const content_History = share.content;
          // const image_History = share.image;
          const updated_History = share.created_at;
  
          const historyUpdate = {
            content: content_History,
            // images: image_History,
            updated_at: updated_History,
          };
  
          const addDataToHistory = await Share.findByIdAndUpdate(share_id, { $push: { edit_history: historyUpdate } }); // , { new: true }
  
          const updateDataToSweet = await Share.findByIdAndUpdate(share_id, { $set: { content: content, updated_at: new Date() } });
  
        } else {

          const content_History = share.content;
          // const image_History = share.image;
          const updated_History = share.updated_at;
  
          const historyUpdate = {
            content: content_History,
            // images: image_History,
            updated_at: updated_History,
          };
  
          const addDataToHistory = await Share.findByIdAndUpdate(share_id, { $push: { edit_history: historyUpdate } }); // , { new: true }
  
          const updateData = await Share.findByIdAndUpdate(share_id, { $set: { content: content, updated_at: new Date() } });
  
  
        }
      } catch (error) {
        return res.status(400).json(formatResponse(null, false, "Lỗi khi cập nhật bài Share!"));
      }

      const shareAfterUpdate = await Share.findById(share_id);
      const id = shareAfterUpdate.sweet_id;
      console.log(id);
    if (shareAfterUpdate) {
      console.log('Đối tượng Share mới:', shareAfterUpdate);
      shareAfterUpdate
    } else {
      console.log('Không tìm thấy đối tượng Share.');
    }

    const sweet = await Sweet.findById(id).populate("user_id", "displayName");

    const data = {
      _id: share_id,
      UserName: await getDisplayName_By_ID(shareAfterUpdate.user_id),
      CreateAt: moment(shareAfterUpdate.created_at).format(),
      Content: shareAfterUpdate.content,
      Image: shareAfterUpdate.image,
      Sweet_Origin: Share.sweet_id,
      UserName_Origin: shareAfterUpdate.user_id,
      CreateAT_Origin: moment(sweet.created_at).format(),
      Content_Origin: sweet.content,
      QuantityLike: shareAfterUpdate.likes.length,
      QuantityComment: shareAfterUpdate.comments.length,
      UpdateAt: shareAfterUpdate.updated_at,
    };

    return res.status(200).json(formatResponse(data, true, "Sửa đổi thành công"));
  } catch (error) {
    console.log("Error", error.message)
    return res.status(400).json(formatResponse(null, false, "Sửa đổi thất bại!"));
  }
});

const delete_Share = asyncHandle(async(req, res) => {

    const share_id = req.params.ShareID;
  
    try {
        const share = await Share.findById(share_id);

        const user_id_In_Share = share.user_id;
    
        const sweet = await Sweet.findById(share.sweet_id);
        try {
            if (sweet) {
                const quantityShare = Share.find({user_id:share.user_id, sweet_id:share.sweet_id})
                const indexToRemove = sweet.shares.findIndex(share => share._id.toString() === user_id_In_Share.toString());
                if (((await quantityShare).length===1) && (indexToRemove !== -1)) {
                sweet.shares.splice(indexToRemove, 1);
                    try {
                        await sweet.save();
                        console.log('Đã xóa user_id trong list share của Sweet thành công.');
                    } catch (error) {
                        console.error('Lỗi khi xóa user_id trong list share của Sweet:', error);
                    }
                } 
            }else return res.status(400).json(formatResponse(null, false, "Không tìm thấy bài viết!"));


            const delete_Comment = await Comment.deleteMany({tweet_id: share_id});
            const delete_Share = await Share.findByIdAndDelete(share_id);

        } catch (error) {
            console.error("Lỗi khi xóa bài Share", error);
            return res.status(400).json(formatResponse(null, false, "Lỗi khi thực hiện xóa bài Share!"));
        }
        const sweetAfterUpdate = await Sweet.findById(share.sweet_id);
        data ={
            QuantityShare: sweetAfterUpdate.shares.length,
            Note: "Bài Share đã xóa!",
            //count: sweet.shares.length,
        }
    
        return res.status(200).json(formatResponse(data, true, ""));

    } catch (error) {
        return res.status(400).json(formatResponse("", false, "Không thể xóa bài Share"));
    }
})
  

module.exports = {  create_Share, 
                    update_Share,
                    delete_Share,
                  };