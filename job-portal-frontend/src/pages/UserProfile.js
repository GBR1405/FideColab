import React, { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = process.env.REACT_APP_API_URL;
 
function UserProfile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
 
  useEffect(() => {
    fetchUserDetails();
  }, []);
 
  const fetchUserDetails = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) {
        setError("You must log in to view your profile.");
        return;
      }
 
      const response = await axios.get(
        `${apiUrl}/auth/user-profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );
    
 
      if (response.data.success) {
        setUser(response.data.user);
        sessionStorage.setItem("userData", JSON.stringify(response.data.user));
      } else {
        setError(response.data.message || "Could not fetch user details.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }
  };
 
  if (error) {
    return (
<div style={styles.container}>
<h2 style={styles.errorText}>{error}</h2>
</div>
    );
  }
 
  if (!user) {
    return (
<div style={styles.container}>
<div className="loader"></div>
<p style={styles.loadingText}>Fetching user data...</p>
</div>
    );
  }
 
  return (
<div style={styles.container}>
<div style={styles.card}>
<img
          src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`}
          alt="User Avatar"
          style={styles.avatar}
        />
<h2>{user.name}</h2>
<p><strong>Email:</strong> {user.email}</p>
<p><strong>Role:</strong> {user.role}</p>
<p><strong>Gender:</strong> {user.gender}</p>
<p><strong>Group:</strong> {user.groupName || "N/A"}</p>
</div>
</div>
  );
}
 
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    maxWidth: "300px",
  },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    marginBottom: "10px",
  },
  errorText: {
    color: "red",
  },
  loadingText: {
    fontSize: "18px",
    marginTop: "10px",
  },
};
 
export default UserProfile;