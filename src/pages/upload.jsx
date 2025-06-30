import axios from 'axios'; // Import axios for making HTTP requests
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/auth-context'; // Assuming AuthContext is here

// Assuming these UI components are available from your project's component library
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Check, HelpCircle, ImageIcon, Loader2, Upload, X } from 'lucide-react';

const CustomImage = ({ src, alt, className }) => {
  return <img src={src} alt={alt} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

export function UploadPage() {
  const [images, setImages] = useState([]); // Change to store File objects directly
  const [imageUrls, setImageUrls] = useState([]); // To display image previews
  const [forSale, setForSale] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hasDimensions, setHasDimensions] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [creationTitle, setCreationTitle] = useState("");
  const [creationDescription, setCreationDescription] = useState("");
  const [price, setPrice] = useState("");
  const [materials, setMaterials] = useState(""); // State for materials
  const [dimension, setDimension] = useState(""); // State for dimension

  const fileInputRef = useRef(null);
  const { token } = useAuth(); // Get the authentication token from your context
  const navigate = useNavigate(); // Hook for navigation

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const filesArray = Array.from(event.target.files);
      const newImageUrls = filesArray.map(file => URL.createObjectURL(file));

      setImages(prevImages => {
        const combinedImages = [...prevImages, ...filesArray];
        return combinedImages.slice(0, 5); // Limit to 5 files
      });
      setImageUrls(prevUrls => {
        const combinedUrls = [...prevUrls, ...newImageUrls];
        return combinedUrls.slice(0, 5); // Limit to 5 URLs
      });
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageUrls(prevUrls => prevUrls.filter((_, i) => i !== indexToRemove));
    setImages(prevFiles => prevFiles.filter((_, i) => i !== indexToRemove));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (["digital art", "photography", "nft", "graphic design"].includes(category)) {
      setHasDimensions(false);
      setDimension(""); // Clear dimension if not applicable
    } else {
      setHasDimensions(true);
    }
  };

  const validateDetails = (showToast = false) => {
    if (!creationTitle.trim()) {
      if (showToast) toast.error("Please enter a title for your creation.", { position: "top-center" });
      return false;
    }
    if (!creationDescription.trim()) {
      if (showToast) toast.error("Please enter a description for your creation.", { position: "top-center" });
      return false;
    }
    if (!selectedCategory) {
      if (showToast) toast.error("Please select a category for your creation.", { position: "top-center" });
      return false;
    }
    if (!materials.trim()) {
      if (showToast) toast.error("Please enter materials used for your creation.", { position: "top-center" });
      return false;
    }
    if (imageUrls.length === 0) {
      if (showToast) toast.error("Please upload at least one image.", { position: "top-center" });
      return false;
    }
    if (forSale) {
      if (!price.trim() || parseFloat(price) <= 0) {
        if (showToast) toast.error("Please enter a valid price for your creation.", { position: "top-center" });
        return false;
      }
    }
    // Add validation for dimension if hasDimensions is true
    if (hasDimensions && !dimension.trim()) {
      if (showToast) toast.error("Please enter dimensions for your creation.", { position: "top-center" });
      return false;
    }
    return true;
  };

  const handleTabChange = (value) => {
    if (value === "preview" || value === "publish") {
      if (!validateDetails(true)) {
        return;
      }
    }
    setActiveTab(value);
  };

  // --- New Function: Upload a single image to the backend ---
  const uploadImageToBackend = async (imageFile) => {
    if (!token) {
      toast.error("Authentication token is missing. Please log in.", { position: "top-center" });
      return null;
    }

    const formData = new FormData();
    formData.append("creationImage", imageFile); // 'creationImage' should match your backend's expected field name

    try {
      const response = await axios.post("http://localhost:3000/api/upload-creation-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token for authentication
          "Content-Type": "multipart/form-data", // Important for file uploads
        },
      });

      if (response.data.success) {
        // Assuming your backend sends back a 'filename' or 'filePath'
        // Construct the full URL to the image
        return `http://localhost:3000/public/uploads/${response.data.filename}`;
      }
      return null;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.", { position: "top-center" });
      return null;
    }
  };

  const handlePublish = async () => {
    // 1. Ensure user is logged in
    if (!token) {
      toast.error("You must be logged in to publish a creation.", { position: "top-center" });
      navigate("/login"); // Redirect to login page
      return;
    }

    // 2. Validate all form details
    if (!validateDetails(true)) {
      setActiveTab("details"); // Go back to details if validation fails
      return;
    }

    setIsPublishing(true);
    let creationPictureUrl = null;

    try {
      // 3. Upload the primary image (first image in the array)
      if (images.length > 0) {
        creationPictureUrl = await uploadImageToBackend(images[0]);
        if (!creationPictureUrl) {
          // If image upload failed, stop the process
          setIsPublishing(false);
          return;
        }
      }

      // 4. Prepare creation data for the main API call
      const creationData = {
        title: creationTitle,
        des: creationDescription, // Assuming 'des' is the field name on your backend
        category: selectedCategory,
        materials: materials,
        creationPicture: creationPictureUrl, // The URL of the uploaded image
        dimension: hasDimensions ? dimension : "", // Send dimension only if applicable
        price: forSale ? parseFloat(price) : 0,
        forSale: forSale, // Ensure forSale is explicitly sent
        draft: false, // Or true, depending on your workflow
      };

      // 5. Send creation data to the backend
      const response = await axios.post("http://localhost:3000/api/publish-creation", creationData, {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token for authentication
          "Content-Type": "application/json", // Important for JSON data
        },
      });

      if (response.data.id) {
        // Assuming your backend returns an 'id' for the new creation
        toast.success("Your creation has been successfully published!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        setShowSuccessDialog(true);
        // Optionally, reset form fields here:
        // setCreationTitle(""); setImageUrls([]); etc.
      } else {
        toast.error("Failed to publish creation. Please try again.", { position: "top-center" });
      }
    } catch (error) {
      console.error("Error publishing creation:", error);
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      toast.error(errorMessage, { position: "top-center" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleViewCreation = () => {
    setShowSuccessDialog(false);
    // You would typically navigate to the new creation's page here using the ID returned from the backend
    navigate("/"); // Placeholder: Navigate to home or a specific creation page
  };

  const categories = [
    "Pottery", "Origami", "Embroidery", "Painting", "Weaving", "Macramé",
    "Woodworking", "Jewelry", "Knitting", "Digital Art", "Photography",
    "Graphic Design", "Other",
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Creation</h1>
        <p className="text-muted-foreground">Share your handmade creation with the Craftique community</p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="preview" disabled={!validateDetails() && activeTab !== "preview"}>
            Preview
          </TabsTrigger>
          <TabsTrigger value="publish" disabled={!validateDetails() && activeTab !== "publish"}>
            Publish
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Upload Images</h2>
                <p className="text-sm text-muted-foreground">
                  Upload high-quality images of your creation. You can add up to 5 images.
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                  {imageUrls.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <CustomImage
                        src={imageUrl}
                        alt={`Uploaded image ${index + 1}`}
                        className="object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {imageUrls.length < 5 && (
                    <div
                      className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed"
                      onClick={handleAddImageClick}
                    >
                      <div className="flex flex-col items-center gap-1 text-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Add Image</span>
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                    multiple
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter a title for your creation"
                    value={creationTitle}
                    onChange={(e) => setCreationTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your creation, including materials, techniques, and inspiration"
                    className="min-h-32"
                    value={creationDescription}
                    onChange={(e) => setCreationDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={handleCategoryChange} value={selectedCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="materials">Materials Used</Label>
                  <Input
                    id="materials"
                    placeholder="e.g., Clay, Glaze, Wood, Fabric"
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="dimensions" className="flex items-center gap-1">
                      Dimensions
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
                              <HelpCircle className="h-3 w-3" />
                              <span className="sr-only">Dimensions info</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Optional for digital creations</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has-dimensions"
                        checked={hasDimensions}
                        onCheckedChange={(checked) => setHasDimensions(checked === true)}
                      />
                      <label
                        htmlFor="has-dimensions"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        This item has physical dimensions
                      </label>
                    </div>
                  </div>
                  {hasDimensions ? (
                    <Input
                      id="dimensions"
                      placeholder="e.g., 10 inches x 5 inches x 3 inches"
                      value={dimension}
                      onChange={(e) => setDimension(e.target.value)}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground border rounded-md p-2 bg-muted/20">
                      No physical dimensions needed for this creation
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="for-sale"
                    checked={forSale}
                    onCheckedChange={(checked) => setForSale(checked === true)}
                  />
                  <Label htmlFor="for-sale">This creation is for sale</Label>
                </div>
                {forSale && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (Rs)</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="0.00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={() => handleTabChange("preview")}>Continue to Preview</Button>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-semibold">Preview Your Creation</h2>
                <p className="text-sm text-muted-foreground">
                  This is how your primary image will appear to others on Craftique.
                </p>
                <div className="mx-auto max-w-md overflow-hidden rounded-lg border">
                  <div className="aspect-square relative">
                    {imageUrls.length > 0 ? (
                      <CustomImage src={imageUrls[0]} alt="Creation preview" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground">
                        No image uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("details")}>
              Back to Details
            </Button>
            <Button onClick={() => handleTabChange("publish")}>Continue to Publish</Button>
          </div>
        </TabsContent>

        <TabsContent value="publish" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Ready to Publish</h2>
                <p className="text-sm text-muted-foreground">
                  Your creation is ready to be shared with the Craftique community
                </p>
                <div className="mx-auto max-w-md space-y-4 pt-4">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>Creation details completed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>Images uploaded</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>Preview confirmed</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab("preview")}>
              Back to Preview
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Creation"
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creation Published Successfully!</DialogTitle>
            <DialogDescription>
              Your creation "{creationTitle || "Handcrafted Item"}" has been published and is now visible to the
              Craftique community.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Check className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setShowSuccessDialog(false)}>
              Create Another
            </Button>
            <Button onClick={handleViewCreation}>View Your Creation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}