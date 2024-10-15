const express = require("express");
const router = express.Router();

const UploadImageMiddleware = require('../middleware/UploadImageMiddleware');


const { create_Share, 
        update_Share,
        delete_Share, 
        } = require("../controllers/ShareController");

router.post("/createShare/:SweetID", UploadImageMiddleware.array('image'), create_Share);
router.put("/updateShare/:ShareID", UploadImageMiddleware.array('image'), update_Share);
router.delete("/deleteShare/:ShareID", delete_Share);

module.exports = router;