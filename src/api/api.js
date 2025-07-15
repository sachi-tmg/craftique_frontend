import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerUser = (
  data
) => {
  return api.post("api/user/registerUser", data);
};

export const loginUser = (
  data
) => {
  return api.post("api/user/login", data);
};

export const sendOtp = async (email, fullName, password) => {
  return api.post('/api/user/auth/send-otp', { email, fullName, password });
};

export const verifyOtp = async (email, otp) => {
  const response = await api.post('/api/user/verify-otp', { email, otp });
  return response.data;
};

export const getProfileInfo = (data) => {
  // This endpoint expects a POST request with the username in the body.
  return api.post("api/user/profile", data);
};

export const getCurrentUser = (token) => {
  return api.get("api/user/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Add these to your api.js
export const updateUserProfile = (data, token) => 
  api.put("/api/user/update-profile", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateUserPassword = (currentPassword, newPassword, token) => 
  api.put("/api/user/update-password", { currentPassword, newPassword }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const updateUserNotifications = (settings, token) => 
  api.put("/api/user/update-notifications", settings, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const deleteUserAccount = (token) => 
  api.delete("/api/user/delete-account", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const uploadProfilePicture = (formData, token) =>
  api.post("/api/user/upload-profile-picture", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

export const uploadCoverPicture = (formData, token) =>
  api.post("/api/user/upload-cover-picture", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
//creation
export const uploadCreationImage = (formData) =>
    api.post("api/creation/creationImage", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const publishCreation = (data, token) => 
    api.post("api/creation/publish-creation", data, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

export const updateCreation = (creationId, data, token) => 
  api.put(`api/creation/${creationId}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

// Delete a creation
export const deleteCreation = (creationId, token) => 
  api.delete(`api/creation/${creationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const latestCreations = (data) => api.post("api/creation/latest-creations", data);
export const getTrendingCreations = () => api.get("api/creation/trending-creations");
export const countAllCreations = () => api.get("api/creation/count-all-creations");
export const getFeaturedCreations = () => api.get("api/creation/featured-creations");


export const getCreationById = async (creationId) => {
  try {
    const response = await api.get(`api/creation/${creationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching creation with ID ${creationId}:`, error);
    throw error;
  }
};

export const checkFollowStatus = (data, token) => api.post("api/user/check-follow", data, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Collections endpoints
export const getUserCreations = (userId) => api.get(`api/creation?user=${userId}`);

export const toggleFollow = (data, token) => {
    return api.post("api/user/toggle-follow", data, { // Assuming your toggleFollow endpoint is POST /api/user/toggle-follow
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
};

// cart
// api.js
export const addToCart = async (creationId, token) => {
  try {
    if (token) {
      // Authenticated user - call backend API
      const response = await api.post("/api/cart/add", { creationId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    }
    // For guest users, we'll handle this in the frontend
    throw new Error("Guest cart handled locally");
  } catch (error) {
    console.error("Error adding to cart:", error.response?.data || error.message);
    throw error;
  }
};

export const getCart = async (token) => {
  if (token) {
    return api.get("/api/cart", {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  // For guest users, we'll handle this in the frontend
  throw new Error("Guest cart handled locally");
};

export const removeFromCart = async (creationId, token) => {
  if (token) {
    return api.post("/api/cart/remove", { creationId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
  // For guest users, we'll handle this in the frontend
  throw new Error("Guest cart handled locally");
};

// api.js
export const mergeGuestCart = async (cartItems, token) => {
  try {
    const creationIds = cartItems.map(item => item._id);
    const response = await api.post("/api/cart/add-multiple", 
      { items: creationIds },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error merging carts:", error);
    throw error;
  }
};

export const mergeCarts = async (cartItems, token) => {
  try {
    // First get the user's current cart
    const currentCart = await getCart(token);
    const existingItems = currentCart.data?.items || [];
    const existingIds = existingItems.map(item => item.creationId.toString());

    // Filter out items already in cart
    const itemsToAdd = cartItems.filter(
      item => !existingIds.includes(item._id.toString())
    );

    // Add new items
    const results = await Promise.all(
      itemsToAdd.map(item => 
        addToCart(item._id, token)
      )
    );

    return {
      success: true,
      addedCount: results.length,
      message: `Added ${results.length} items to your cart`
    };
  } catch (error) {
    console.error("Failed to merge carts:", error);
    throw error;
  }
};

// api.js or wherever you manage your API calls
export const generateEsewaForm = (amount, token) => {
  return api.post('/api/payment/generate-esewa-form', { amount }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

// --- Favorites Endpoints ---
export const getFavorites = async (token) => {
    try {
        const response = await api.get('/api/favorite', {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data; // Should return { data: [favorite1, favorite2, ...] }
    } catch (error) {
        throw error;
    }
};

export const toggleFavoriteAPI = async (creationId, token) => { // This 'creationId' should be the MongoDB '_id'
    try {
        const response = await api.post('/api/favorite/toggle', { creationId }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // The backend should return whether it's now favorited or not,
        // and a message.
        // Example: { success: true, message: "Added to favorites", isFavorited: true }
        return response.data;
    } catch (error) {
        console.error("API Error toggling favorite:", error);
        throw error;
    }
};


export const checkFavoriteStatusAPI = (creationId, token) =>
  api.get(`/api/favorite/status/${creationId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const toggleLike = async (creationId, token) => {
  console.log('[API DEBUG] toggleLike called with:', {
    creationId,
    hasToken: !!token
  });
  
  try {
    const response = await api.post(
      '/api/likes',
      { creationId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('[API DEBUG] toggleLike successful response:', {
      status: response.status,
      data: response.data
    });
    return response.data;
  } catch (error) {
    console.error('[API DEBUG] toggleLike error:', {
      message: error.message,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      },
      response: error.response ? {
        status: error.response.status,
        data: error.response.data
      } : 'No response'
    });
    throw error;
  }
};

export const checkLikeStatus = async (creationId, token) => {
  try {
    const response = await api.get(
      `/api/status/${creationId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error) {
    console.error("Error checking like status:", error);
    throw error;
  }
};

export const getComments = async (creationId) => {
    try {
        const response = await api.get(`/api/comments/${creationId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching comments:", error);
        throw error;
    }
};

// Post comment or reply
export const postComment = async (creationId, commentText, token, parentId = null) => {
    try {
        const response = await api.post(
            '/api/comments',
            { creationId, comment: commentText, parentId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error posting comment:", error);
        throw error;
    }
};

// Like/unlike comment
export const toggleCommentLike = async (commentId, token) => {
    try {
        const response = await api.post(
            `/api/comments/${commentId}/like`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
    } catch (error) {
        console.error("Error toggling comment like:", error);
        throw error;
    }
};

export const searchCreations = ({ tag, query, userId, page, eliminate_creation_id }) => {
    // CORRECTED: Use your configured 'api' instance
    return api.post('api/creation/search-creations', { tag, query, userId, page, eliminate_creation_id });
};

export const countSearchCreations = ({ tag, query, userId }) => {
    // CORRECTED: Use your configured 'api' instance
    return api.post('api/creation/count-search-creations', { tag, query, userId });
};

export const searchUsers = ({ query, page = 1 }) => {
    // CORRECTED: Use your configured 'api' instance
    return api.post('api/user/search-users', { query, page });
};

export const savingOrders = (data, token) => {
  // Make sure token is properly received
  console.log('[API DEBUG] Received token:', token); // Add this
  
  return api.post("/api/orders", data, {
    headers: {
      Authorization: `Bearer ${token}`, // This should now work
      "Content-Type": "application/json",
    },
  });
};


// In your frontend api.js
export const clearCartAPI = async (token) => {
  return api.delete("/api/cart/clear", {
    headers: { Authorization: `Bearer ${token}` }
  });
};

// Send password reset email
export const sendPasswordResetEmail = async (email) => {
  const response = await api.post('/api/user/auth/forgot-password', { email });
  return response.data;
};

// Reset password with token
export const resetPassword = async (token, email, newPassword) => {
  const response = await api.post('/api/user/auth/reset-password', {
    token,
    email,
    newPassword
  });
  return response.data;
};

export const sendContactMessage = (data) => {
  return api.post("/api/contact", data); // uses your axios instance with baseURL
};

// Add these notification endpoints
export const getNotificationsAvailability = (token) => 
  api.get("/api/notifications/availability", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

export const getNotifications = ({ page, filter, deletedDocCount }, token) => 
  api.post("/api/notifications", { page, filter, deletedDocCount }, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

export const countNotifications = ({ filter }, token) => 
  api.post("/api/notifications/count", { filter }, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

export const markAllNotificationsAsRead = (token) =>
  api.put("/api/notifications/mark-all-read", {}, {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });

  export const getMyOrders = (token) =>
  api.get("/api/orders/my", {
    headers: { Authorization: `Bearer ${token}` },
  });
