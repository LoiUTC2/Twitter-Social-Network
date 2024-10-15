const express = require('express');
const router = express.Router();
const { registerUser, editUser, addFollowUser, getUser, searchUsers, getListUserUnFollow,getListUserOnline} = require("../controllers/UserController");
const { getNotificationsByUser } = require('../controllers/NotifyController');
const UploadImageMiddleware = require('../middleware/UploadImageMiddleware');

router.put("/edit",UploadImageMiddleware.array('image'), editUser);
router.post("/addFollow", addFollowUser);

router.get("/search", searchUsers);
router.get("/getListUserUnFollow", getListUserUnFollow);
router.get("/getallnotify", getNotificationsByUser);
router.get("/getuseronline", getListUserOnline);
 router.get("/:id", getUser);




module.exports = router;