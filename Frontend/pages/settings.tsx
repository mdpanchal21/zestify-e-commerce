import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);
    setEmail(user.email || "");
  }, []);

  const handleSave = () => {
    alert("Settings updated! (not connected to backend yet)");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Account Settings</h2>
      <label>Email: </label>
      <input
        type="email"
        value={email}
        disabled
        style={{ display: "block", marginBottom: "1rem" }}
      />

      <label>New Password: </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: "1rem" }}
      />

      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
}
