"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Campaign } from "@/lib/types"
import { Save, X } from "lucide-react"

interface CampaignFormProps {
  campaign?: Campaign
  onSave: (campaign: Partial<Campaign>) => void
  onCancel: () => void
}

const CAMPAIGN_SETTINGS = [
  "Forgotten Realms",
  "Eberron",
  "Ravenloft",
  "Greyhawk",
  "Dragonlance",
  "Dark Sun",
  "Planescape",
  "Custom Setting",
]

export function CampaignForm({ campaign, onSave, onCancel }: CampaignFormProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name || "",
    description: campaign?.description || "",
    setting: campaign?.setting || "",
    isActive: campaign?.isActive ?? true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      id: campaign?.id || crypto.randomUUID(),
      createdAt: campaign?.createdAt || new Date(),
      updatedAt: new Date(),
    })
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{campaign ? "Edit Campaign" : "Create New Campaign"}</CardTitle>
        <CardDescription>{campaign ? "Update your campaign details" : "Set up a new D&D adventure"}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter campaign name..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your campaign..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="setting">Campaign Setting</Label>
            <Select value={formData.setting} onValueChange={(value) => setFormData({ ...formData, setting: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign setting..." />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_SETTINGS.map((setting) => (
                  <SelectItem key={setting} value={setting}>
                    {setting}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-border"
            />
            <Label htmlFor="isActive">Active Campaign</Label>
            <Badge variant={formData.isActive ? "default" : "secondary"}>
              {formData.isActive ? "Active" : "Inactive"}
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
  )
}
