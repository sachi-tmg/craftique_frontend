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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { registerUser } from "../api/api";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);


  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    // fullname validation
    if (!formData.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    } else if (formData.fullname.length < 3) {
      newErrors.fullname = "Full name must be at least 3 characters";
    } else if (!/^[a-zA-Z]+(?: [a-zA-Z]+)*$/.test(formData.fullname)) {
      newErrors.fullname =
        "Full name can only contain letters and spaces";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms =
        "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    setSubmitError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSubmitError("");

    try {
      // **HERE'S WHERE YOU INSERT THE PROVIDED CODE**
      const data = {
        fullName: formData.fullname, // Use formData.fullname here
        email: formData.email,
        password: formData.password,
      };
      console.log("data before registering", data);

      const res = await registerUser(data); // Await the API call

       if (res.data.success) {
        toast.success("Registration successful!"); // Toast message here
        // setSuccess(true); // No longer needed as we are directly redirecting
        setTimeout(() => {
          navigate("/login");
        }, 2000); // Redirect after 2 seconds
      } else {
        const errorMessage = res.data.message || "Something went wrong!";
        setSubmitError(errorMessage);
      }
    } catch (err) {
      console.error(err);
      if (err.response) {
        const errorMessage = err.response.data.message || "An error occurred!";
        toast.error(errorMessage);
        setSubmitError(errorMessage);
      } else if (err.request) {
        toast.error("No response from the server. Please try again.");
        setSubmitError("No response from the server. Please try again.");
      } else {
        setSubmitError("Error: " + err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className="flex items-center justify-center p-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
          <CardDescription>Create an account to showcase your creations</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-2">
            {submitError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1">
              <Label htmlFor="fullname">Full Name</Label>
              <Input
                id="fullname"
                placeholder="Sachi Tamang"
                value={formData.fullname}
                onChange={(e) => handleInputChange("fullname", e.target.value)}
                className={errors.fullname ? "border-destructive" : ""}
                aria-invalid={!!errors.fullname}
                aria-describedby={
                  errors.fullname ? "fullname-error" : undefined
                }
              />
              {errors.fullname && (
                <p id="fullname-error" className="text-sm text-destructive">
                  {errors.fullname}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={errors.email ? "border-destructive" : ""}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={errors.password ? "border-destructive" : ""}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-destructive">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={errors.confirmPassword ? "border-destructive" : ""}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={
                  errors.confirmPassword ? "confirm-password-error" : undefined
                }
              />
              {errors.confirmPassword && (
                <p
                  id="confirm-password-error"
                  className="text-sm text-destructive"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("agreeToTerms", checked === true)
                  }
                  className={errors.agreeToTerms ? "border-destructive" : ""}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <span
                    className="text-primary underline cursor-pointer"
                    onClick={() => setShowTermsModal(true)}
                  >
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span
                    className="text-primary underline cursor-pointer"
                    onClick={() => setShowPrivacyModal(true)}
                  >
                    Privacy Policy
                  </span>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
    {showTermsModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold">Terms of Service</h2>
      <div className="max-h-[60vh] overflow-y-auto text-sm space-y-2">
        <p>
          By using our platform, you agree to abide by the rules and respect all intellectual property shared on the site. Users must not post, sell, or distribute illegal or offensive content. All transactions are subject to local regulations and Craftique policies.
        </p>
        <p>
          We reserve the right to suspend or terminate accounts that violate our guidelines or abuse our services. Content uploaded must be original or properly licensed.
        </p>
        <p>
          Craftique is not liable for damages resulting from user-to-user transactions or third-party services integrated into the platform.
        </p>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setShowTermsModal(false)}>Close</Button>
      </div>
    </div>
  </div>
)}

{showPrivacyModal && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold">Privacy Policy</h2>
      <div className="max-h-[60vh] overflow-y-auto text-sm space-y-2">
        <p>
          We collect personal data such as your name, email, and profile images to provide and improve our services. Your data is stored securely and is never shared with third parties without consent.
        </p>
        <p>
          We use cookies for analytics and improving user experience. You may opt out through your browser settings.
        </p>
        <p>
          Users can request data deletion or export by contacting our support team. We comply with international privacy laws including GDPR and similar standards.
        </p>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setShowPrivacyModal(false)}>Close</Button>
      </div>
    </div>
  </div>
)}
</>
  );
}

