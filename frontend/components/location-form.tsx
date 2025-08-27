"use client";

import type React from "react";

import { useState } from "react";
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
import type { Location } from "@/lib/types";
import { Save, X, Plus, Loader2 } from "lucide-react";

interface LocationFormProps {
  location?: Location;
  onSave: (location: Partial<Location>) => void;
  onCancel: () => void;
  availableLocations?: Location[];
  campaignId?: string;
  sessionId?: string;
  isSaving?: boolean;
}

const LOCATION_TYPES = [
  {
    value: "settlement",
    label: "Settlement",
    description: "Towns, villages, and urban settlements",
  },
  {
    value: "dungeon",
    label: "Dungeon",
    description: "Caves, ruins, and underground complexes",
  },
  {
    value: "wilderness",
    label: "Wilderness",
    description: "Forests, mountains, and natural areas",
  },
  {
    value: "landmark",
    label: "Landmark",
    description: "Notable natural or constructed features",
  },
  {
    value: "shop",
    label: "Shop",
    description: "Merchant establishments and markets",
  },
  {
    value: "tavern",
    label: "Tavern",
    description: "Inns, pubs, and social gathering places",
  },
  {
    value: "temple",
    label: "Temple",
    description: "Religious buildings and sacred sites",
  },
  {
    value: "castle",
    label: "Castle",
    description: "Fortresses, palaces, and strongholds",
  },
  {
    value: "other",
    label: "Other",
    description: "Unique or special locations",
  },
];

export function LocationForm({
  location,
  onSave,
  onCancel,
  availableLocations = [],
  campaignId,
  sessionId,
  isSaving,
}: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: location?.name || "",
    type: location?.type || ("settlement" as const), // Fix: use "settlement" to match backend
    description: location?.description || "",
    inhabitants: location?.inhabitants || [],
    connections: location?.connections || [],
  });

  const [newInhabitant, setNewInhabitant] = useState("");
  const [selectedConnection, setSelectedConnection] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const locationData = {
      ...formData,
      campaignId,
      ...(sessionId && { sessionId }), // Only include sessionId if it's defined
      createdBy: "player", // Add the required createdBy field
    };

    onSave(locationData);
  };

  const addInhabitant = () => {
    if (newInhabitant.trim()) {
      setFormData({
        ...formData,
        inhabitants: [...formData.inhabitants, newInhabitant.trim()],
      });
      setNewInhabitant("");
    }
  };

  const removeInhabitant = (index: number) => {
    setFormData({
      ...formData,
      inhabitants: formData.inhabitants.filter((_, i) => i !== index),
    });
  };

  const addConnection = () => {
    if (
      selectedConnection &&
      !formData.connections.includes(selectedConnection)
    ) {
      setFormData({
        ...formData,
        connections: [...formData.connections, selectedConnection],
      });
      setSelectedConnection("");
    }
  };

  const removeConnection = (connectionId: string) => {
    setFormData({
      ...formData,
      connections: formData.connections.filter((id) => id !== connectionId),
    });
  };

  const getLocationName = (id: string) => {
    const loc = availableLocations.find((l) => l.id === id);
    return loc ? loc.name : "Unknown Location";
  };

  const availableConnections = availableLocations.filter(
    (loc) => loc.id !== location?.id && !formData.connections.includes(loc.id),
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {location ? "Edit Location" : "Create New Location"}
        </CardTitle>
        <CardDescription>
          {location
            ? "Update your location details"
            : "Build a new location for your world"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter location name..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Location Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose location type" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe this location..."
              rows={4}
              required
            />
          </div>

          {/* Inhabitants Section */}
          <div className="space-y-4">
            <Label>Inhabitants</Label>
            <div className="flex gap-2">
              <Input
                value={newInhabitant}
                onChange={(e) => setNewInhabitant(e.target.value)}
                placeholder="Add inhabitant name..."
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addInhabitant())
                }
              />
              <Button type="button" onClick={addInhabitant} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.inhabitants.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Current inhabitants:
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.inhabitants.map((inhabitant, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {inhabitant}
                      <button
                        type="button"
                        onClick={() => removeInhabitant(index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Connections Section */}
          <div className="space-y-4">
            <Label>Connected Locations</Label>
            {availableConnections.length > 0 && (
              <div className="flex gap-2">
                <Select
                  value={selectedConnection}
                  onValueChange={setSelectedConnection}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select location to connect..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableConnections.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name} ({loc.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={addConnection}
                  size="sm"
                  disabled={!selectedConnection}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            {formData.connections.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Connected to:
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.connections.map((connectionId) => (
                    <Badge
                      key={connectionId}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {getLocationName(connectionId)}
                      <button
                        type="button"
                        onClick={() => removeConnection(connectionId)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {location ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {location ? "Update Location" : "Create Location"}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
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
