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
import type { Campaign } from "@/lib/types";
import { Save, X } from "lucide-react";

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic';

interface CampaignFormProps {
  campaign?: Campaign;
  onSave: (campaign: Partial<Campaign>) => void;
  onCancel: () => void;
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
}: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    theme: campaign?.theme || "",
    status: campaign?.status ?? 'active',
    createdBy: "player", // Default user ID for now
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: campaign?.id,
      createdAt: campaign?.createdAt,
      updatedAt: new Date(),
    });
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
              checked={formData.status === 'active'}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.checked ? 'active' : 'paused' })
              }
              className="rounded border-border"
            />
            <Label htmlFor="status">Active Campaign</Label>
            <Badge variant={formData.status === 'active' ? "default" : "secondary"}>
              {formData.status === 'active' ? "Active" : "Paused"}
            </Badge>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {campaign ? "Update Campaign" : "Create Campaign"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
