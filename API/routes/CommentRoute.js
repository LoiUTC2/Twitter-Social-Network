const express = require('express');
const router = express.Router();

const UploadImageMiddleware = require('../middleware/UploadImageMiddleware');


const { create_Comment, 
        update_Comment, 
        delete_Comment, 
        check_User_Like_Comment,
        add_OR_Delete_User_To_List_Like_Comment,
        get_List_User_To_Like_Comment,
        get_History_Update_Comment,
        create_ReplyComment,
        update_ReplyComment,
        delete_ReplyComment,
        get_History_Update_ReplyComment,
        add_OR_Delete_User_To_List_Like_ReplyComment,
        get_List_User_To_Like_ReplyComment,
        get_List_ReplyComment,
        } = require("../controllers/CommentController");

router.post('/createComment/:SweetID', UploadImageMiddleware.array('image'), create_Comment);
router.put('/updateComment/:CommentID', UploadImageMiddleware.array('image'), update_Comment);
router.get('/getListHistoryUpdate', get_History_Update_Comment);
router.delete('/deleteComment/:CommentID', delete_Comment);

router.get('/checkLikeComment', check_User_Like_Comment);
router.put('/likeComment/:CommentID', add_OR_Delete_User_To_List_Like_Comment);
router.get('/getListlikeComment', get_List_User_To_Like_Comment);


router.post('/createReplyComment/:CommentID', UploadImageMiddleware.array('image'),create_ReplyComment);
router.put('/updateReplyComment/:CommentID/:ReplyCommentID', UploadImageMiddleware.array('image'), update_ReplyComment);
router.get('/getListHistoryUpdateReply', get_History_Update_ReplyComment);
router.delete('/deleteReplyComment/:CommentID/:ReplyCommentID', delete_ReplyComment);

router.put('/likeReplyComment/:CommentID/:ReplyCommentID', add_OR_Delete_User_To_List_Like_ReplyComment);
router.get('/getListlikeReplyComment', get_List_User_To_Like_ReplyComment);

router.get('/getListReplyComment', get_List_ReplyComment);



module.exports = router;