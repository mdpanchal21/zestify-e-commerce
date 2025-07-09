const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { getProfile, updateProfile , uploadProfilePicture } = require("../controllers/userController");
const upload = require('../middlewares/upload'); 

// GET /api/user/profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.post("/upload-profile-picture", authMiddleware, upload.single("profileImage"), uploadProfilePicture);

module.exports = router;
