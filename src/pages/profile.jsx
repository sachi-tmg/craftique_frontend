import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Edit, Heart, Share2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { checkFollowStatus, getProfileInfo, getUserCreations } from "../api/api";
import { useAuth } from "../contexts/auth-context";

export default function ProfilePage() {
  const { username } = useParams();
  const { userAuth } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [creations, setCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("creations");

  const isCurrentUser = userAuth.isAuthenticated && profileUser && 
                      (userAuth.username === profileUser.username);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        
        // 1. Fetch profile info
        const profileResponse = await getProfileInfo({ username });
        
        if (!profileResponse.data) {
          throw new Error('Failed to fetch profile');
        }
        
        const userData = profileResponse.data.user;
        setProfileUser(userData);
        
        // 2. Check follow status if authenticated and viewing another user's profile
        if (userAuth.isAuthenticated && userAuth.username !== username) {
          try {
            const followResponse = await checkFollowStatus(
              { targetUserId: userData._id },
              userAuth.token
            );
            
            if (followResponse.data) {
              setIsFollowing(followResponse.data.isFollowing);
            }
          } catch (error) {
            console.error('Error checking follow status:', error);
          }
        }
        
        // 3. Fetch user creations using the dedicated endpoint
        try {
          const creationsResponse = await getUserCreations(userData._id);
          if (creationsResponse.data) {
            setCreations(creationsResponse.data);
          }
        } catch (error) {
          console.error('Error fetching creations:', error);
          setCreations([]);
        }
        
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [username, userAuth]);

  const handleFollowToggle = async () => {
    // if (!userAuth.isAuthenticated) {
    //   toast.info('Please login to follow users');
    //   return;
    // }
    
    // try {
    //   const response = await toggleFollow(
    //     { targetUserId: profileUser._id },
    //     userAuth.token
    //   );
      
    //   if (response.data) {
    //     setIsFollowing(response.data.isNowFollowing);
    //     // Update follower count in local state
    //     setProfileUser(prev => ({
    //       ...prev,
    //       followers: response.data.isNowFollowing 
    //         ? [...(prev.followers || []), userAuth.userId]
    //         : (prev.followers || []).filter(id => id !== userAuth.userId)
    //     }));
        
    //     toast.success(response.data.message);
    //   }
    // } catch (error) {
    //   console.error('Error toggling follow:', error);
    //   toast.error('Failed to update follow status');
    // }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!profileUser) {
    return <div className="flex justify-center items-center h-screen">Profile not found</div>;
  }

  return (
    <div className="max-w-full mx-auto p-4 space-y-6">
      {/* Cover Image and Profile Info */}
      <div className="relative">
        <div className="h-48 overflow-hidden rounded-lg bg-gray-200">
          <img
            src={profileUser.coverPicture || "/Covers/cover.png"}
            alt="Cover"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.src = "/Covers/cover.png";
            }}
          />
        </div>
        <div className="absolute -bottom-8 left-6 flex items-end gap-4">
          <Avatar className="h-24 w-24 border-4 border-background">
            <img
              src={profileUser.profilePicture}
              alt={profileUser.fullName}
              className="h-full w-full object-cover"
            />
            <User className="h-12 w-12" />
          </Avatar>
        </div>
      </div>

      {/* Profile Actions */}
      <div className="mt-14 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{profileUser.fullName}</h1>
          <p className="text-muted-foreground">@{profileUser.username}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>

          {isCurrentUser && (
            <Button variant="ghost" size="icon" asChild>
              <a href="/settings">
                <Edit className="h-5 w-5" />
              </a>
            </Button>
          )}

          
          {/* {isCurrentUser ? (
            <>
              <Button variant="ghost" size="icon" asChild>
                <a href="/settings">
                  <Edit className="h-5 w-5" />
                </a>
              </Button>
            </>
          ) : (
            <Button 
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollowToggle}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )} */}
        </div>
      </div>

      {/* Profile Bio */}
      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <p>{profileUser.bio || "No bio yet"}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {profileUser.location && (
              <span className="text-muted-foreground">📍 {profileUser.location}</span>
            )}
            {profileUser.link && (
              <a
                href={profileUser.link.startsWith('http') ? profileUser.link : `https://${profileUser.link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                🔗 {profileUser.link.replace(/(^\w+:|^)\/\//, '')}
              </a>
            )}
            <span className="text-muted-foreground">
              🗓️ Joined {new Date(profileUser.dateCreated).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
          </div>
          <div className="h-4"></div>
        </div>
        <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
          <div className="text-center">
            <p className="text-2xl font-bold">{profileUser.account_info?.total_posts || 0}</p>
            <p className="text-xs text-muted-foreground">Creations</p>
          </div>
          {/* <div className="text-center">
            <p className="text-2xl font-bold">{profileUser.followers?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div> */}
          <div className="text-center">
            <p className="text-2xl font-bold">{profileUser.account_info?.total_likes || 0}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
        </div>
      </div>

      {/* Tabs for Creations */}
      {/* <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="creations">Creations</TabsTrigger>
          {/* <TabsTrigger value="likes">Likes</TabsTrigger> */}
        {/* </TabsList> */}
        {/* <TabsContent value="creations" className="mt-6"> */} 
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {creations.map((creation) => (
              <Card key={creation.creation_id} className="overflow-hidden">
                <a href={`/craft/${creation.creation_id}`} className="block">
                  <div className="aspect-square relative">
                    <img
                      src={creation.creationPicture || "/placeholder.svg"}
                      alt={creation.title}
                      className="w-full h-full object-cover"
                    />
                    {creation.forSale && (
                      <Badge className="absolute right-2 top-2 bg-primary">
                        ${creation.price}
                      </Badge>
                    )}
                  </div>
                </a>
                <div className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">{creation.title}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      <span className="text-xs">{creation.activity.likeCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        {/* </TabsContent> */}
        {/* <TabsContent value="likes" className="mt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Liked creations will appear here</p>
          </div>
        </TabsContent> */}
      {/* </Tabs> */}
    </div>
  );
}