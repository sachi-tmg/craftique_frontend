import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getCreationById } from "../api/api";
import { getDay } from "../common/date";

// Import Lucide React icons for Shadcn UI
import { Heart, ShoppingCart, ThumbsUp } from 'lucide-react';

// Assuming ThemeContext for theme toggling is available

// You would likely have a FavoritesContext if you implement favoriting
// import { useFavorites } from "../contexts/favorites-context";

// This component will display the details of a single craft.
export default function CraftDetailPage() {
  const { craftId } = useParams(); // Get the craft ID from the URL parameter (e.g., /craft/123)

  // State to hold the fetched craft data
  const [craft, setCraft] = useState(null);
  // State for loading status
  const [loading, setLoading] = useState(true);
  // State for error messages
  const [error, setError] = useState(null);

  // State for managing comments (these would ideally be fetched from a separate API or included in the craft detail)
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState("");

  // Get current theme from context for conditional styling (e.g., icon colors)
  // const { theme } = useContext(ThemeContext); // Uncomment if ThemeContext is available

  // You would use your FavoritesContext here if available
  // const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fetchCraft = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Frontend (CraftDetailPage): Attempting to fetch with craftId:", craftId);
        const response = await getCreationById(craftId);
        console.log("Frontend (CraftDetailPage): Full response from API:", response);

        if (response && response.data) {
          console.log("Frontend (CraftDetailPage): Received valid response data:", response.data);
          const fetchedData = response.data;

          // Mapping fetchedData to a consistent 'craft' state structure
          const mappedCraft = {
            creation_id: fetchedData.creation_id,
            title: fetchedData.title,
            des: fetchedData.des, // Model uses 'des' for description
            category: fetchedData.category,
            price: fetchedData.price,
            forSale: fetchedData.forSale,
            materials: fetchedData.materials, // Model specifies 'materials' as String
            dimension: fetchedData.dimension || null, // Model specifies 'dimension' as String, can be null
            // Directly use 'creationPicture' from fetchedData
            creationPicture: fetchedData.creationPicture || "/placeholder.svg", // Use singular 'creationPicture'
            activity: fetchedData.activity, // Keep activity object as is
            dateCreated: getDay(fetchedData.dateCreated), // Assuming getDay formats date
            tags: fetchedData.tags || [], // If 'tags' field might be missing or null, default to an empty array
            fullName: fetchedData.fullName, // From populated user
            username: fetchedData.username, // From populated user
            profilePicture: fetchedData.profilePicture, // From populated user
            artistBio: fetchedData.artistBio || null, // Assuming 'artistBio' is populated from user model, default to null if not present
            email: fetchedData.email, // From populated user
          };
          setCraft(mappedCraft);
        } else {
          console.warn("Frontend (CraftDetailPage): Response or response.data is invalid.", { response });
          throw new Error("Craft data not found or invalid response structure.");
        }
      } catch (err) {
        console.error("Frontend (CraftDetailPage): Failed to fetch craft details:", err);
        setError(err.message || "Failed to load craft details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (craftId) { // Ensure craftId is available before fetching
      fetchCraft();
    }
  }, [craftId]); // Dependency array to re-run effect when craftId changes

  // --- UI Interaction Handlers (Placeholders for Backend Calls) ---

  const handleLike = () => {
    if (!craft) return;
    console.log("Like button clicked for craft:", craft.creation_id); // Use creation_id from mappedCraft
    // TODO: Implement actual API call to like the craft
    // On successful API response:
    // setCraft(prev => ({ ...prev, activity: { ...prev.activity, likeCount: prev.activity.likeCount + 1 } }));
  };

  const handleSave = () => {
    if (!craft) return;
    console.log("Save (favorite) button clicked for craft:", craft.creation_id); // Use creation_id from mappedCraft
    // TODO: Implement actual API call to save/unsave the craft
    // You would use useFavorites() context here for frontend state update
    // toggleFavorite(craft);
  };

  const handleAddToCart = () => {
    if (!craft) return;
    console.log("Add to Cart button clicked for craft:", craft.creation_id); // Use creation_id from mappedCraft
    // TODO: Implement actual API call to add craft to cart
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return; // Prevent empty comments

    console.log("Submitting new comment:", newCommentText);
    // TODO: Implement API call to post comment
    // On successful API response:
    // setComments(prevComments => [...prevComments, { id: Date.now(), user: { name: "You", username: "currentuser", avatar: "/path/to/my/avatar.jpg" }, content: newCommentText, timestamp: "Just now", likes: 0, isLiked: false }]);
    setNewCommentText(""); // Clear input after submission
  };

  const handleCommentLike = (commentId) => {
    console.log(`Liking comment: ${commentId}`);
    // TODO: Implement API call to like a specific comment
    // On successful API response:
    // setComments(prevComments => prevComments.map(comment =>
    //   comment.id === commentId ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 } : comment
    // ));
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
            {/* Display the main image. Use singular `creationPicture`. */}
            <img
              src={creationPicture} // Directly use creationPicture
              alt={title}
              className="w-full h-auto object-cover max-h-[600px] rounded-lg"
            />
          </div>
          {/* Removed the thumbnail gallery as we are only expecting one picture */}
          {/* If you add support for multiple pictures in the future, you'd reintroduce this. */}
        </div>

        {/* Right Section: Details */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                aria-label="Save to favorites"
              >
                {/* Shadcn/Lucide Heart icon */}
                <Heart
                  className={`w-6 h-6 ${isCurrentlyFavorited ? 'fill-primary text-primary' : (theme === 'light' ? 'text-gray-600' : 'text-gray-400')}`}
                />
              </button>
              {/* Add a share button here if desired */}
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
              {/* Shadcn/Lucide Heart icon for likes display */}
              <Heart className="w-5 h-5 text-primary" strokeWidth={1.5} />
              {likeCount} likes
            </span>
            <span className="min-w-fit">Published on {dateCreated}</span>
          </div>

          {forSale && (
            <button
              onClick={handleAddToCart}
              className="w-full bg-primary text-white py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors duration-200 flex items-center justify-center gap-2"
              aria-label="Add to cart"
            >
              {/* Shadcn/Lucide ShoppingCart icon */}
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12 space-y-6">
        <hr className="border-gray-200" />
        <h2 className="text-2xl font-bold text-gray-900">Comments ({comments.length})</h2>

        {/* New Comment Input */}
        <div className="flex gap-4 items-start">
          {/* Ensure profilePicture is used from craft or default if it's the current user's profile picture */}
          <img src={profilePicture || "/placeholder.svg"} alt="User Avatar" className="w-10 h-10 rounded-full object-cover" />
          <form onSubmit={handleCommentSubmit} className="flex-1 flex flex-col gap-2">
            <textarea
              name="commentInput"
              placeholder="Add a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="3"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
            ></textarea>
            <button
              type="submit"
              className="self-end bg-primary text-white px-5 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Post Comment
            </button>
          </form>
        </div>

        {/* Existing Comments List - Currently not fetched, but ready for dynamic data */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 items-start border-b border-gray-100 pb-4 last:border-b-0">
                <img src={comment.user.avatar || "/placeholder.svg"} alt={comment.user.name} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{comment.user.name}</span>
                    <span className="text-sm text-gray-600">@{comment.user.username}</span>
                    <span className="text-sm text-gray-500 ml-auto">{comment.timestamp}</span>
                  </div>
                  <p className="mt-1 text-gray-700">{comment.content}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={() => handleCommentLike(comment.id)}
                      className={`flex items-center gap-1 text-sm ${comment.isLiked ? 'text-primary' : 'text-gray-600'} hover:text-primary`}
                    >
                      {/* Shadcn/Lucide ThumbsUp icon */}
                      <ThumbsUp className="w-4 h-4" fill={comment.isLiked ? "currentColor" : "none"} />
                      {comment.likes > 0 && comment.likes}
                    </button>
                    <button className="text-sm text-gray-600 hover:text-gray-800">Reply</button>
                  </div>
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