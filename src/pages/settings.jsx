import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import the CSS

// Assuming these are your custom UI components,
// you'll need to ensure they are available in your React project.
// For demonstration, I'm assuming they are basic components or
// that you'll have their implementations ready.
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

// Assuming these icons are from 'lucide-react', you'll need to install it
// if you haven't already: npm install lucide-react
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState({});
  const [formData, setFormData] = useState({
    // Account tab
    email: "emma@example.com",
    username: "emmaj",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",

    // Profile tab
    displayName: "Emma Johnson",
    bio: "Ceramic artist specializing in functional pottery with a modern twist",
    location: "Portland, OR",
    website: "www.emmajohnsonceramics.com",

    // Notifications tab
    comments: true,
    likes: false,
    messages: true,
    newsletter: false,

    // Privacy tab
    publicProfile: true,
    showEmail: false,
    activityStatus: true,
  });
  const [errors, setErrors] = useState({});
  const [submitErrors, setSubmitErrors] = useState({});
  const [successMessages, setSuccessMessages] = useState({});
  // const { toast } = useToast(); // Removed Next.js specific useToast

  const validateAccountForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

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

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = "Display name must be at least 2 characters";
    }

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear submit errors and success messages
    setSubmitErrors((prev) => ({ ...prev, [field]: "" }));
    setSuccessMessages((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async (formType) => {
    let validationErrors = {};

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
      default:
        break;
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitErrors((prev) => ({
        ...prev,
        [formType]: "Please fix the errors above",
      }));
      toast.error("Please fix the errors above."); // React-toastify error
      return;
    }

    setIsLoading((prev) => ({ ...prev, [formType]: true }));
    setSubmitErrors((prev) => ({ ...prev, [formType]: "" }));

    try {
      // Simulate API call
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate random failure for demo
          if (Math.random() < 0.1) {
            reject(new Error("Failed to save changes. Please try again."));
          } else {
            resolve(true);
          }
        }, 2000);
      });

      setSuccessMessages((prev) => ({
        ...prev,
        [formType]: "Changes saved successfully!",
      }));

      // Clear password fields after successful password change
      if (formType === "password") {
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }

      toast.success("Your changes have been saved successfully."); // React-toastify success
    } catch (error) {
      setSubmitErrors((prev) => ({
        ...prev,
        [formType]: error.message || "Failed to save changes. Please try again.",
      }));
      toast.error(error.message || "Failed to save changes. Please try again."); // React-toastify error
    } finally {
      setIsLoading((prev) => ({ ...prev, [formType]: false }));
    }
  };

  return (
    <div className="max-w-full space-y-6">
      <ToastContainer /> {/* Add ToastContainer here */}
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
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

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
                    <AlertDescription>{successMessages.account}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                    aria-invalid={!!errors.email}
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
              <p className="text-sm text-muted-foreground">
                Once you delete your account, there is no going back. All of
                your creations, collections, and personal information will be
                permanently removed.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="destructive">Delete Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>

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
                    onChange={(e) =>
                      handleInputChange("displayName", e.target.value)
                    }
                    className={errors.displayName ? "border-destructive" : ""}
                    aria-invalid={!!errors.displayName}
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
                    <div className="h-24 w-24 rounded-full bg-muted" />
                    <Button>Upload New Picture</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cover Image</CardTitle>
                  <CardDescription>Update your profile cover image</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-32 rounded-lg bg-muted" />
                  <Button>Upload New Cover</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="comments">Comments</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails when someone comments on your creations
                    </p>
                  </div>
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
                  <div className="space-y-0.5">
                    <Label htmlFor="likes">Likes</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails when someone likes your creations
                    </p>
                  </div>
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
                  <div className="space-y-0.5">
                    <Label htmlFor="messages">Messages</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails when someone sends you a message
                    </p>
                  </div>
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
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletter">Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive our weekly newsletter with featured creations
                    </p>
                  </div>
                  <Switch
                    id="newsletter"
                    checked={formData.newsletter}
                    onCheckedChange={(checked) =>
                      handleInputChange("newsletter", checked)
                    }
                  />
                </div>
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
                  "Save Preferences"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Manage your privacy preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Profile Visibility</h3>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="public-profile">Public Profile</Label>
                    <p className="text-sm text-muted-foreground">
                      Make your profile visible to everyone
                    </p>
                  </div>
                  <Switch
                    id="public-profile"
                    checked={formData.publicProfile}
                    onCheckedChange={(checked) =>
                      handleInputChange("publicProfile", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-email">Show Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Show your email address on your public profile
                    </p>
                  </div>
                  <Switch
                    id="show-email"
                    checked={formData.showEmail}
                    onCheckedChange={(checked) =>
                      handleInputChange("showEmail", checked)
                    }
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="activity-status">Activity Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Show when you're active on Craftique
                    </p>
                  </div>
                  <Switch
                    id="activity-status"
                    checked={formData.activityStatus}
                    onCheckedChange={(checked) =>
                      handleInputChange("activityStatus", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSubmit("privacy")}
                disabled={isLoading.privacy}
              >
                {isLoading.privacy ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Privacy Settings"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}