const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

const {
  getAllMembers,
  updateMemberFieldsPost,
  deleteMemberDetailsPost,
} = require("../controllers/membersController");

// Set up multer
const upload = multer({
  dest: path.join(__dirname, "../temp"), // temporary path before renaming
});

// Routes
router.get("/", getAllMembers);
router.post("/update", upload.single("img"), updateMemberFieldsPost);
router.post("/delete-details", deleteMemberDetailsPost);

module.exports = router;
  