// import { useRef, useState } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

// // Assuming these UI components are available from your project's component library
// // You would need to ensure these paths are correct for your setup.
// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Checkbox } from '@/components/ui/checkbox';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Textarea } from '@/components/ui/textarea';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { Check, HelpCircle, ImageIcon, Loader2, Upload, X } from 'lucide-react';

// // A simple Image component replacement for next/image
// const CustomImage = ({ src, alt, className }) => {
//   return <img src={src} alt={alt} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
// };

// export function UploadPage() {
//   const [images, setImages] = useState([]);
//   const [forSale, setForSale] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [hasDimensions, setHasDimensions] = useState(true);
//   const [activeTab, setActiveTab] = useState("details");
//   const [isPublishing, setIsPublishing] = useState(false);
//   const [showSuccessDialog, setShowSuccessDialog] = useState(false);
//   const [creationTitle, setCreationTitle] = useState("");
//   const [creationDescription, setCreationDescription] = useState("");
//   const [price, setPrice] = useState("");
//   const fileInputRef = useRef(null);

//   const handleAddImageClick = () => {
//     fileInputRef.current?.click();
//   };

//   const handleFileChange = (event) => {
//     if (event.target.files && event.target.files.length > 0) {
//       const filesArray = Array.from(event.target.files);
//       const newImageUrls = filesArray.map(file => URL.createObjectURL(file));

//       // Limit to a total of 5 images
//       setImages(prevImages => {
//         const combinedImages = [...prevImages, ...newImageUrls];
//         return combinedImages.slice(0, 5); // Take only the first 5
//       });
//     }
//   };

//   const handleCategoryChange = (category) => {
//     setSelectedCategory(category);
//     if (["digital art", "photography", "nft", "graphic design"].includes(category)) { // Use lowercase for comparison
//       setHasDimensions(false);
//     } else {
//       setHasDimensions(true);
//     }
//   };

//   // --- Validation Logic (now only returns boolean) ---
//   const validateDetails = (showToast = false) => {
//     if (!creationTitle.trim()) {
//       if (showToast) toast.error("Please enter a title for your creation.", { position: "top-center" });
//       return false;
//     }
//     if (!creationDescription.trim()) {
//       if (showToast) toast.error("Please enter a description for your creation.", { position: "top-center" });
//       return false;
//     }
//     if (!selectedCategory) {
//       if (showToast) toast.error("Please select a category for your creation.", { position: "top-center" });
//       return false;
//     }
//     if (images.length === 0) {
//       if (showToast) toast.error("Please upload at least one image.", { position: "top-center" });
//       return false;
//     }
//     if (forSale) {
//       if (!price.trim() || parseFloat(price) <= 0) {
//         if (showToast) toast.error("Please enter a valid price for your creation.", { position: "top-center" });
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleTabChange = (value) => {
//     if (value === "preview" || value === "publish") {
//       // Only show toasts when explicitly trying to navigate to preview/publish
//       if (!validateDetails(true)) {
//         return; // Prevent tab change if validation fails
//       }
//     }
//     setActiveTab(value);
//   };

//   const handlePublish = () => {
//     // Re-validate with toast before publishing
//     if (!validateDetails(true)) {
//       setActiveTab("details"); // Go back to details if validation fails
//       return;
//     }

//     setIsPublishing(true);

//     setTimeout(() => {
//       setIsPublishing(false);
//       setShowSuccessDialog(true);
//     }, 2000);
//   };

//   const handleViewCreation = () => {
//     setShowSuccessDialog(false);

//     toast.success("Your creation has been successfully published!", {
//       position: "top-right",
//       autoClose: 5000,
//       hideProgressBar: false,
//       closeOnClick: true,
//       pauseOnHover: true,
//       draggable: true,
//       progress: undefined,
//       theme: "light",
//     });

//     console.log("Navigating to /craft/new-creation");
//   };

//   const categories = [
//     "Pottery",
//     "Origami",
//     "Embroidery",
//     "Painting",
//     "Weaving",
//     "Macramé",
//     "Woodworking",
//     "Jewelry",
//     "Knitting",
//     "Digital Art",
//     "Photography",
//     "Graphic Design",
//     "Other",
//   ];

//   return (
//     <div className="mx-auto max-w-3xl space-y-8">
//       <div>
//         <h1 className="text-3xl font-bold tracking-tight">Upload Creation</h1>
//         <p className="text-muted-foreground">Share your handmade creation with the Craftique community</p>
//       </div>

//       <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="details">Details</TabsTrigger>
//           {/* Tabs are disabled if details are not valid AND user is NOT already on that tab */}
//           <TabsTrigger value="preview" disabled={!validateDetails() && activeTab !== "preview"}>
//             Preview
//           </TabsTrigger>
//           <TabsTrigger value="publish" disabled={!validateDetails() && activeTab !== "publish"}>
//             Publish
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="details" className="space-y-6">
//           <Card>
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 <h2 className="text-xl font-semibold">Upload Images</h2>
//                 <p className="text-sm text-muted-foreground">
//                   Upload high-quality images of your creation. You can add up to 5 images.
//                 </p>
//                 <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
//                   {images.map((image, index) => (
//                     <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
//                       <CustomImage
//                         src={image}
//                         alt={`Uploaded image ${index + 1}`}
//                         className="object-cover"
//                       />
//                       <Button
//                         variant="destructive"
//                         size="icon"
//                         className="absolute right-1 top-1 h-6 w-6"
//                         onClick={(e) => {
//                           e.stopPropagation(); // Prevent triggering file input when removing
//                           setImages(images.filter((_, i) => i !== index));
//                         }}
//                       >
//                         <X className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   ))}
//                   {images.length < 5 && (
//                     <div
//                       className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed"
//                       onClick={handleAddImageClick} // Clickable area for adding images
//                     >
//                       <div className="flex flex-col items-center gap-1 text-center">
//                         <ImageIcon className="h-8 w-8 text-muted-foreground" />
//                         <span className="text-xs text-muted-foreground">Add Image</span>
//                       </div>
//                     </div>
//                   )}
//                   {/* Invisible file input */}
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileChange}
//                     className="hidden"
//                     accept="image/*" // Restrict to image files
//                     multiple // Allow multiple file selection
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="title">Title</Label>
//                   <Input
//                     id="title"
//                     placeholder="Enter a title for your creation"
//                     value={creationTitle}
//                     onChange={(e) => setCreationTitle(e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="description">Description</Label>
//                   <Textarea
//                     id="description"
//                     placeholder="Describe your creation, including materials, techniques, and inspiration"
//                     className="min-h-32"
//                     value={creationDescription}
//                     onChange={(e) => setCreationDescription(e.target.value)}
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="category">Category</Label>
//                   <Select onValueChange={handleCategoryChange} value={selectedCategory}>
//                     <SelectTrigger id="category">
//                       <SelectValue placeholder="Select a category" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {categories.map((category) => (
//                         <SelectItem key={category} value={category.toLowerCase()}>
//                           {category}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="materials">Materials Used</Label>
//                   <Input id="materials" placeholder="e.g., Clay, Glaze, Wood, Fabric" />
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex items-center justify-between">
//                     <Label htmlFor="dimensions" className="flex items-center gap-1">
//                       Dimensions
//                       <TooltipProvider>
//                         <Tooltip>
//                           <TooltipTrigger asChild>
//                             <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full p-0">
//                               <HelpCircle className="h-3 w-3" />
//                               <span className="sr-only">Dimensions info</span>
//                             </Button>
//                           </TooltipTrigger>
//                           <TooltipContent>
//                             <p>Optional for digital creations</p>
//                           </TooltipContent>
//                         </Tooltip>
//                       </TooltipProvider>
//                       <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
//                     </Label>
//                     <div className="flex items-center space-x-2">
//                       <Checkbox
//                         id="has-dimensions"
//                         checked={hasDimensions}
//                         onCheckedChange={(checked) => setHasDimensions(checked === true)}
//                       />
//                       <label
//                         htmlFor="has-dimensions"
//                         className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                       >
//                         This item has physical dimensions
//                       </label>
//                     </div>
//                   </div>
//                   {hasDimensions ? (
//                     <Input id="dimensions" placeholder="e.g., 10 inches x 5 inches x 3 inches" />
//                   ) : (
//                     <div className="text-sm text-muted-foreground border rounded-md p-2 bg-muted/20">
//                       No physical dimensions needed for this creation
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <div className="space-y-4">
//                 <div className="flex items-center space-x-2">
//                   <Checkbox
//                     id="for-sale"
//                     checked={forSale}
//                     onCheckedChange={(checked) => setForSale(checked === true)}
//                   />
//                   <Label htmlFor="for-sale">This creation is for sale</Label>
//                 </div>
//                 {forSale && (
//                   <div className="space-y-4 pl-6">
//                     <div className="space-y-2">
//                       <Label htmlFor="price">Price (Rs)</Label>
//                       <Input
//                         id="price"
//                         type="number"
//                         placeholder="0.00"
//                         value={price}
//                         onChange={(e) => setPrice(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex justify-end">
//             <Button onClick={() => handleTabChange("preview")}>Continue to Preview</Button>
//           </div>
//         </TabsContent>

//         <TabsContent value="preview" className="space-y-6">
//           <Card>
//             <CardContent className="p-6">
//               <div className="space-y-4 text-center">
//                 <h2 className="text-xl font-semibold">Preview Your Creation</h2>
//                 <p className="text-sm text-muted-foreground">
//                   This is how your primary image will appear to others on Craftique.
//                 </p>
//                 <div className="mx-auto max-w-md overflow-hidden rounded-lg border">
//                   <div className="aspect-square relative">
//                     {/* Display the first uploaded image, or a placeholder if none */}
//                     {images.length > 0 ? (
//                       <CustomImage src={images[0]} alt="Creation preview" className="object-cover" />
//                     ) : (
//                       <div className="flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground">
//                         No image uploaded
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex justify-between">
//             <Button variant="outline" onClick={() => setActiveTab("details")}>
//               Back to Details
//             </Button>
//             <Button onClick={() => handleTabChange("publish")}>Continue to Publish</Button>
//           </div>
//         </TabsContent>

//         <TabsContent value="publish" className="space-y-6">
//           <Card>
//             <CardContent className="p-6">
//               <div className="space-y-4 text-center">
//                 <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
//                   <Upload className="h-6 w-6 text-primary" />
//                 </div>
//                 <h2 className="text-xl font-semibold">Ready to Publish</h2>
//                 <p className="text-sm text-muted-foreground">
//                   Your creation is ready to be shared with the Craftique community
//                 </p>
//                 <div className="mx-auto max-w-md space-y-4 pt-4">
//                   <div className="flex items-center justify-between rounded-md border p-3">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
//                         <Check className="h-4 w-4 text-primary" />
//                       </div>
//                       <span>Creation details completed</span>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between rounded-md border p-3">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
//                         <Check className="h-4 w-4 text-primary" />
//                       </div>
//                       <span>Images uploaded</span>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between rounded-md border p-3">
//                     <div className="flex items-center gap-3">
//                       <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
//                         <Check className="h-4 w-4 text-primary" />
//                       </div>
//                       <span>Preview confirmed</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex justify-between">
//             <Button variant="outline" onClick={() => setActiveTab("preview")}>
//               Back to Preview
//             </Button>
//             <Button onClick={handlePublish} disabled={isPublishing}>
//               {isPublishing ? (
//                 <>
//                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Publishing...
//                 </>
//               ) : (
//                 "Publish Creation"
//               )}
//             </Button>
//           </div>
//         </TabsContent>
//       </Tabs>

//       {/* Success Dialog */}
//       <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle>Creation Published Successfully!</DialogTitle>
//             <DialogDescription>
//               Your creation "{creationTitle || "Handcrafted Item"}" has been published and is now visible to the
//               Craftique community.
//             </DialogDescription>
//           </DialogHeader>
//           <div className="flex justify-center py-4">
//             <div className="rounded-full bg-primary/10 p-3">
//               <Check className="h-8 w-8 text-primary" />
//             </div>
//           </div>
//           <DialogFooter className="sm:justify-center">
//             <Button variant="outline" onClick={() => setShowSuccessDialog(false)}>
//               Create Another
//             </Button>
//             <Button onClick={handleViewCreation}>View Your Creation</Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       <ToastContainer />
//     </div>
//   );
// }

import { useContext, useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS

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

// Import API functions
import { publishCreation, uploadCreationImage } from '../api/api'; // Adjust path as needed

// -----------------------------------------------------------------------------
// IMPORTANT CHANGE HERE:
// Import AuthContext from your actual authentication module, NOT a placeholder.
import { AuthContext } from '../contexts/auth-context'; // Assuming auth-context.jsx is in the same directory or adjust path
// -----------------------------------------------------------------------------

// A simple Image component replacement for next/image
const CustomImage = ({ src, alt, className }) => {
  return <img src={src} alt={alt} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
};

export function UploadPage() {
  const [images, setImages] = useState([]); // Stores URLs of uploaded images
  const [imageFiles, setImageFiles] = useState([]); // Stores actual File objects for upload
  const [forSale, setForSale] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hasDimensions, setHasDimensions] = useState(true);
  const [activeTab, setActiveTab] = useState("details");
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [creationTitle, setCreationTitle] = useState("");
  const [creationDescription, setCreationDescription] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState(""); // New state for materials
  const [dimensions, setDimensions] = useState(""); // New state for dimensions
  const [price, setPrice] = useState("");
  const fileInputRef = useRef(null);

  // -------------------------------------------------------------------------
  // IMPORTANT CHANGE HERE:
  // Access userAuth from the imported AuthContext, then destructure token.
  const { userAuth } = useContext(AuthContext);
  const token = userAuth.token;
  // -------------------------------------------------------------------------

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

const handleFileChange = async (event) => {
    console.log("handleFileChange triggered.");
    if (event.target.files && event.target.files.length > 0) {
        console.log("Files detected:", event.target.files);
        const filesArray = Array.from(event.target.files);
        const newImageFiles = filesArray.slice(0, 5 - images.length);

        const uploadPromises = newImageFiles.map(async (file) => {
            const formData = new FormData();
            formData.append('creationImage', file); // Make sure 'creationImage' matches your Multer field name

            console.log("Attempting to upload file:", file.name);

            try {
                // This calls your backend's /api/creation/creationImage endpoint
                const response = await uploadCreationImage(formData);
                console.log("Upload API response:", response.data);

                if (response.data.success) {
                    // *** IMPORTANT MODIFICATION HERE ***
                    // Construct the full URL, just like your banner upload does
                    // Make sure the path '/Creations/' matches where your backend serves these images
                    const imageUrl = response.data.filename;
                    console.log("Constructed image URL:", imageUrl);
                    return imageUrl; // Return the full URL
                } else {
                    toast.error("Image upload failed: " + (response.data.message || "Unknown error"));
                    return null;
                }
            } catch (error) {
                console.error("Error during image upload API call:", error);
                toast.error("Failed to upload image. Please try again.", { position: "top-center" });
                return null;
            }
        });

        const uploadedImageUrls = (await Promise.all(uploadPromises)).filter(Boolean);

        setImages(prevImages => {
            const combinedImages = [...prevImages, ...uploadedImageUrls];
            return combinedImages.slice(0, 5);
        });
        console.log("Images state updated:", uploadedImageUrls);
    } else {
        console.log("No files selected or files array is empty.");
    }
};

  const handleRemoveImage = (indexToRemove) => {
    setImages(images.filter((_, i) => i !== indexToRemove));
    // If you were tracking imageFiles, you'd remove it here too:
    // setImageFiles(imageFiles.filter((_, i) => i !== indexToRemove));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (["digital art", "photography", "nft", "graphic design"].includes(category)) {
      setHasDimensions(false);
      setDimensions(""); // Clear dimensions if category doesn't need them
    } else {
      setHasDimensions(true);
    }
  };

  // --- Validation Logic ---
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
    if (!materialsUsed.trim()) { // Validate materials
      if (showToast) toast.error("Please enter materials used for your creation.", { position: "top-center" });
      return false;
    }
    if (images.length === 0) {
      if (showToast) toast.error("Please upload at least one image.", { position: "top-center" });
      return false;
    }
    if (forSale) {
      if (!price.trim() || parseFloat(price) <= 0) {
        if (showToast) toast.error("Please enter a valid price for your creation.", { position: "top-center" });
        return false;
      }
    }
    return true;
  };

  const handleTabChange = (value) => {
    if (value === "preview" || value === "publish") {
      if (!validateDetails(true)) {
        return; // Prevent tab change if validation fails
      }
    }
    setActiveTab(value);
  };

  const handlePublish = async () => {
    if (!validateDetails(true)) {
      setActiveTab("details"); // Go back to details if validation fails
      return;
    }

    // --- Add a check for token presence before publishing ---
    if (!token) {
        toast.error("You must be logged in to publish a creation.", { position: "top-center" });
        setIsPublishing(false); // Ensure publishing state is false
        return;
    }
    // --- End check for token presence ---

    setIsPublishing(true);
    let loadingToast = toast.loading("Publishing creation...");

    // Prepare data for backend
    const creationData = {
      title: creationTitle,
      des: creationDescription,
      category: selectedCategory,
      materials: materialsUsed,
      creationPicture: images.length > 0 ? images[0] : null, // Send the URL of the first image
      dimension: hasDimensions ? dimensions : null, // Send dimension if applicable
      price: forSale ? parseFloat(price) : 0,
      forSale: forSale,
      draft: false, // Always publish as not a draft
    };

    try {
      // ---------------------------------------------------------------------
      // The `token` variable now correctly holds the token from AuthContext.
      await publishCreation(creationData, token); // Call the API function
      // ---------------------------------------------------------------------
      toast.dismiss(loadingToast);
      setIsPublishing(false);
      setShowSuccessDialog(true);
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
    } catch (error) {
      console.error("Error publishing creation:", error);
      toast.dismiss(loadingToast);
      setIsPublishing(false);
      const errorMessage = error?.response?.data?.message || error?.message || "An error occurred while publishing your creation.";
      toast.error(errorMessage, { position: "top-center" });
    }
  };

  const handleViewCreation = () => {
    setShowSuccessDialog(false);
    console.log("Navigating to /craft/new-creation");
    // In a real app, you would navigate to the new creation's page:
    // navigate(`/creation/${creation_id}`);
  };

  const categories = [
    "Pottery",
    "Origami",
    "Embroidery",
    "Painting",
    "Weaving",
    "Macramé",
    "Woodworking",
    "Jewelry",
    "Knitting",
    "Digital Art",
    "Photography",
    "Graphic Design",
    "Other",
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
                  {images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-md border">
                      <CustomImage
                        src={image}
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
                  {images.length < 5 && (
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
                    value={materialsUsed}
                    onChange={(e) => setMaterialsUsed(e.target.value)}
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
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
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
                    {images.length > 0 ? (
                      <CustomImage src={images[0]} alt="Creation preview" className="object-cover" />
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

      {/* Success Dialog */}
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