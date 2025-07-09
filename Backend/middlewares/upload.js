const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set storage destination and filename dynamically
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = "uploads/";

    // Check request path or a custom field to decide folder
    if (req.url.includes("profile-picture")) {
      dest = "uploads/profile-pictures/";
    } else if (req.url.includes("product")) {
      dest = "uploads/product-images/";
    }

    // Create the folder if it doesn't exist
    fs.mkdirSync(dest, { recursive: true });

    cb(null, dest);
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// Filter image files only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (isValid) cb(null, true);
  else cb(new Error("Only image files allowed (jpeg, jpg, png, gif)"));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
