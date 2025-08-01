import { Button, Input, Label, Select, Switch, Text, toast } from "@medusajs/ui";
import { useState } from "react";
import { RoleDTO, ScopeType } from "../../modules/rbac/types/common";

interface RoleFormProps {
  role?: RoleDTO;
  onSubmit: (data: {
    name: string;
    slug: string;
    description?: string | null;
    scope_type: ScopeType;
    scope_id?: string | null;
    is_global: boolean;
  }) => Promise<void>;
  loading?: boolean;
  submitButtonText?: string;
}

const RoleForm = ({ role, onSubmit, loading = false, submitButtonText = "Save Role" }: RoleFormProps) => {
  const [formData, setFormData] = useState({
    name: role?.name || "",
    slug: role?.slug || "",
    description: role?.description || "",
    scope_type: role?.scope_type || ScopeType.CLIENT,
    scope_id: role?.scope_id || "",
    is_global: role?.is_global || false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    if (!formData.slug) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug must contain only lowercase letters, numbers, and hyphens";
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
      toast.error("Failed to save role");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          placeholder="Enter role name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className={errors.name ? "border-ui-error" : ""}
        />
        {errors.name && <Text className="text-ui-fg-error text-xs">{errors.name}</Text>}
      </div>

      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          placeholder="Enter role slug"
          value={formData.slug}
          onChange={(e) => handleInputChange("slug", e.target.value)}
          className={errors.slug ? "border-ui-error" : ""}
        />
        {errors.slug && <Text className="text-ui-fg-error text-xs">{errors.slug}</Text>}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Enter role description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
        />
      </div>

      <div>
        <Label>Scope Type</Label>
        <Select value={formData.scope_type} onValueChange={(value) => handleInputChange("scope_type", value)}>
          <Select.Trigger>
            <Select.Value placeholder="Select scope type" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={ScopeType.GLOBAL}>Global</Select.Item>
            <Select.Item value={ScopeType.CLIENT}>Client</Select.Item>
          </Select.Content>
        </Select>
      </div>

      {formData.scope_type === ScopeType.CLIENT && (
        <div>
          <Label htmlFor="scope_id">Client ID</Label>
          <Input
            id="scope_id"
            placeholder="Enter client ID"
            value={formData.scope_id}
            onChange={(e) => handleInputChange("scope_id", e.target.value)}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <Switch checked={formData.is_global} onCheckedChange={(checked) => handleInputChange("is_global", checked)} />
        <Label>Global Access</Label>
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default RoleForm;
