import { Bookmark, ChevronDown, ChevronRight, Heart, MoreVertical, Zap } from 'lucide-react';
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import { checkLikeStatus, deleteCreation, getComments, getCreationById, postComment, toggleCommentLike, toggleLike } from "../api/api";
import { getDay } from "../common/date";
import { useAuth } from "../contexts/auth-context";
import { useFavorites } from "../contexts/favorites-context";

export default function CraftDetailPage() {
  const { craftId } = useParams();
  const navigate = useNavigate();
  const { userAuth } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [craft, setCraft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});

  // Check if current user is the creator of this craft
  const isCreator = userAuth.isAuthenticated && craft?.username === userAuth.username;

  useEffect(() => {
    const fetchCraft = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await getCreationById(craftId);
        
        if (response && response.data) {
          const fetchedData = response.data;
          const mappedCraft = {
            _id: fetchedData._id,
            creation_id: fetchedData.creation_id,
            title: fetchedData.title,
            des: fetchedData.des,
            category: fetchedData.category,
            price: fetchedData.price,
            forSale: fetchedData.forSale,
            materials: fetchedData.materials,
            dimension: fetchedData.dimension || null,
            creationPicture: fetchedData.creationPicture || "/placeholder.svg",
            activity: fetchedData.activity,
            dateCreated: getDay(fetchedData.dateCreated),
            tags: fetchedData.tags || [],
            fullName: fetchedData.fullName,
            username: fetchedData.username,
            profilePicture: fetchedData.profilePicture,
            artistBio: fetchedData.artistBio || null,
            email: fetchedData.email,
          };
          setCraft(mappedCraft);
      
          // Add this check if user is authenticated
          if (userAuth.isAuthenticated) {
            const likeStatus = await checkLikeStatus(fetchedData.creation_id, userAuth.token);
            setIsLiked(likeStatus.isLiked);
          }
        } else {
          throw new Error("Craft data not found or invalid response structure.");
        }
      } catch (err) {
        console.error("Failed to fetch craft details:", err);
        setError(err.message || "Failed to load craft details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (craftId) {
      fetchCraft();
    }
  }, [craftId]);

  useEffect(() => {
  const handleClickOutside = (e) => {
    if (isMenuOpen && !e.target.closest('.relative')) {
      setIsMenuOpen(false);
    }
  };

  document.addEventListener('click', handleClickOutside);
  return () => document.removeEventListener('click', handleClickOutside);
}, [isMenuOpen]);

  useEffect(() => {
    const checkInitialLikeStatus = async () => {
      if (userAuth.isAuthenticated && craft?._id) {
        try {
          setLikeLoading(true);
          const { isLiked } = await checkLikeStatus(craft.creation_id, userAuth.token);
          setIsLiked(isLiked);
        } catch (error) {
          console.error("Failed to check like status:", error);
        } finally {
          setLikeLoading(false);
        }
      }
    };

    checkInitialLikeStatus();
  }, [craft?._id, userAuth]);

useEffect(() => {
    const fetchComments = async () => {
        if (craft && userAuth.isAuthenticated) {
            try {
                const commentsData = await getComments(craft.creation_id);

                // Normalize liked_by IDs to strings and inject
                const normalized = commentsData.map(comment => ({
                    ...comment,
                    liked_by: (comment.liked_by || []).map(id => id.toString()),
                    children: (comment.children || []).map(child => ({
                        ...child,
                        liked_by: (child.liked_by || []).map(id => id.toString())
                    }))
                }));

                setComments(normalized);
            } catch (error) {
                console.error("Failed to fetch comments:", error);
                toast.error("Failed to load comments");
            }
        }
    };

    fetchComments();
}, [craft, userAuth]);

  // Add delete handler
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this craft? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteCreation(craftId, userAuth.token);
      navigate(`/profile/${userAuth.username}`);
    } catch (error) {
      console.error("Error deleting craft:", error);
      setError("Failed to delete craft. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Add edit handler - redirect to edit page
  const handleEdit = () => {
    navigate(`/edit-creation/${craftId}`);
  };

  
const handleLike = async () => {
  console.log('[DEBUG] handleLike triggered'); // 1. Start of function
  if (!userAuth.isAuthenticated) {
    console.log('[DEBUG] User not authenticated, showing toast');
    toast.error("Please sign in to like creations");
    return;
  }

  try {
    setLikeLoading(true);
    console.log('[DEBUG] Calling toggleLike with:', {
      creationId: craft._id || craft.creation_id,
      token: userAuth.token ? 'exists' : 'missing' // Don't log actual token
    });
    
    const response = await toggleLike(craft.creation_id, userAuth.token);
    
    console.log('[DEBUG] toggleLike response:', response);
    setIsLiked(response.likedByUser);
    setCraft(prev => ({
      ...prev,
      activity: {
        ...prev.activity,
        likeCount: response.likeCount
      }
    }));
  } catch (error) {
    console.error('[DEBUG] Error in handleLike:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    toast.error("Failed to toggle like");
  } finally {
    console.log('[DEBUG] Like operation completed');
    setLikeLoading(false);
  }
};

const handleSave = (craft) => {
  if (!userAuth.isAuthenticated) {
    toast.warn("Sign in required: Please sign in to save crafts to your favorites.");
    return;
  }
  // Pass the WHOLE craft object, just like HomePage does!
  toggleFavorite({
    ...craft,
    id: craft.creation_id, // Ensure both `id` (creation_id) and `_id` (ObjectId) are present
    _id: craft._id,
  });
};



  const handleBuyNow = () => {
    if (!craft) return;
    // Optionally, check authentication before proceeding
    if (!userAuth.isAuthenticated) {
      toast.error("You need to be logged in to buy");
      navigate('/login');
      return;
    }
    // Go to checkout with just this item
    navigate('/checkout', { state: { buyNowItem: { 
      _id: craft._id,
      title: craft.title,
      artist: craft.fullName,
      image: craft.creationPicture,
      price: parseFloat(craft.price),
      quantity: 1, // optional
    }}});

  };

// Handle comment submission
const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !userAuth.isAuthenticated) {
        toast.error("Please sign in to comment");
        return;
    }

    try {
        setCommentLoading(true);
        const newComment = await postComment(
            craft.creation_id,
            newCommentText,
            userAuth.token
        );
        
        setComments(prev => [{
            ...newComment,
            commented_by: {
                _id: userAuth.userId,
                username: userAuth.username,
                profilePicture: userAuth.profilePicture,
                fullName: userAuth.fullName
            },
            children: [],
            likes: 0,
            liked_by: [],
            dateCommented: new Date().toISOString()
        }, ...prev]);
        
        setNewCommentText("");
        toast.success("Comment posted!");
    } catch (error) {
        console.error("Error posting comment:", error);
        toast.error("Failed to post comment");
    } finally {
        setCommentLoading(false);
    }
};

// Handle reply submission
const handleReplySubmit = async (parentCommentId) => {
    if (!replyText.trim() || !userAuth.isAuthenticated) {
        toast.error("Please sign in to reply");
        return;
    }

    try {
        setCommentLoading(true);
        const newReply = await postComment(
            craft.creation_id,
            replyText,
            userAuth.token,
            parentCommentId
        );
        
        setComments(prev => prev.map(comment => {
            if (comment._id === parentCommentId) {
                return {
                    ...comment,
                    children: [
                        ...(comment.children || []),
                        {
                            ...newReply,
                            commented_by: {
                                _id: userAuth.userId,
                                username: userAuth.username,
                                profilePicture: userAuth.profilePicture,
                                fullName: userAuth.fullName
                            },
                            likes: 0,
                            liked_by: [],
                            dateCommented: new Date().toISOString()
                        }
                    ]
                };
            }
            return comment;
        }));
        
        setReplyingTo(null);
        setReplyText("");
        toast.success("Reply posted!");
    } catch (error) {
        console.error("Error posting reply:", error);
        toast.error("Failed to post reply");
    } finally {
        setCommentLoading(false);
    }
};

const handleCommentLike = async (commentId) => {
    if (!userAuth.isAuthenticated) {
        toast.error("Please sign in to like comments");
        return;
    }

    try {
        const response = await toggleCommentLike(commentId, userAuth.token);
        
        setComments(prev => prev.map(comment => {
            // Update top-level comment
            if (comment._id === commentId) {
                return {
                    ...comment,
                    likes: response.likeCount,
                    liked_by: response.likedByUser 
                      ? Array.from(new Set([...comment.liked_by.map(String), String(userAuth.userId)]))
                      : comment.liked_by.map(String).filter(id => id !== String(userAuth.userId))

                };
            }

            // Update reply inside children
            if (comment.children && comment.children.some(child => child._id === commentId)) {
                return {
                    ...comment,
                    children: comment.children.map(child => 
                        child._id === commentId
                            ? {
                                ...child,
                                likes: response.likeCount,
                                liked_by: response.likedByUser 
                                    ? [...child.liked_by, userAuth.userId]
                                    : child.liked_by.filter(id => id !== userAuth.userId)
                            }
                            : child
                    )
                };
            }

            return comment;
        }));
    } catch (error) {
        console.error("Error liking comment:", error);
        toast.error("Failed to like comment");
    }
};


const toggleReplies = (commentId) => {
  setExpandedReplies(prev => ({
    ...prev,
    [commentId]: !prev[commentId]
  }));
};

  // --- Loading, Error, and Not Found UI ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Loading craft details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!craft) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">Craft not found.</p>
      </div>
    );
  }

  // --- Destructure properties from the fetched craft object for cleaner JSX ---
  // Ensure names match the 'mappedCraft' object exactly.
  const {
    creation_id,
    title,
    des,
    category,
    price,
    forSale,
    materials,
    dimension,
    creationPicture,
    activity,
    dateCreated,
    tags,
    fullName,
    username,
    profilePicture,
    email,
    artistBio,
  } = craft;

  // Extract likeCount from the activity object
  const likeCount = activity?.likeCount || 0; // Use optional chaining and default to 0

  // Determine heart icon fill based on whether it's favorited (requires FavoritesContext logic)
  const isCurrentlyFavorited = false; // Replace with actual logic from useFavorites hook (e.g., isFavorite(craft.creation_id))

  // Uncomment if you have a theme context
  const theme = 'light'; // Placeholder: Replace with actual theme from context

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Section: Image Gallery */}
        <div className="flex-1">
          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <img
              src={creationPicture}
              alt={title}
              className="w-full h-auto object-cover max-h-[600px] rounded-lg"
            />
          </div>
        </div>

        {/* Right Section: Details */}
        <div className="flex-1 space-y-6">
          {/* Title and Action Buttons Row */}
          <div className="flex justify-between items-start gap-4">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {/* Action Buttons Row */}
            <div className="flex items-center gap-4 mt-4">
              {/* Like Button */}
              <button 
                onClick={handleLike}
                disabled={likeLoading || !userAuth.isAuthenticated}
                className="flex items-center gap-1 group"
                aria-label={isLiked ? "Unlike" : "Like"}
              >
                <Heart className={`w-6 h-6 ${
                  isLiked 
                    ? 'fill-red-500 text-red-500' 
                    : 'text-gray-400 group-hover:text-red-500'
                }`}/>
                <span className="text-sm">{craft?.activity?.likeCount || 0}</span>
              </button>

              {/* Save Button */}
              <button
                onClick={() => handleSave(craft)}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label={isFavorite(craft.creation_id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Bookmark className={`w-5 h-5 ${isFavorite(craft.creation_id) ? "fill-primary text-primary" : "text-gray-400 hover:text-primary"}`} />
              </button>

              {/* Dropdown Menu for Edit/Delete (only shown to creator) */}
              {isCreator && (
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleEdit();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleDelete();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Price & Category */}
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-medium">
              {category}
            </span>
            {forSale && (
              <span className="bg-primary text-white px-3 py-1 rounded-full font-semibold">
                Rs {price ? parseFloat(price).toLocaleString() : 'N/A'}
              </span>
            )}
          </div>

          {/* Artist Info */}
          {username && (
            <div className="mt-8 border-t pt-4">
              <h2 className="text-2xl font-semibold mb-4">About the Artist</h2>

              <div className="flex items-center space-x-4">
                {profilePicture && (
                  <Link to={`/profile/${username}`}>
                    <img
                      src={profilePicture}
                      alt={`${fullName || username}'s profile`}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                    />
                  </Link>
                )}
                <div>
                  <Link to={`/profile/${username}`} className="text-black/85 hover:underline">
                    <h3 className="text-xl font-bold">{fullName || username}</h3>
                  </Link>
                  {fullName && <p className="text-gray-600">@{username}</p>}
                </div>
              </div>

              {artistBio && (
                <p className="mt-4 text-gray-700">{artistBio}</p>
              )}

              {email && (
                <p className="mt-2 text-gray-500">Contact: <a href={`mailto:${email}`} className="text-primary/80 hover:underline">{email}</a></p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{des}</p>
          </div>

          {/* Materials and Dimensions */}
          {(materials && materials.length > 0) || dimension ? (
            <div className="grid grid-cols-2 gap-4 text-gray-700">
              {materials && materials.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-800">Materials</h3>
                  <p className="text-sm">{materials}</p>
                </div>
              )}
              {dimension && (
                <div>
                  <h3 className="font-medium text-gray-800">Dimensions</h3>
                  <p className="text-sm">{dimension}</p>
                </div>
              )}
            </div>
          ) : null}

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-primary/10 text-primary-foreground text-xs px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Likes and Date Created */}
          <div className="flex items-center gap-4 text-gray-600 text-sm">
            <span className="flex items-center gap-1">
              <Heart className="w-5 h-5 text-primary" strokeWidth={1.5} />
              {likeCount} likes
            </span>
            <span className="min-w-fit">Published on {dateCreated}</span>
          </div>

          {forSale && (
            <button
              onClick={handleBuyNow}
              className="w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
              aria-label="Buy now"
            >
              <Zap className="w-5 h-5" />
              Buy Now
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12 space-y-6">
        <hr className="border-gray-200" />
        <h2 className="text-2xl font-bold text-gray-900">
            Comments ({comments.reduce((acc, comment) => acc + 1 + (comment.children?.length || 0), 0)})
        </h2>

        {/* New Comment Input */}
        <div className="flex gap-4 items-start">
            <img 
                src={userAuth.profilePicture || "/placeholder.svg"} 
                alt="Your profile" 
                className="w-10 h-10 rounded-full object-cover" 
            />
            <form onSubmit={handleCommentSubmit} className="flex-1 flex flex-col gap-2">
                <textarea
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="3"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    disabled={commentLoading}
                    onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (newCommentText.trim()) handleCommentSubmit(e);
                    }
                  }}
                />
                <button
                    type="submit"
                    className="self-end bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                    disabled={!newCommentText.trim() || commentLoading}
                >
                    {commentLoading ? "Posting..." : "Post Comment"}
                </button>
            </form>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
            {comments.length > 0 ? (
                comments.map((comment) => (
                    <div key={comment._id} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-b-0">
                        <img 
                            src={comment.commented_by?.profilePicture || "/placeholder.svg"} 
                            alt={comment.commented_by?.fullName || comment.commented_by?.username} 
                            className="w-10 h-10 rounded-full object-cover" 
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900">
                                    {comment.commented_by?.fullName || comment.commented_by?.username}
                                </span>
                                <span className="text-sm text-gray-600">
                                    @{comment.commented_by?.username}
                                </span>
                                <span className="text-sm text-gray-500 ml-auto">
                                    {new Date(comment.dateCommented).toLocaleString()}
                                </span>
                            </div>
                            <p className="mt-1 text-gray-700">{comment.comment}</p>
                            <div className="flex items-center gap-4 mt-2">
                                {/* Inside your comment rendering */}
                                <button
                                    onClick={() => handleCommentLike(comment._id)}
                                    disabled={commentLoading}
                                    className="flex items-center gap-1 group"
                                    aria-label={comment.liked_by?.includes(userAuth.userId) ? "Unlike" : "Like"}
                                >
                                    <Heart className={`w-5 h-5 ${
                                        comment.liked_by?.includes(userAuth.userId)
                                            ? 'fill-red-500 text-red-500' 
                                            : 'text-gray-400 group-hover:text-red-500'
                                    }`}/>
                                    {comment.likes > 0 && (
                                        <span className="text-sm">{comment.likes}</span>
                                    )}
                                </button>

                                <button 
                                    onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                                    className="text-sm text-gray-600 hover:text-gray-800"
                                    disabled={commentLoading}
                                >
                                    Reply
                                </button>
                            </div>
                            
                            {/* Reply form */}
                            {replyingTo === comment._id && (
                                <div className="mt-4 flex gap-4 items-start">
                                    <img 
                                        src={userAuth.profilePicture || "/placeholder.svg"} 
                                        alt="Your profile" 
                                        className="w-8 h-8 rounded-full object-cover" 
                                    />
                                    <div className="flex-1 flex flex-col gap-2">
                                        <textarea
                                            placeholder="Write a reply..."
                                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                            rows="2"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            disabled={commentLoading}
                                            onKeyDown={e => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                              e.preventDefault();
                                              if (replyText.trim()) handleReplySubmit(comment._id);
                                            }
                                          }}
                                        />
                                        <div className="flex gap-2 self-end">
                                            <button
                                                onClick={() => setReplyingTo(null)}
                                                className="px-3 py-1 text-gray-600 hover:text-gray-800"
                                                disabled={commentLoading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleReplySubmit(comment._id)}
                                                className="px-3 py-1 bg-primary text-white rounded disabled:opacity-50"
                                                disabled={!replyText.trim() || commentLoading}
                                            >
                                                {commentLoading ? "Posting..." : "Post Reply"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Replies section with collapsible functionality */}
                            {comment.children && comment.children.length > 0 && (
                                <div className="mt-2">
                                    <button 
                                        onClick={() => toggleReplies(comment._id)}
                                        className="text-sm text-gray hover:underline flex items-center gap-1"
                                    >
                                        {expandedReplies[comment._id] ? (
                                            <>
                                                <ChevronDown className="w-4 h-4" /> Hide replies
                                            </>
                                        ) : (
                                            <>
                                                <ChevronRight className="w-4 h-4" /> 
                                                Show {comment.children.length} {comment.children.length === 1 ? 'reply' : 'replies'}
                                            </>
                                        )}
                                    </button>
                                    
                                    {expandedReplies[comment._id] && (
                                        <div className="mt-2 pl-6 border-l-2 border-gray-200 space-y-4">
                                            {comment.children.map(reply => (
                                                <div key={reply._id} className="flex gap-3 items-start pt-4">
                                                    <img 
                                                        src={reply.commented_by?.profilePicture || "/placeholder.svg"} 
                                                        alt={reply.commented_by?.fullName || reply.commented_by?.username} 
                                                        className="w-8 h-8 rounded-full object-cover" 
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-gray-900 text-sm">
                                                                {reply.commented_by?.fullName || reply.commented_by?.username}
                                                            </span>
                                                            <span className="text-xs text-gray-600">
                                                                @{reply.commented_by?.username}
                                                            </span>
                                                            <span className="text-xs text-gray-500 ml-auto">
                                                                {new Date(reply.dateCommented).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-gray-700 text-sm">{reply.comment}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <button
                                                                onClick={() => handleCommentLike(reply._id)}
                                                                disabled={commentLoading}
                                                                className="flex items-center gap-1 group"
                                                                aria-label={reply.liked_by?.includes(userAuth.userId) ? "Unlike" : "Like"}
                                                            >
                                                              {console.log(`[UI] Checking like status for reply ${reply._id}:`, reply.liked_by?.includes(userAuth.userId))}

                                                                <Heart className={`w-4 h-4 ${
                                                                    reply.liked_by?.includes(userAuth.userId)
                                                                        ? 'fill-red-500 text-red-500' 
                                                                        : 'text-gray-400 group-hover:text-red-500'
                                                                }`}/>
                                                                {reply.likes > 0 && (
                                                                    <span className="text-xs">{reply.likes}</span>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-8 text-gray-500">
                    <p>No comments yet. Be the first to comment!</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}