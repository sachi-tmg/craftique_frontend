import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, HelpCircle, ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getCreationById, updateCreation, uploadCreationImage } from "../api/api";
import { useAuth } from "../contexts/auth-context";

const DESCRIPTION_MAX_LENGTH = 500;

const categories = [
  "Pottery", "Origami", "Embroidery", "Painting", "Weaving", "Macramé",
  "Woodworking", "Jewelry", "Knitting", "Digital Art", "Photography", "Graphic Design", "Other",
];

const CustomImage = ({ src, alt, className }) => (
  <img src={src} alt={alt} className={className} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
);

export default function EditCreationPage() {
  const { creation_id } = useParams();
  const navigate = useNavigate();
  const { userAuth } = useAuth();

  // Progress stepper
  const steps = ["Details", "Preview", "Update"];
  const [activeStep, setActiveStep] = useState(0);

  // Form state
  const [image, setImage] = useState(null);
  const [forSale, setForSale] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [hasDimensions, setHasDimensions] = useState(true);
  const [creationTitle, setCreationTitle] = useState("");
  const [creationDescription, setCreationDescription] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load existing creation
  useEffect(() => {
    const fetchCreation = async () => {
      try {
        const response = await getCreationById(creation_id);
        if (response.data) {
          const {
            title,
            des,
            category,
            materials,
            dimension,
            price,
            forSale,
            creationPicture,
          } = response.data;
          setCreationTitle(title || "");
          setCreationDescription(des || "");
          setSelectedCategory((category || "").toLowerCase());
          setMaterialsUsed(materials || "");
          setDimensions(dimension || "");
          setPrice(price || "");
          setForSale(forSale || false);
          setImage(creationPicture || null);
          setHasDimensions(
            !["digital art", "photography", "nft", "graphic design"].includes((category || "").toLowerCase())
          );
        }
      } catch (err) {
        setError(err.message || "Failed to load creation data");
      }
    };
    fetchCreation();
  }, [creation_id]);

  // HANDLERS

  // --- Image ---
  const handleAddImageClick = () => fileInputRef.current?.click();
  const handleFileChange = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setImageUploading(true);
      try {
        const formData = new FormData();
        formData.append('creationImage', file);
        const response = await uploadCreationImage(formData);
        if (response.data.success) {
          const imageUrl = response.data.filename;
          setImage(imageUrl);
          toast.success("Image uploaded successfully!", { position: "top-center" });
        } else {
          toast.error("Image upload failed." + (response.data.message || "Unknown error"));
        }
      } catch (error) {
        toast.error("Failed to upload image. Please try again.", { position: "top-center" });
      } finally {
        setImageUploading(false);
      }
    }
  };
  const handleRemoveImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Image removed.", { position: "top-center" });
  };

  // --- Category ---
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (["digital art", "photography", "nft", "graphic design"].includes(category)) {
      setHasDimensions(false);
      setDimensions("");
    } else {
      setHasDimensions(true);
    }
  };

  // --- Description ---
  const handleDescriptionChange = (e) => {
    const text = e.target.value;
    if (text.length <= DESCRIPTION_MAX_LENGTH) {
      setCreationDescription(text);
    } else {
      toast.info(`Description limited to ${DESCRIPTION_MAX_LENGTH} characters.`, {
        position: "bottom-center",
        autoClose: 1500,
        hideProgressBar: true,
      });
    }
  };

  // --- Validation per step ---
  const validateDetails = (showToast = false) => {
    if (!creationTitle.trim()) {
      if (showToast) toast.error("Please enter a title for your creation.", { position: "top-center" });
      return false;
    }
    if (!creationDescription.trim()) {
      if (showToast) toast.error("Please enter a description for your creation.", { position: "top-center" });
      return false;
    }
    if (creationDescription.length > DESCRIPTION_MAX_LENGTH) {
      if (showToast) toast.error(`Description exceeds maximum length of ${DESCRIPTION_MAX_LENGTH} characters.`, { position: "top-center" });
      return false;
    }
    if (!selectedCategory) {
      if (showToast) toast.error("Please select a category for your creation.", { position: "top-center" });
      return false;
    }
    if (!materialsUsed.trim()) {
      if (showToast) toast.error("Please enter materials used for your creation.", { position: "top-center" });
      return false;
    }
    if (!image) {
      if (showToast) toast.error("Please upload one image for your creation.", { position: "top-center" });
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

  // --- Navigation ---
  const handleNext = () => {
    if (activeStep === 0 && !validateDetails(true)) return;
    setActiveStep((step) => step + 1);
  };
  const handleBack = () => setActiveStep((step) => step - 1);

  // --- Submit ---
  const handleUpdate = async () => {
    if (!validateDetails(true)) {
      setActiveStep(0);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      await updateCreation(
        creation_id,
        {
          title: creationTitle,
          des: creationDescription,
          category: selectedCategory,
          materials: materialsUsed,
          creationPicture: image,
          dimension: hasDimensions ? dimensions : null,
          price: forSale ? parseFloat(price) : 0,
          forSale: forSale,
        },
        userAuth.token
      );
      setShowSuccessDialog(true);
      toast.success("Your creation has been updated!", {
        position: "top-right",
        autoClose: 5000,
      });
    } catch (error) {
      setError(error?.message || "Failed to update creation. Please try again.");
      toast.error(error?.message || "Failed to update creation.", { position: "top-center" });
    }
    setIsSubmitting(false);
  };

  // --- Reset (for "Edit Another") ---
  const resetForm = () => {
    setActiveStep(0);
    setShowSuccessDialog(false);
    setError(null);
    setIsSubmitting(false);
  };

  // --- Stepper UI ---

function StepperBar({ step }) {
  const steps = [
    { label: "Details" },
    { label: "Preview" },
    { label: "Update" }
  ];
  return (
    <div className="flex items-center justify-center gap-8 mb-8 mt-2 select-none">
      {steps.map((s, idx) => (
        <div key={s.label} className="flex items-center gap-1">
          <div className={`
            rounded-full flex items-center justify-center font-semibold border-2 transition-all
            ${step === idx + 1
              ? "bg-primary text-white border-primary shadow"
              : step > idx + 1
                ? "bg-primary/80 text-white border-primary"
                : "bg-gray-100 text-gray-400 border-gray-300"
            }
          `}
            style={{ width: 38, height: 38, fontSize: 19, minWidth: 38, minHeight: 38 }}
          >
            {step > idx + 1 ? <Check size={22} /> : idx + 1}
          </div>
          <span className={`text-sm font-medium ml-3 ${step === idx + 1 ? "text-primary" : "text-gray-500"}`}>
            {s.label}
          </span>
          {idx < steps.length - 1 && (
            <div className={`mx-2 h-1 w-14 rounded-full transition-all
              ${step > idx + 1 ? "bg-primary/80" : "bg-gray-200"}`}></div>
          )}
        </div>
      ))}
    </div>
  );
}

  // UI
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Creation</h1>
        <p className="text-muted-foreground">Update your creation’s info and image</p>
      </div>

      {/* Progress Bar */}
      <StepperBar step={activeStep + 1} />

      {/* STEP 1: DETAILS */}
      {activeStep === 0 && (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Upload Image</h2>
                <div className="grid grid-cols-1 gap-4">
                  {image ? (
                    <div className="relative aspect-video overflow-hidden rounded-md border">
                      <CustomImage src={image} alt="Uploaded creation image" className="object-cover" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute right-1 top-1 h-6 w-6"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="flex aspect-video cursor-pointer items-center justify-center rounded-md border border-dashed"
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
                    onChange={handleDescriptionChange}
                  />
                  <div className="text-right text-sm text-muted-foreground">
                    {creationDescription.length}/{DESCRIPTION_MAX_LENGTH} characters
                  </div>
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
            <Button onClick={handleNext}>Continue to Preview</Button>
          </div>
        </>
      )}

      {/* STEP 2: PREVIEW */}
      {activeStep === 1 && (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-semibold">Preview Your Creation</h2>
                <p className="text-sm text-muted-foreground">
                  This is how your image will appear to others on Craftique.
                </p>
                <div className="mx-auto max-w-md overflow-hidden rounded-lg border">
                  <div className="aspect-square relative">
                    {image ? (
                      <CustomImage src={image} alt="Creation preview" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/20 text-muted-foreground">
                        No image uploaded
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 text-left">
                  <div className="text-lg font-bold">{creationTitle}</div>
                  <div className="text-gray-600">{creationDescription}</div>
                  <div className="text-sm mt-2">Category: {selectedCategory}</div>
                  <div className="text-sm">Materials: {materialsUsed}</div>
                  <div className="text-sm">Dimensions: {hasDimensions ? (dimensions || "N/A") : "N/A"}</div>
                  {forSale && (
                    <div className="text-sm font-semibold text-green-700 mt-1">
                      Price: Rs {price}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back to Details
            </Button>
            <Button onClick={handleNext}>Continue to Update</Button>
          </div>
        </>
      )}

      {/* STEP 3: UPDATE */}
      {activeStep === 2 && (
        <>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Ready to Update</h2>
                <p className="text-sm text-muted-foreground">
                  Review your creation and click Update to save changes.
                </p>
                <div className="mx-auto max-w-md space-y-4 pt-4">
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>Details completed</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>Image uploaded</span>
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
            <Button variant="outline" onClick={handleBack}>
              Back to Preview
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Creation"
              )}
            </Button>
          </div>
        </>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Creation Updated Successfully!</DialogTitle>
            <DialogDescription>
              Your creation "{creationTitle || "Handcrafted Item"}" has been updated and is now visible to the
              Craftique community.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Check className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={resetForm}>
              Edit Another
            </Button>
            <Button onClick={() => navigate(`/craft/${creation_id}`)}>View Your Creation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}
