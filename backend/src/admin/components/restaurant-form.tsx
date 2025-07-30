import { Button, Input, Label, Switch, Textarea, toast } from "@medusajs/ui";
import { useState } from "react";
import { RestaurantDTO } from "../../modules";

interface RestaurantFormProps {
  restaurant?: RestaurantDTO;
  onSubmit: (data: {
    name: string;
    handle: string;
    description?: string;
    is_open?: boolean;
    phone?: string;
    email?: string;
    address?: string;
    image_url?: string;
  }) => Promise<void>;
  loading?: boolean;
  submitButtonText?: string;
}

const RestaurantForm = ({
  restaurant,
  onSubmit,
  loading = false,
  submitButtonText = "Save Restaurant",
}: RestaurantFormProps) => {
  const [formData, setFormData] = useState({
    name: restaurant?.name || "",
    handle: restaurant?.handle || "",
    description: restaurant?.description || "",
    is_open: restaurant?.is_open ?? true,
    phone: restaurant?.phone || "",
    email: restaurant?.email || "",
    address: restaurant?.address || "",
    image_url: restaurant?.image_url || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Restaurant name is required";
    }

    if (!formData.handle.trim()) {
      newErrors.handle = "Restaurant handle is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.handle)) {
      newErrors.handle = "Handle can only contain lowercase letters, numbers, and hyphens";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save restaurant");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            Restaurant Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter restaurant name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="handle">
            Handle <span className="text-red-500">*</span>
          </Label>
          <Input
            id="handle"
            type="text"
            value={formData.handle}
            onChange={(e) => handleInputChange("handle", e.target.value.toLowerCase())}
            placeholder="restaurant-handle"
            className={errors.handle ? "border-red-500" : ""}
          />
          {errors.handle && <p className="text-sm text-red-500">{errors.handle}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="restaurant@example.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            placeholder="123 Main Street, City, State, Country"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            type="url"
            value={formData.image_url}
            onChange={(e) => handleInputChange("image_url", e.target.value)}
            placeholder="https://example.com/restaurant-image.jpg"
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your restaurant..."
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-3 sm:col-span-2">
          <Switch
            id="is_open"
            checked={formData.is_open}
            onCheckedChange={(checked) => handleInputChange("is_open", checked)}
          />
          <Label htmlFor="is_open" className="cursor-pointer">
            Restaurant is open
          </Label>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t sm:pt-6">
        <Button type="submit" variant="primary" disabled={loading} size="base">
          {loading ? "Saving..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default RestaurantForm;
