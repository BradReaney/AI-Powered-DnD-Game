"use client";
import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import type { StoryArc } from "@/lib/types";

interface StoryArcFormProps {
  storyArc?: StoryArc;
  campaignId: string;
  onSave: (storyArc: Partial<StoryArc>) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function StoryArcForm({
  storyArc,
  campaignId,
  onSave,
  onCancel,
  isSaving = false,
}: StoryArcFormProps) {
  const [formData, setFormData] = useState({
    theme: storyArc?.theme || "",
    tone: storyArc?.tone || "serious",
    pacing: storyArc?.pacing || "normal",
    totalChapters: storyArc?.totalChapters || 5,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.theme.trim()) {
      newErrors.theme = "Theme is required";
    }

    if (formData.totalChapters < 1 || formData.totalChapters > 20) {
      newErrors.totalChapters = "Total chapters must be between 1 and 20";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave({
        ...formData,
        campaignId,
        storyPhase: "setup",
        currentChapter: 1,
        currentAct: 1,
        completedStoryBeats: 0,
        storyBeats: [],
        characterMilestones: [],
        worldStateChanges: [],
        questProgress: [],
      });
    } catch (error) {
      console.error("Error saving story arc:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <CardTitle>
              {storyArc ? "Edit Story Arc" : "Create Story Arc"}
            </CardTitle>
            <CardDescription>
              {storyArc
                ? "Update your story arc configuration"
                : "Set up the narrative structure for your campaign"
              }
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme *</Label>
              <Input
                id="theme"
                value={formData.theme}
                onChange={(e) => handleInputChange("theme", e.target.value)}
                placeholder="e.g., Redemption, Coming of Age, Good vs Evil"
                className={errors.theme ? "border-destructive" : ""}
              />
              {errors.theme && (
                <p className="text-sm text-destructive mt-1">{errors.theme}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => handleInputChange("tone", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="serious">Serious</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                    <SelectItem value="mysterious">Mysterious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="pacing">Pacing</Label>
                <Select
                  value={formData.pacing}
                  onValueChange={(value) => handleInputChange("pacing", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pacing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="fast">Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="totalChapters">Total Chapters</Label>
              <Input
                id="totalChapters"
                type="number"
                min="1"
                max="20"
                value={formData.totalChapters}
                onChange={(e) => handleInputChange("totalChapters", parseInt(e.target.value) || 1)}
                className={errors.totalChapters ? "border-destructive" : ""}
              />
              {errors.totalChapters && (
                <p className="text-sm text-destructive mt-1">{errors.totalChapters}</p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Recommended: 3-7 chapters for most campaigns
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : storyArc ? "Update Story Arc" : "Create Story Arc"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
