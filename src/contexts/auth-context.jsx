import { createContext, useContext, useState } from "react";

// Create the AuthContext
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [userAuth, setUserAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const username = localStorage.getItem("username");
    const profilePicture = localStorage.getItem("profilePicture");
    const coverPicture = localStorage.getItem("coverPicture");
    const newNotificationAvailable = localStorage.getItem("new_notification_available") === "true";

    return {
      isAuthenticated: !!token,
      token: token || null,
      userId: userId || "",
      username: username || "",
      profilePicture: profilePicture || "",
      coverPicture: coverPicture || "",
      new_notification_available: newNotificationAvailable,
    };
  });

  const login = (token, userId, username, profilePicture, coverPicture) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("username", username);
    localStorage.setItem("profilePicture", profilePicture || "");
    localStorage.setItem("coverPicture", coverPicture || "");
    localStorage.setItem("new_notification_available", "false");

    setUserAuth({
      isAuthenticated: true,
      token,
      userId,
      username,
      profilePicture: profilePicture || "",
      coverPicture: coverPicture || "",
      new_notification_available: false,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("profilePicture");
    localStorage.removeItem("coverPicture");
    localStorage.removeItem("new_notification_available");

    setUserAuth({
      isAuthenticated: false,
      username: "",
      userId: "",
      profilePicture: "",
      coverPicture: "",
      token: null,
      new_notification_available: false,
    });
  };

  // Fixed signup to include userId parameter
  const signup = (token, userId, username, profilePicture, coverPicture) => {
    login(token, userId, username, profilePicture, coverPicture);
  };

  const updateUser = (updatedUser) => {
    // Update localStorage for any changed values
    if (updatedUser.username !== undefined) {
      localStorage.setItem("username", updatedUser.username);
    }
    if (updatedUser.profilePicture !== undefined) {
      localStorage.setItem("profilePicture", updatedUser.profilePicture);
    }
    if (updatedUser.coverPicture !== undefined) {
      localStorage.setItem("coverPicture", updatedUser.coverPicture);
    }
    if (updatedUser.userId !== undefined) {
      localStorage.setItem("userId", updatedUser.userId);
    }

    setUserAuth(prev => ({
      ...prev,
      ...updatedUser
    }));
  };

  return (
    <AuthContext.Provider 
      value={{ 
        userAuth, 
        login, 
        logout, 
        signup, 
        updateUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}