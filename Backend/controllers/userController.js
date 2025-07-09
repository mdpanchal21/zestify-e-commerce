const { getDB } = require("../config/dbMongo");
const { ObjectId } = require("mongodb");

exports.getProfile = async (req, res) => {
  const db = getDB();
  const email = req.user.email;

  try {
    const user = await db.collection("users").findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await db
      .collection("orders")
      .aggregate([
        { $match: { userId: user._id } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: "$totalAmount" },
          },
        },
      ])
      .toArray();

    const stats = orders[0] || { totalOrders: 0, totalSpent: 0 };

    res.json({
      user: {
        name: user.name || "", // full name here
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        profileImage: user.profileImage || "",
        totalOrders: stats.totalOrders,
        totalSpent: stats.totalSpent,
        joinedSince: user.createdAt
          ? new Date(user.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "N/A",
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching profile", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const db = getDB();
  const email = req.user.email; // Identify the user based on token

  try {
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Build dynamic update object
    const { name, email: newEmail, phone, address } = req.body;
    const updateFields = {};

    if (name) updateFields.name = name;
    if (newEmail) updateFields.email = newEmail;
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;

    // If no updatable fields were provided
    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided to update" });
    }

    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: updateFields });

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating profile", error: err.message });
  }
};
exports.uploadProfilePicture = async (req, res) => {
  const db = getDB();
  const email = req.user.email;

  try {
    const user = await db.collection("users").findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const imagePath = `/uploads/profile-pictures/${req.file.filename}`;

    await db
      .collection("users")
      .updateOne({ _id: user._id }, { $set: { profileImage: imagePath } });

    res.json({ message: "Profile picture uploaded", imagePath });
  } catch (err) {
    res.status(500).json({
      message: "Error uploading profile picture",
      error: err.message,
    });
  }
};
