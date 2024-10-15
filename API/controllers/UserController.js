const asyncHandle = require('express-async-handler')
const User = require('../model/User');
const Sweet = require('../model/Sweet');
const formatResponse = require('../common/ResponseFormat');
const { getUsersOnline } = require('../config/redisConfig');
const { createNotification } = require('./NotifyController');
const { ObjectId } = require('mongodb')
const { uploadImage } = require('../config/cloudinaryConfig');
const editUser = asyncHandle(async (req, res) => {
    const userId = req.user.userId;
    const { displayName, bio, dob, userName, email } = req.body;
    const image = req.files && await uploadImage(req.files);
    try {
        const existingUsername = await User.findOne({ username: userName });
        if (existingUsername && existingUsername._id != userId) {
            return res.status(400).json(formatResponse(null, false, "Username đã tồn tại"));
        }
        const existingEmail = await User.findOne({ email: email });
        if (existingEmail && existingEmail._id != userId) {
            return res.status(400).json(formatResponse(null, false, "Email đã tồn tại"));
        }
        const updatedUser = await User.findByIdAndUpdate(userId, { userName, email, bio, displayName }, { new: true });
        if (!!image)
        {
            console.log('upload', image[0]);
            await User.findByIdAndUpdate(userId, { avatar:image[0] }, { new: true });
        } else if (!!dob)
        {
            await User.findByIdAndUpdate(userId, { dob }, { new: true });
            }
        if (!updatedUser) {
            return res.status(400).json(formatResponse(null, false, "Update user failed"));
        }

        const data = {
            username: updatedUser.userName,
            displayName: updatedUser.username,
            email: updatedUser.email,
            bio: updatedUser.bio,
            dob: updatedUser.dob
        };

        res.status(200).json(formatResponse(data, true, ""));
    } catch (error) {
        console.error('Error editing user information:', error);
        res.status(500).json(formatResponse(null, false, "Update user failed. Error:" + error.message));
    }
});

const addFollowUser = asyncHandle(async (req, res) => {
    const userId = req.user.userId;
    const followUserId = req.body.followUserId;
    if (!followUserId) {
        return res.status(400).json(formatResponse(null, false, "Not found user id"));
    }
    try {
        // Tìm người dùng hiện tại và người dùng được theo dõi
        const user = await User.findById(userId);
        const followUser = await User.findById(followUserId);
        if (!user || !followUser) {
            return res.status(400).json(formatResponse(null, false, "Not found user"));
            //remove return res.status(404).json({ message: 'User or follow user not found' });
        }

        // Thêm người dùng được theo dõi vào danh sách theo dõi của người dùng hiện tại
        if (!followUser.followers.includes(userId)) {

            followUser.followers.push(userId);
            user.following.push(followUserId);
            await followUser.save();
            await user.save();
            //Tạo notify
            const dataAddNotify = {
                userId: followUser._id,
                content: '${req.user.displayName} đã theo dõi bạn.',
                relateTo: userId,
            }
            await createNotification(dataAddNotify)
            const data = {
                userId: user._id,
                following: user.following.length,
                followUser: user.followers.length,
                message: "Follow user successfully",
                action: "follow"
            }
            res.status(200).json(formatResponse(data, true, ""));
        } else {
            followUser.followers = followUser.followers.filter(id => id != userId);

            await followUser.save();
            user.following = user.following.filter(id => id != followUserId);
            await user.save();
            const data = {
                userId: user._id,
                following: user.following.length,
                followUser: user.followers.length,
                message: "Unfollow user successfully",
                action: "unfollow"
            }
            res.status(200).json(formatResponse(data, true, ""));
        }
    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json(formatResponse(null, false, error.message));
    }

});

const getUser = asyncHandle(async (req, res) => {
    try {
        const id = req.params.id;
        // Query the database to find the user by id
        const user = await User.findById(id);
        const sweetList=await Sweet.find({user_id: user?._id})
        // Check if user exists
        if (!user) {
            return res.status(404).json(formatResponse(null, false, "User not found"));
        }
        const followingUsers = await User.find({ _id: { $in: user.following } }).select('username displayName avatar');
        const followerUsers = await User.find({ _id: { $in: user.followers } }).select('username displayName avatar');

        const data = {
            userId: user._id,
            following:followingUsers,
            followUser: followerUsers,
            userName: user.username,
            displayName: user.displayName,
            bio: user.bio ?? "",
            dob: user.dob ?? "",
            email: user?.email, 
            avatar:user?.avatar,
            createdAt:user.created_at.toLocaleDateString(),
            statusList:sweetList

        }
        return res.status(200).json(formatResponse(data, true, ""));

    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(null, false, "Internal Server Error"));
    }
});

const searchUsers = asyncHandle(async (req, res) => {
    try {
        const { query, skip = 0, limit = 10 } = req.query;
        const searchRegex = new RegExp(query, 'i');

        const users = await User.find({
            $or: [
                { username: { $regex: searchRegex } },
                { displayName: { $regex: searchRegex } }
            ]
        })
        .select('username displayName avatar')
        .skip(parseInt(skip))
        .limit(parseInt(limit));

        const totalUsers = await User.countDocuments({
            $or: [
                { username: { $regex: searchRegex } },
                { displayName: { $regex: searchRegex } }
            ]
        });

        return res.status(200).json(formatResponse({
            users,
            totalUsers
        }, true, ""));
    } catch (error) {
        console.error(error);
        res.status(500).json(formatResponse(null, false, "Internal Server Error"));
    }
});


const getListUserUnFollow = asyncHandle(async (req, res) => {
    const user_id = req.user.userId;
    //const user_id = req.query.UserID;

    // Lấy người dùng hiện tại
    const user = await User.findById(user_id);

    // Lấy danh sách người dùng không được theo dõi và giới hạn số lượng kết quả là 10
    const usersNotFollowing = await User.find({
        _id: { $nin: [...user?.following, user_id] } // Không nằm trong danh sách đang theo dõi và không phải chính user_id
    }).limit(10).select('displayName username _id');

    try {
        return res.status(200).json(formatResponse(usersNotFollowing, true, "Lấy danh sách người dùng chưa follow thành công!!"))
    } catch (error) {
        return res.status(400).json(formatResponse("", false, "Lỗi khi Lấy danh sách người dùng liên quan!"));
    }
});

//API lấy user đang follow và đang online
const getListUserOnline = asyncHandle(async (req, res) => {
    const userId = req.user.userId;
    try {
        // Lấy danh sách người dùng đang online
        const onlineUsers = await getUsersOnline();

        const userFollowing = await User.findById(userId).populate('following', 'displayName username _id');

        // Lọc danh sách người dùng đang online mà cũng được theo dõi bởi người dùng hiện tại
        const followingOnlineUsers = userFollowing.following.filter(user => onlineUsers.includes(user?._id.toString()));

        return res.status(200).json(formatResponse(followingOnlineUsers, true, "Lấy danh sách người dùng đang online thành công!!"));
    } catch (error) {
        console.error("Lỗi lấy danh sách người dùng đang online: ", error.message);
        return res.status(400).json(formatResponse("", false, "Lỗi khi lấy danh sách người dùng đang online!!"));
    }
});



module.exports = { editUser, addFollowUser, getUser, searchUsers, getListUserUnFollow, getListUserOnline }
