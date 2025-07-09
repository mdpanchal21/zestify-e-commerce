import { useState, useEffect } from "react";
import axios from "axios";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [recentAddress, setRecentAddress] = useState(""); // 🆕

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedAddress, setEditedAddress] = useState("");
  const [settingsTab, setSettingsTab] = useState<string | null>(null);
  type NotificationKey =
    | "orderUpdates"
    | "promotions"
    | "newsletter"
    | "recommendations"
    | "security";

  const [notifications, setNotifications] = useState<
    Record<NotificationKey, boolean>
  >({
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    recommendations: false,
    security: true,
  });

  const notificationItems: {
    key: NotificationKey;
    title: string;
    desc: string;
    disabled?: boolean;
  }[] = [
    {
      key: "orderUpdates",
      title: "Order Updates",
      desc: "Get notified about order status changes",
    },
    {
      key: "promotions",
      title: "Promotions & Offers",
      desc: "Receive exclusive deals and discounts",
    },
    {
      key: "newsletter",
      title: "Newsletter",
      desc: "Weekly updates and new arrivals",
    },
    {
      key: "recommendations",
      title: "Product Recommendations",
      desc: "Personalized product suggestions",
    },
    {
      key: "security",
      title: "Security Alerts",
      desc: "Important account security notifications",
      disabled: true,
    },
  ];
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [privacy, setPrivacy] = useState({
    profileVisibility: "private",
    dataCollection: false,
    analytics: true,
    thirdPartySharing: false,
    marketingData: false,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        // Get user profile
        const res = await axios.get("http://localhost:5000/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);

        // 🆕 Fetch recent address
        const recentRes = await axios.get(
          "http://localhost:5000/api/orders/recent-address",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRecentAddress(recentRes.data.shippingAddress || "");
      } catch (error) {
        console.error("Error fetching profile or recent address:", error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");

      const updatedData = {
        name: editedUser.name,
        email: editedUser.email,
        phone: editedUser.phone,
        address: editedUser.address || "",
      };

      await axios.put("http://localhost:5000/api/user/profile", updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser({ ...editedUser });
      alert("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar-container">
          <img
            src={
              user.profileImage
                ? `http://localhost:5000${user.profileImage}`
                : "/default-avatar.png"
            }
            alt="avatar"
            className="profile-avatar"
          />

          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0] || null;
              setProfileImage(file);
              if (file) {
                try {
                  const token = localStorage.getItem("token");
                  const formData = new FormData();
                  formData.append("profileImage", file);
                  const res = await axios.post(
                    "http://localhost:5000/api/user/upload-profile-picture",
                    formData,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                      },
                    }
                  );
                  setUser((prev: any) => ({
                    ...prev,
                    profileImage: res.data.imagePath,
                  }));
                  alert("Profile picture uploaded successfully!");
                  setProfileImage(null);
                } catch (err) {
                  console.error("Failed to upload profile image", err);
                  alert("Failed to upload profile image");
                }
              }
            }}
            style={{ display: "none" }}
            id="profile-upload"
          />

          <label
            htmlFor="profile-upload"
            className="edit-avatar-btn"
            style={{ cursor: "pointer" }}
          >
            📷
          </label>
        </div>

        <div className="profile-info">
          <h1 className="profile-name">
            Welcome back, {user.name?.split(" ")[0]}!
          </h1>
          <p className="join-date">Member since {user.joinedSince}</p>
        </div>
        <div className="profile-stats">
          <div>
            <h2>{user.totalOrders}</h2>
            <p>Total Orders</p>
          </div>
          <div>
            <h2>₹{user.totalSpent.toLocaleString()}</h2>
            <p>Total Spent</p>
          </div>
        </div>
      </div>

      <div className="profile-body">
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="card-header">
            <h3>My Account</h3>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {["profile", "addresses", "settings"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: activeTab === tab ? "#3b82f6" : "#f3f4f6",
                  color: activeTab === tab ? "white" : "#111827",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "profile" && (
          <div className="card">
            <div className="card-header">
              <h3>Personal Information</h3>
              <button
                onClick={() => {
                  setEditedUser({ ...user });
                  setIsEditing(true);
                }}
              >
                Edit
              </button>
            </div>
            <div className="card-content">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={isEditing ? editedUser?.name || "" : user.name}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      [e.target.name]: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={isEditing ? editedUser?.email || "" : user.email}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      [e.target.name]: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={isEditing ? editedUser?.phone || "" : user.phone}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setEditedUser({
                      ...editedUser,
                      [e.target.name]: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Member Since</label>
                <input type="text" value={user.joinedSince} disabled />
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn-primary" onClick={handleSaveChanges}>
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="card">
            <div className="card-header">
              <h3>Saved Addresses</h3>
              {/* <button className="btn-primary">Add New Address</button> */}
            </div>
            <div
              className="card-content"
              style={{ gridTemplateColumns: "1fr 1fr" }}
            >
              {/* Home Address */}
              <div className="address-box home-address">
                <div className="address-header">
                  <span className="badge badge-default">Default</span>
                  {!isEditingAddress ? (
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setEditedAddress(user.address || "");
                        setIsEditingAddress(true);
                      }}
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="address-edit-actions">
                      <button
                        className="btn-secondary"
                        onClick={() => setIsEditingAddress(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn-primary"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token");
                            await axios.put(
                              "http://localhost:5000/api/user/profile",
                              { ...user, address: editedAddress },
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              }
                            );
                            setUser((prev: any) => ({
                              ...prev,
                              address: editedAddress,
                            }));
                            setIsEditingAddress(false);
                            alert("Address updated successfully!");
                          } catch (error) {
                            console.error("Error updating address:", error);
                            alert("Failed to update address.");
                          }
                        }}
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
                <p className="address-title">Home Address</p>
                {!isEditingAddress ? (
                  <p className="address-desc">
                    {user.address || "No address saved yet."}
                  </p>
                ) : (
                  <input
                    type="text"
                    value={editedAddress}
                    onChange={(e) => setEditedAddress(e.target.value)}
                    className="address-input"
                  />
                )}
              </div>
              {/* Recent Order Address */}
              <div className="address-box recent-address">
                <div className="address-header">
                  <span className="badge badge-info">Recent</span>
                </div>
                <p className="address-title">Recent Order Address</p>
                <p className="address-desc">
                  {recentAddress ? recentAddress : "No recent orders found."}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="card settings-card">
            {settingsTab === null && (
              <div className="card-content settings-list">
                <h3 className="settings-title">Account Settings</h3>

                <div
                  className="settings-item"
                  onClick={() => setSettingsTab("email")}
                >
                  <div>
                    <p className="settings-item-title">Email Notifications</p>
                    <p className="settings-item-desc">
                      Manage your email preferences
                    </p>
                  </div>
                  <span className="settings-arrow">→</span>
                </div>

                <div
                  className="settings-item"
                  onClick={() => setSettingsTab("privacy")}
                >
                  <div>
                    <p className="settings-item-title">Privacy Settings</p>
                    <p className="settings-item-desc">Control your privacy</p>
                  </div>
                  <span className="settings-arrow">→</span>
                </div>

                <div
                  className="settings-item"
                  onClick={() => setSettingsTab("password")}
                >
                  <div>
                    <p className="settings-item-title">Change Password</p>
                    <p className="settings-item-desc">Secure your account</p>
                  </div>
                  <span className="settings-arrow">→</span>
                </div>
              </div>
            )}

            {settingsTab === "email" && (
              <div className="email-notifications">
                <div className="email-header">
                  <button
                    onClick={() => setSettingsTab(null)}
                    className="back-button"
                  >
                    ←
                  </button>
                  <h2>Email Notifications</h2>
                </div>

                <div className="card">
                  <div className="card-title">
                    <span className="mail-icon">📧</span>
                    <h3>Notification Preferences</h3>
                  </div>
                  <div className="card-content">
                    {notificationItems.map(({ key, title, desc, disabled }) => (
                      <div
                        key={key}
                        className="row align-center justify-between"
                      >
                        <div>
                          <strong>{title}</strong>
                          <p>{desc}</p>
                        </div>
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={notifications[key]}
                            onChange={() =>
                              !disabled &&
                              setNotifications((prev) => ({
                                ...prev,
                                [key]: !prev[key],
                              }))
                            }
                            disabled={disabled}
                          />
                          <span className="slider round"></span>
                        </label>
                      </div>
                    ))}

                    <div className="notification-actions">
                      <button
                        onClick={() => setSettingsTab(null)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button className="btn-primary">Save Preferences</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === "privacy" && (
              <div className="card-content">
                <div className="row align-center mb-large">
                  <button
                    onClick={() => setSettingsTab(null)}
                    className="back-button"
                  >
                    ←
                  </button>
                  <h2 className="heading-xl ml-medium">Privacy Settings</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="profile-label">Profile Visibility</label>
                    <p className="profile-desc">
                      Control who can see your profile information
                    </p>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          value="public"
                          checked={privacy.profileVisibility === "public"}
                          onChange={() =>
                            setPrivacy((prev) => ({
                              ...prev,
                              profileVisibility: "public",
                            }))
                          }
                        />
                        Public
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          value="private"
                          checked={privacy.profileVisibility === "private"}
                          onChange={() =>
                            setPrivacy((prev) => ({
                              ...prev,
                              profileVisibility: "private",
                            }))
                          }
                        />
                        Private
                      </label>
                    </div>
                  </div>

                  {[
                    {
                      key: "dataCollection",
                      title: "Data Collection",
                      desc: "Allow collection of browsing data for improvements",
                    },
                    {
                      key: "analytics",
                      title: "Analytics",
                      desc: "Help improve our service with usage analytics",
                    },
                    {
                      key: "thirdPartySharing",
                      title: "Third-party Sharing",
                      desc: "Share data with trusted partners",
                    },
                    {
                      key: "marketingData",
                      title: "Marketing Data Usage",
                      desc: "Use purchase history for targeted marketing",
                    },
                  ].map(({ key, title, desc }) => (
                    <div key={key} className="row align-center justify-between">
                      <div>
                        <label className="label-base">{title}</label>
                        <p className="desc-base">{desc}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={
                          privacy[key as keyof typeof privacy] as boolean
                        }
                        onChange={() =>
                          setPrivacy((prev) => ({
                            ...prev,
                            [key]: !prev[key as keyof typeof privacy],
                          }))
                        }
                      />
                    </div>
                  ))}

                  <div className="row justify-end actions-row">
                    <button
                      onClick={() => setSettingsTab(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button className="btn-primary">Save Settings</button>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === "password" && (
              <div className="card-content">
                <div className="row align-center mb-large">
                  <button
                    onClick={() => setSettingsTab(null)}
                    className="back-button"
                  >
                    ←
                  </button>
                  <h2 className="heading-xl ml-medium">Change Password</h2>
                </div>

                <div className="space-y-4">
                  {["current", "new", "confirm"].map((field) => (
                    <div className="form-group" key={field}>
                      <label className="label-block">
                        {field === "confirm"
                          ? "Confirm New Password"
                          : field + " Password"}
                      </label>
                      <div className="relative">
                        <input
                          type={
                            showPasswords[field as keyof typeof showPasswords]
                              ? "text"
                              : "password"
                          }
                          value={passwords[field as keyof typeof passwords]}
                          onChange={(e) =>
                            setPasswords((prev) => ({
                              ...prev,
                              [field]: e.target.value,
                            }))
                          }
                          placeholder={`Enter your ${
                            field === "confirm"
                              ? "new password again"
                              : field + " password"
                          }`}
                          className="input-full"
                        />
                        <button
                          type="button"
                          className="password-toggle-btn"
                          onClick={() =>
                            setShowPasswords((prev) => ({
                              ...prev,
                              [field]:
                                !prev[field as keyof typeof showPasswords],
                            }))
                          }
                        >
                          {showPasswords[field as keyof typeof showPasswords]
                            ? "🙈"
                            : "👁️"}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="password-requirements-box">
                    <h4 className="password-req-title">
                      Password Requirements
                    </h4>
                    <ul className="password-req-list">
                      <li>• At least 8 characters long</li>
                      <li>• Uppercase and lowercase letters</li>
                      <li>• At least one number</li>
                      <li>• At least one special character</li>
                    </ul>
                  </div>

                  <div className="row justify-end actions-row">
                    <button
                      onClick={() => setSettingsTab(null)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button className="btn-primary">Update Password</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
