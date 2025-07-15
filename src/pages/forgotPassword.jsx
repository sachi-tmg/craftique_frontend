import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle, Loader2, Mail } from "lucide-react";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword, sendPasswordResetEmail } from "../api/api";

export default function ForgotPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");

  // Different states of the password reset flow
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [formData, setFormData] = useState({
    email: emailParam || "",
    password: "",
    confirmPassword: "",
  });

  // Validate email form
  const validateEmailForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate password form
  const validatePasswordForm = () => {
    const newErrors = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    setSubmitError("");
  };

  // Handle sending the reset email
  const handleSendResetEmail = async (e) => {
    e.preventDefault();
    if (!validateEmailForm()) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      await sendPasswordResetEmail(formData.email);
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Failed to send reset email:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset email. Please try again.";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset submission
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      await resetPassword(token, formData.email, formData.password);
      setPasswordReset(true);
      toast.success("Password reset successfully! You can now login with your new password.");
    } catch (error) {
      console.error("Failed to reset password:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. The link may have expired or is invalid.";
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // If we have a token in the URL, show the password reset form
  if (token) {
    return (
      <div className="flex items-center justify-center p-4">
        <Card className="mx-auto max-w-md w-full">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold">
              {passwordReset ? "Password Reset Successfully" : "Reset Your Password"}
            </CardTitle>
            <CardDescription>
              {passwordReset
                ? "You can now login with your new password."
                : "Enter your new password below."}
            </CardDescription>
          </CardHeader>

          {passwordReset ? (
            <CardContent className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <Button asChild className="w-full">
                <Link to="/login">Back to Login</Link>
              </Button>
            </CardContent>
          ) : (
            <form onSubmit={handlePasswordReset}>
              <CardContent className="space-y-4">
                {submitError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    disabled={!!emailParam}
                    className={errors.email ? "border-destructive" : ""}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className={errors.password ? "border-destructive" : ""}
                    aria-invalid={!!errors.password}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
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
              <CardContent>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </CardContent>
            </form>
          )}
        </Card>
      </div>
    );
  }

  // Default view - request reset email
  return (
    <div className="flex items-center justify-center p-4">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            {emailSent ? "Check Your Email" : "Forgot Your Password?"}
          </CardTitle>
          <CardDescription>
            {emailSent
              ? `We've sent a password reset link to ${formData.email}`
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>

        {emailSent ? (
          <CardContent className="flex flex-col items-center gap-4">
            <Mail className="h-12 w-12 text-blue-500" />
            <div className="text-center text-sm text-muted-foreground">
              <p>Didn't receive the email?</p>
              <Button
                variant="link"
                className="text-sm"
                onClick={() => setEmailSent(false)}
              >
                Click to resend
              </Button>
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link to="/login">Back to Login</Link>
            </Button>
          </CardContent>
        ) : (
          <form onSubmit={handleSendResetEmail}>
            <CardContent className="space-y-4">
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>
            </CardContent>
            <CardContent>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </CardContent>
          </form>
        )}
      </Card>
    </div>
  );
}