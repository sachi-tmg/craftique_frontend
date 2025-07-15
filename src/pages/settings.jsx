import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  deleteUserAccount,
  getProfileInfo, // Used to fetch initial profile data
  updateUserNotifications,
  updateUserPassword,
  updateUserProfile, uploadCoverPicture, // Used for updating general profile info (bio, location, website, fullName)
  uploadProfilePicture, // Used for uploading profile picture
} from "../api/api";
import { useAuth } from "../contexts/auth-context";

import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { userAuth, updateUser, logout } = useAuth();
  // isLoading state to manage loading indicators for different sections
  const [isLoading, setIsLoading] = useState({
    initialLoad: false,
    account: false,
    password: false,
    profile: false,
    notifications: false,
    profilePicture: false,
    deleteAccount: false,
  });
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    currentPassword: "", // Will NEVER be pre-filled for security
    newPassword: "",
    confirmPassword: "",
    displayName: "", // Maps to fullName on the backend
    bio: "",
    location: "",
    website: "",
    comments: true,
    likes: false,
    messages: true,
    newsletter: false,
    publicProfile: true, // New field for privacy settings
    showEmail: false, // New field for privacy settings
    activityStatus: true, // New field for activity status
  });
  const [errors, setErrors] = useState({}); // Field-level validation errors
  const [submitErrors, setSubmitErrors] = useState({}); // General submission errors for each form type
  const [successMessages, setSuccessMessages] = useState({}); // Success messages for each form type
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete account confirmation

  // Effect to fetch current user profile data on component mount or userAuth change
  useEffect(() => {
    const fetchCurrentProfileData = async () => {
      // Only fetch if user is authenticated and username is available
      if (userAuth.isAuthenticated && userAuth.username) {
        setIsLoading((prev) => ({ ...prev, initialLoad: true }));
        try {
          // Fetch profile info using the username from auth context
          const profileResponse = await getProfileInfo({ username: userAuth.username });

          // Basic check for response data
          if (!profileResponse.data || !profileResponse.data.user) {
            throw new Error('Failed to fetch user profile data.');
          }

          const userData = profileResponse.data.user;

          // Update formData with fetched user data
          setFormData(prev => ({
            ...prev, // Preserve currentPassword, newPassword, confirmPassword as they are not fetched
            email: userData.email || "",
            username: userData.username || "",
            displayName: userData.fullName || userData.username || "", // Map fullName to displayName
            bio: userData.bio || "",
            location: userData.location || "",
            website: userData.website || "",
            // Populate notification settings, defaulting to true/false if not present
            comments: userData.notifications?.comments ?? true,
            likes: userData.notifications?.likes ?? false,
            messages: userData.notifications?.messages ?? true,
            newsletter: userData.notifications?.newsletter ?? false,
            // Populate new privacy and activity status fields
            publicProfile: userData.publicProfile ?? true,
            showEmail: userData.showEmail ?? false,
            activityStatus: userData.activityStatus ?? true,
          }));
          setSuccessMessages((prev) => ({
            ...prev,
            initialLoad: "User profile loaded successfully.",
          }));
        } catch (error) {
          console.error("Error fetching user profile for settings:", error);
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Failed to load your profile data.";
          setSubmitErrors((prev) => ({
            ...prev,
            initialLoad: errorMessage,
          }));
          toast.error(errorMessage); // Display error toast
        } finally {
          setIsLoading((prev) => ({ ...prev, initialLoad: false }));
        }
      } else {
        // Reset form data if user is not authenticated
        setFormData({
          email: "", username: "", currentPassword: "", newPassword: "", confirmPassword: "",
          displayName: "", bio: "", location: "", website: "",
          comments: true, likes: false, messages: true, newsletter: false,
          publicProfile: true, showEmail: false, activityStatus: true,
        });
      }
    };

    fetchCurrentProfileData();
  }, [userAuth.isAuthenticated, userAuth.username]); // Re-run effect if auth status or username changes

  // Validation functions for different form sections
  const validateAccountForm = () => {
    const newErrors = {};
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }
    return newErrors;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    // Current password validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    // New password validation
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        "New password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const validateProfileForm = () => {
    const newErrors = {};
    // Website URL validation (optional field)
    if (
      formData.website &&
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(
        formData.website
      )
    ) {
      newErrors.website = "Please enter a valid website URL";
    }
    return newErrors;
  };

  // Generic input change handler
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field-specific error when input changes
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear general submission errors and success messages on any input change
    setSubmitErrors({});
    setSuccessMessages({});
  };

  // Main form submission handler
  const handleSubmit = async (formType) => {
    let validationErrors = {};

    // Run specific validation based on form type
    switch (formType) {
      case "account":
        validationErrors = validateAccountForm();
        break;
      case "password":
        validationErrors = validatePasswordForm();
        break;
      case "profile":
        validationErrors = validateProfileForm();
        break;
      case "notifications":
        // No specific client-side validation needed for notification switches
        break;
      default:
        break;
    }

    setErrors(validationErrors); // Set field-level errors

    // If there are validation errors, display a toast and stop submission
    if (Object.keys(validationErrors).length > 0) {
      setSubmitErrors((prev) => ({
        ...prev,
        [formType]: "Please fix the errors above",
      }));
      toast.error("Please fix the errors above.");
      return;
    }

    // Set loading state for the specific form type
    setIsLoading((prev) => ({ ...prev, [formType]: true }));
    // Clear previous submission errors and success messages
    setSubmitErrors((prev) => ({ ...prev, [formType]: "" }));
    setSuccessMessages((prev) => ({ ...prev, [formType]: "" }));

    try {
      // Ensure authentication token exists
      if (!userAuth.token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      let apiResponse;
      switch (formType) {
        case "account":
          // Send only the username for account updates
          apiResponse = await updateUserProfile(
            { username: formData.username },
            userAuth.token
          );
          // Update the user context with the new username
          updateUser({ username: formData.username });
          break;
        case "password":
          // Send current and new passwords for password change
          apiResponse = await updateUserPassword(
            formData.currentPassword,
            formData.newPassword,
            userAuth.token
          );
          // Clear password fields after successful update
          setFormData((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
          break;
        case "profile":
          // Send all editable profile fields including fullName (mapped from displayName)
          apiResponse = await updateUserProfile(
            {
              fullName: formData.displayName, // Map displayName back to fullName for backend
              bio: formData.bio,
              location: formData.location,
              website: formData.website,
              publicProfile: formData.publicProfile,
              showEmail: formData.showEmail,
              activityStatus: formData.activityStatus,
            },
            userAuth.token
          );
          // Update user context with new profile data
          updateUser({
            fullName: formData.displayName,
            bio: formData.bio,
            location: formData.location,
            website: formData.website,
            publicProfile: formData.publicProfile,
            showEmail: formData.showEmail,
            activityStatus: formData.activityStatus,
          });
          break;
        case "notifications":
          // Send notification settings
          apiResponse = await updateUserNotifications(
            {
              comments: formData.comments,
              likes: formData.likes,
              messages: formData.messages,
              newsletter: formData.newsletter,
            },
            userAuth.token
          );
          // Update user context with new notification settings
          updateUser({
            notifications: {
              comments: formData.comments,
              likes: formData.likes,
              messages: formData.messages,
              newsletter: formData.newsletter,
            },
          });
          break;
        default:
          throw new Error("Unknown form type for submission.");
      }

      // Set success message and display success toast
      setSuccessMessages((prev) => ({
        ...prev,
        [formType]: apiResponse.data.message || "Changes saved successfully!",
      }));
      toast.success(
        apiResponse.data.message || "Your changes have been saved successfully."
      );
    } catch (error) {
      console.error(`Error saving ${formType} changes:`, error);
      // Determine and set error message
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to save changes. Please try again.";
      setSubmitErrors((prev) => ({
        ...prev,
        [formType]: errorMessage,
      }));
      toast.error(errorMessage); // Display error toast
    } finally {
      setIsLoading((prev) => ({ ...prev, [formType]: false })); // Reset loading state
    }
  };

  // Handler for deleting account
  const handleDeleteAccount = async () => {
    setIsLoading((prev) => ({ ...prev, deleteAccount: true }));
    try {
      if (!userAuth.token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      await deleteUserAccount(userAuth.token); // Call API to delete account
      toast.success("Your account has been successfully deleted.");
      logout(); // Log out the user from the frontend
    } catch (error) {
      console.error("Failed to delete account:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete account. Please try again.";
      setSubmitErrors((prev) => ({ ...prev, deleteAccount: errorMessage }));
      toast.error(errorMessage); // Display error toast
    } finally {
      setIsLoading((prev) => ({ ...prev, deleteAccount: false }));
      setShowDeleteConfirm(false); // Hide confirmation dialog
    }
  };

  return (
    <div className="max-w-full space-y-1 px-2 sm:px-2">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Account Tab Content */}
        <TabsContent value="account" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details and email preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitErrors.account && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitErrors.account}</AlertDescription>
                  </Alert>
                )}
                {successMessages.account && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {successMessages.account}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    className={errors.email ? "border-destructive" : ""}
                    aria-invalid={!!errors.email}
                    disabled // Email is typically not directly editable here
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className={errors.username ? "border-destructive" : ""}
                    aria-invalid={!!errors.username}
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive">
                      {errors.username}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSubmit("account")}
                  disabled={isLoading.account}
                >
                  {isLoading.account ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitErrors.password && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitErrors.password}</AlertDescription>
                  </Alert>
                )}
                {successMessages.password && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {successMessages.password}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password *</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      handleInputChange("currentPassword", e.target.value)
                    }
                    className={errors.currentPassword ? "border-destructive" : ""}
                    aria-invalid={!!errors.currentPassword}
                  />
                  {errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password *</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      handleInputChange("newPassword", e.target.value)
                    }
                    className={errors.newPassword ? "border-destructive" : ""}
                    aria-invalid={!!errors.newPassword}
                  />
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {errors.newPassword}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={errors.confirmPassword ? "border-destructive" : ""}
                    aria-invalid={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSubmit("password")}
                  disabled={isLoading.password}
                >
                  {isLoading.password ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all of your content
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitErrors.deleteAccount && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {submitErrors.deleteAccount}
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. All of
                your creations, collections, and personal information will be
                permanently removed.
              </p>
              {showDeleteConfirm && (
                <div className="mt-4 flex items-center space-x-2">
                  <span className="text-sm font-medium text-red-600">
                    Are you sure? This action cannot be undone.
                  </span>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isLoading.deleteAccount}
                  >
                    {isLoading.deleteAccount ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Confirm Delete"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isLoading.deleteAccount}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!showDeleteConfirm && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Account
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Profile Tab Content */}
        <TabsContent value="profile" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your public profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {submitErrors.profile && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitErrors.profile}</AlertDescription>
                  </Alert>
                )}
                {successMessages.profile && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      {successMessages.profile}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name *</Label>
                  <Input
                    id="display-name"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange("displayName", e.target.value)}
                    className={errors.displayName ? "border-destructive" : ""}
                    aria-invalid={!!errors.displayName}
                    // The backend expects 'fullName', so 'displayName' is editable here.
                    // If 'fullName' is meant to be derived from 'username' and not editable,
                    // then this input should be disabled. Assuming it's editable.
                  />
                  {errors.displayName && (
                    <p className="text-sm text-destructive">
                      {errors.displayName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    placeholder="Tell people about yourself..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="City, Country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    placeholder="https://yourwebsite.com"
                    className={errors.website ? "border-destructive" : ""}
                    aria-invalid={!!errors.website}
                  />
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website}</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleSubmit("profile")}
                  disabled={isLoading.profile}
                >
                  {isLoading.profile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>Update your profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={userAuth.profilePicture || "https://placehold.co/96x96/e0e0e0/000000?text=Avatar"}
                      alt="Profile"
                      className="h-24 w-24 rounded-full object-cover"
                      onError={(e) => { e.target.src = "https://placehold.co/96x96/e0e0e0/000000?text=Avatar"; }} // Fallback on error
                    />
                    <Input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setIsLoading((prev) => ({
                            ...prev,
                            profilePicture: true,
                          }));
                          try {
                            const formData = new FormData();
                            formData.append("profilePicture", file);
                            const response = await uploadProfilePicture(
                              formData,
                              userAuth.token
                            );
                            // Assuming the backend returns the new URL in response.data.profilePictureUrl or response.data.url
                            const newProfilePictureUrl =
                              response.data.profilePictureUrl || response.data.url;
                            updateUser({
                              profilePicture: newProfilePictureUrl,
                            });
                            toast.success("Profile picture updated successfully!");
                          } catch (error) {
                            console.error("Failed to upload profile picture:", error);
                            toast.error(
                              error.response?.data?.message ||
                                "Failed to upload profile picture."
                            );
                          } finally {
                            setIsLoading((prev) => ({
                              ...prev,
                              profilePicture: false,
                            }));
                          }
                        }
                      }}
                      className="hidden" // Hide the default file input
                    />
                    <Label
                      htmlFor="profile-picture-upload"
                      className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      {isLoading.profilePicture ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload New Picture"
                      )}
                    </Label>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                  <CardDescription>Update your profile cover image</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                    {userAuth.coverPicture ? (
                      <img
                        src={`${userAuth.coverPicture}?w=800&h=200&fit=crop`} // Resize parameters
                        alt="Cover"
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/Covers/cover.png";
                          e.target.className = "w-full h-full object-contain";
                        }}
                      />
                    ) : (
                      <img
                        src="/Covers/cover.png"
                        alt="Default Cover"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Upload Button */}
                  <Input
                    id="cover-picture-upload"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      
                      // Client-side validation
                      if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        toast.error("Image size should be less than 5MB");
                        return;
                      }
                      
                      setIsLoading((prev) => ({ ...prev, coverPicture: true }));
                      
                      try {
                        const formData = new FormData();
                        formData.append("coverPicture", file);
                        
                        const response = await uploadCoverPicture(
                          formData,
                          userAuth.token
                        );
                        
                        const newCoverPictureUrl = 
                          response.data.coverPictureUrl || response.data.url;
                          
                        updateUser({ coverPicture: newCoverPictureUrl });
                        toast.success("Cover image updated successfully!");
                      } catch (error) {
                        console.error("Failed to upload cover image:", error);
                        toast.error(
                          error.response?.data?.message ||
                          "Failed to upload cover image."
                        );
                      } finally {
                        setIsLoading((prev) => ({ ...prev, coverPicture: false }));
                      }
                    }}
                    className="hidden"
                  />
                  <Label
                    htmlFor="cover-picture-upload"
                    className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                  >
                    {isLoading.coverPicture ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      "Upload New Cover"
                    )}
                  </Label>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab Content */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Decide what email notifications you'd like to receive.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitErrors.notifications && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitErrors.notifications}</AlertDescription>
                </Alert>
              )}
              {successMessages.notifications && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {successMessages.notifications}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="comments">Comments on your creations</Label>
                <Switch
                  id="comments"
                  checked={formData.comments}
                  onCheckedChange={(checked) =>
                    handleInputChange("comments", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="likes">Likes on your creations</Label>
                <Switch
                  id="likes"
                  checked={formData.likes}
                  onCheckedChange={(checked) =>
                    handleInputChange("likes", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="messages">Direct messages</Label>
                <Switch
                  id="messages"
                  checked={formData.messages}
                  onCheckedChange={(checked) =>
                    handleInputChange("messages", checked)
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="newsletter">Product updates and newsletter</Label>
                <Switch
                  id="newsletter"
                  checked={formData.newsletter}
                  onCheckedChange={(checked) =>
                    handleInputChange("newsletter", checked)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubmit("notifications")}
                disabled={isLoading.notifications}
              >
                {isLoading.notifications ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
