"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Campaign } from "@/lib/types";
import { Save, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = "force-dynamic";

interface CampaignFormProps {
  campaign?: Campaign;
  onSave: (campaign: Partial<Campaign>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const CAMPAIGN_SETTINGS = [
  { value: "fantasy", label: "Fantasy" },
  { value: "sci-fi", label: "Sci-Fi" },
  { value: "horror", label: "Horror" },
  { value: "mystery", label: "Mystery" },
  { value: "western", label: "Western" },
  { value: "cyberpunk", label: "Cyberpunk" },
  { value: "steampunk", label: "Steampunk" },
  { value: "post-apocalyptic", label: "Post-Apocalyptic" },
  { value: "medieval", label: "Medieval" },
  { value: "modern", label: "Modern" },
  { value: "futuristic", label: "Futuristic" },
  { value: "space", label: "Space" },
  { value: "underwater", label: "Underwater" },
  { value: "desert", label: "Desert" },
  { value: "arctic", label: "Arctic" },
  { value: "tropical", label: "Tropical" },
];

export function CampaignForm({
  campaign,
  onSave,
  onCancel,
  isSaving: externalIsSaving,
}: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    theme: campaign?.theme || "",
    status: campaign?.status ?? "active",
    createdBy: "player", // Default user ID for now
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  // Use external loading state if provided, otherwise use internal state
  const isCurrentlySaving =
    externalIsSaving !== undefined ? externalIsSaving : isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If external loading state is provided, don't manage internal state
    if (externalIsSaving !== undefined) {
      onSave({
        ...formData,
        id: campaign?.id,
        createdAt: campaign?.createdAt,
        updatedAt: new Date(),
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus("idle");
      setSubmitMessage("");

      await onSave({
        ...formData,
        id: campaign?.id,
        createdAt: campaign?.createdAt,
        updatedAt: new Date(),
      });

      setSubmitStatus("success");
      setSubmitMessage(
        campaign
          ? "Campaign updated successfully!"
          : "Campaign created successfully!",
      );

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
        setSubmitMessage("");
      }, 3000);
    } catch (error) {
      setSubmitStatus("error");
      setSubmitMessage(
        error instanceof Error ? error.message : "Failed to save campaign",
      );

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("error");
        setSubmitMessage("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {campaign ? "Edit Campaign" : "Create New Campaign"}
        </CardTitle>
        <CardDescription>
          {campaign
            ? "Update your campaign details"
            : "Set up a new D&D adventure"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Status Messages */}
        {submitStatus === "success" && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {submitMessage}
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === "error" && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {submitMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter campaign name..."
              required
              disabled={isCurrentlySaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your campaign..."
              rows={4}
              required
              disabled={isCurrentlySaving}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Campaign Theme</Label>
            <Select
              value={formData.theme}
              onValueChange={(value) =>
                setFormData({ ...formData, theme: value })
              }
              required
              disabled={isCurrentlySaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign theme..." />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_SETTINGS.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="status"
              checked={formData.status === "active"}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.checked ? "active" : "paused",
                })
              }
              className="rounded border-border"
              disabled={isCurrentlySaving}
            />
            <Label htmlFor="status">Active Campaign</Label>
            <Badge
              variant={formData.status === "active" ? "default" : "secondary"}
            >
              {formData.status === "active" ? "Active" : "Paused"}
            </Badge>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={isCurrentlySaving}
            >
              {isCurrentlySaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {campaign ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {campaign ? "Update Campaign" : "Create Campaign"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCurrentlySaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
