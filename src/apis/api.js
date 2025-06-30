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


// //blog
// export const uploadBanner = (formData) =>
//     api.post("api/blog/uploadBanner", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//     });
// export const createBlog = (data, token) => 
//     api.post("api/blog/create-blog", data, {
//         headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json",
//         },
//     });
// export const latestBlogs = (data) => api.post("api/blog/latest-blogs", data);
// export const countRouteBlogs = (data) => api.post("api/blog/all-latest-blogs-count", data);
// export const getTrendingBlogs = (params) => api.get("api/blog/trending-blogs", { params });
// export const viewFullBlog = (data) => api.post("api/blog/blog-view", data);

// //search
// export const searchBlogs = (data) => api.post("api/blog/search-blogs", data);
// export const countSearchRouteBlogs = (data) => api.post("api/blog/search-blogs-count", data);
// export const searchRegularUsers = (data) => api.post("api/regular-users/search-users", data); 

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