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

export const uploadProfilePicture = (
  formData
) => {
  return api.post("api/regular-users/uploadImage", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// export const updateProfile = (data, token) => 
//     api.put("api/regular-users/save", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });
// export const changePassword = (data, token) => 
//     api.post("api/user/change-password", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });


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
export const latestCreations = (data) => api.post("api/creation/latest-creations", data);
export const searchCreations = (data) => api.post("api/creation/search-creations", data);
export const getTrendingCreations = () => api.get("api/creation/trending-creations");
export const countAllCreations = () => api.get("api/creation/count-all-creations");
export const countSearchCreations = (data) => api.post("api/creation/count-search-creations", data);

export const getCreationById = async (creationId) => {
  try {
    // FIX: Use 'api.get' instead of 'axios.get'
    const response = await api.get(`api/creation/${creationId}`);
    return response.data; // Assuming your API returns the single creation object directly
  } catch (error) {
    console.error(`Error fetching creation with ID ${creationId}:`, error);
    throw error;
  }
};

// export const countRouteBlogs = (data) => api.post("api/blog/all-latest-blogs-count", data);
// export const getTrendingBlogs = (params) => api.get("api/blog/trending-blogs", { params });
// export const viewFullBlog = (data) => api.post("api/blog/blog-view", data);

// //profile
// export const getProfileInfo = (data) => api.post("api/regular-users/get-profile", data);

// //like blogs
// export const likingBlog = (data, token) => 
//     api.post("api/blog/like-blog", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });

// export const isUserLiked = (data, token) => 
//     api.post("api/blog/is-liked-by-user", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });

// // comment
// export const addComment = (data, token) => 
//     api.post("api/comment/create-comment", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });

// export const fetchingComments = (data) => api.post("api/comment/get-blog-comments", data);
// export const deletingComments = (data, token) => 
//     api.post("api/comment/delete-comment", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });


// // notification
// export const getNotificationsAvailability = (token) => 
//     api.get("api/blog/new-notification", {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });

// export const getNotifications = ({ page, filter, deleteDocCount }, token) => 
//     api.post("api/blog/notifications", { page, filter, deleteDocCount }, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });

// export const countNotifications = (data, token) => 
//     api.post("api/blog/all-notifications-count", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });


// export const userOwnBlogs = (data, token) => 
//     api.post("api/blog/user-written-blogs", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });

// export const userOwnBlogsCount = (data, token) => 
//     api.post("api/blog/user-written-blogs-count", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });

// // delete blog
// export const deleteOwnBlog = (data, token) => 
//     api.post("api/blog/delete-blog", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });