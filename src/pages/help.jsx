import { sendContactMessage } from "@/api/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  HelpCircle,
  Loader2,
  Mail,
  MessageSquare,
  Palette,
  Phone,
  ShoppingCart,
  User
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

// === React Toastify ===
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  // ...faqData and helpCategories (as in your code, unchanged)...
  // --- BEGIN FAQ DATA ---
  const faqData = [
    {
      id: 1,
      question: "How do I create an account?",
      answer:
        "Click the 'Sign up' button in the top right corner, fill in your details, and verify your email address. You'll then be able to start showcasing your crafts and purchasing from other artists.",
      category: "getting-started",
      keywords: ["account", "sign up", "register", "create"],
    },
    {
      id: 2,
      question: "How do I list my crafts for sale?",
      answer:
        "After logging in, click the '+' icon in the navigation or go to 'My Creations' and select 'Add New Creation'. Upload photos, add descriptions, set your price, and publish your listing.",
      category: "selling",
      keywords: ["sell", "list", "upload", "create", "listing"],
    },
    {
      id: 3,
      question: "What payment methods do you accept?",
      answer:
        "We accept major credit cards, Khalti, and cash on delivery for local orders in Kathmandu Valley. All payments are processed securely.",
      category: "buying",
      keywords: ["payment", "credit card", "khalti", "cash"],
    },
    {
      id: 4,
      question: "How does delivery work in Nepal?",
      answer:
        "We offer local delivery within Kathmandu Valley (Rs. 100) and on-site pickup. Delivery typically takes 2-3 business days.",
      category: "buying",
      keywords: ["delivery", "shipping", "kathmandu", "pickup"],
    },
    {
      id: 5,
      question: "Can I return or exchange items?",
      answer:
        "Due to the handmade nature of our products, returns are handled case-by-case. Contact the artist directly or our support team within 7 days of delivery for assistance.",
      category: "buying",
      keywords: ["return", "exchange", "refund", "handmade"],
    },
    {
      id: 6,
      question: "How do I contact an artist?",
      answer:
        "Click on the artist's name on any craft listing to view their profile and contact information. You can also save items to your favorites to contact them later.",
      category: "buying",
      keywords: ["contact", "artist", "message", "profile"],
    },
    {
      id: 7,
      question: "What if I have issues with my order?",
      answer:
        "Contact our support team immediately through the contact form below or email us. We'll work with you and the artist to resolve any issues quickly.",
      category: "buying",
      keywords: ["order", "issue", "problem", "support"],
    },
    {
      id: 8,
      question: "How do I save crafts I like?",
      answer:
        "Hover over any craft image and click the heart icon. You can view all your saved items in your profile under 'Favorites'.",
      category: "account",
      keywords: ["save", "favorites", "heart", "like"],
    },
    {
      id: 9,
      question: "How do I change my profile information?",
      answer:
        "Go to Settings > Profile to update your display name, bio, location, website, and profile picture. Changes are saved automatically.",
      category: "account",
      keywords: ["profile", "settings", "update", "change", "bio"],
    },
    {
      id: 10,
      question: "How do I set up notifications?",
      answer:
        "Visit Settings > Notifications to customize what email notifications you receive for comments, likes, messages, and our newsletter.",
      category: "account",
      keywords: ["notifications", "email", "settings", "alerts"],
    },
    {
      id: 11,
      question: "What photo guidelines should I follow?",
      answer:
        "Use high-quality, well-lit photos showing your craft from multiple angles. Images should be at least 1000px wide and clearly show the details of your work.",
      category: "selling",
      keywords: ["photos", "images", "quality", "guidelines", "upload"],
    },
    {
      id: 12,
      question: "How do I price my crafts?",
      answer:
        "Consider your materials cost, time invested, and skill level. Research similar items on the platform and factor in our platform fee when setting your price.",
      category: "selling",
      keywords: ["pricing", "cost", "materials", "fee", "sell"],
    },
  ];

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      description: "Learn the basics of using Craftique",
      icon: User,
      topics: [
        { title: "Creating an account", link: "#faq-1" },
        { title: "Setting up your profile", link: "#faq-9" },
        { title: "Navigating the platform", link: "#" },
        { title: "Understanding the community", link: "#" },
      ],
    },
    {
      id: "buying",
      title: "Buying Crafts",
      description: "Everything about purchasing handmade items",
      icon: ShoppingCart,
      topics: [
        { title: "Finding crafts", link: "#" },
        { title: "Payment methods", link: "#faq-3" },
        { title: "Delivery options", link: "#faq-4" },
        { title: "Order tracking", link: "#" },
        { title: "Returns & exchanges", link: "#faq-5" },
      ],
    },
    {
      id: "selling",
      title: "Selling Your Crafts",
      description: "How to showcase and sell your creations",
      icon: Palette,
      topics: [
        { title: "Creating listings", link: "#faq-2" },
        { title: "Photography tips", link: "#faq-11" },
        { title: "Pricing guidance", link: "#faq-12" },
        { title: "Managing orders", link: "#" },
      ],
    },
    {
      id: "account",
      title: "Account & Settings",
      description: "Managing your Craftique account",
      icon: HelpCircle,
      topics: [
        { title: "Profile settings", link: "#faq-9" },
        { title: "Privacy controls", link: "#" },
        { title: "Notification preferences", link: "#faq-10" },
        { title: "Account security", link: "#" },
      ],
    },
  ];
  // --- END FAQ DATA ---

  // --- FAQ Filtering Logic ---
  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // --- Form validation ---
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Form handlers ---
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    setSubmitError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await sendContactMessage(formData);
      toast.success("Message sent successfully! We'll get back to you within 24 hours.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "",
      });
      setSubmitError("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to send message. Please try again.";
      toast.error(errorMessage);
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToFAQ = (faqId) => {
    const element = document.getElementById(faqId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions or get in touch with our support team
        </p>
      </section>

      {/* Search */}
      <section className="max-w-md mx-auto space-y-4">
        <Input
          type="text"
          placeholder="Search for questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          aria-label="Search help topics"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="getting-started">Getting Started</SelectItem>
            <SelectItem value="buying">Buying Crafts</SelectItem>
            <SelectItem value="selling">Selling Crafts</SelectItem>
            <SelectItem value="account">Account & Settings</SelectItem>
          </SelectContent>
        </Select>
        {selectedCategory !== "all" && (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        )}
      </section>

      {/* FAQ */}
      <section className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          {filteredFAQs.length !== faqData.length && (
            <p className="text-muted-foreground mt-2">
              Showing {filteredFAQs.length} of {faqData.length} questions
            </p>
          )}
        </div>

        {filteredFAQs.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {filteredFAQs.map((faq) => (
              <AccordionItem key={faq.id} value={`item-${faq.id}`} id={`faq-${faq.id}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No questions found matching your search.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
            >
              Clear search
            </Button>
          </div>
        )}
      </section>

      {/* Contact Support */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Still Need Help?</h2>
          <p className="text-muted-foreground">Get in touch with our support team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <Mail className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Email Support</CardTitle>
              <CardDescription>Get help via email</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Response within 24 hours</p>
              <Button variant="outline" asChild>
                <Link to="mailto:support@craftique.com">support@craftique.com</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Phone className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Phone Support</CardTitle>
              <CardDescription>Call us directly</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Sun-Fri, 9 AM - 6 PM</p>
              <Button variant="outline" asChild>
                <Link to="tel:+977-1-4567890">+977-1-4567890</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Contact Form</CardTitle>
              <CardDescription>Send us a message</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Detailed support request</p>
              <Button
                variant="outline"
                onClick={() => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" })}
              >
                Fill Out Form
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card id="contact-form">
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>Describe your issue and we'll get back to you as soon as possible</CardDescription>
          </CardHeader>
          <CardContent>
            {submitError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-destructive" : ""}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-sm text-destructive">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
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
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account Issues</SelectItem>
                    <SelectItem value="buying">Buying Help</SelectItem>
                    <SelectItem value="selling">Selling Help</SelectItem>
                    <SelectItem value="technical">Technical Issues</SelectItem>
                    <SelectItem value="billing">Billing & Payments</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className={errors.subject ? "border-destructive" : ""}
                  aria-invalid={!!errors.subject}
                  aria-describedby={errors.subject ? "subject-error" : undefined}
                />
                {errors.subject && (
                  <p id="subject-error" className="text-sm text-destructive">
                    {errors.subject}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please provide as much detail as possible about your issue..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className={errors.message ? "border-destructive" : ""}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? "message-error" : undefined}
                />
                {errors.message && (
                  <p id="message-error" className="text-sm text-destructive">
                    {errors.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
