"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Location } from "@/lib/types";
import { ArrowLeft, Edit, MapPin, Users, Link } from "lucide-react";

interface LocationDetailProps {
  location: Location;
  onBack: () => void;
  onEdit: () => void;
  allLocations?: Location[];
}

const getLocationTypeIcon = (type: string) => {
  switch (type) {
    case "city":
      return "🏘️";
    case "dungeon":
      return "🏰";
    case "wilderness":
      return "🌲";
    case "building":
      return "🏢";
    default:
      return "📍";
  }
};

const getLocationTypeColor = (type: string) => {
  switch (type) {
    case "city":
      return "bg-blue-500";
    case "dungeon":
      return "bg-red-500";
    case "wilderness":
      return "bg-green-500";
    case "building":
      return "bg-yellow-500";
    default:
      return "bg-gray-500";
  }
};

export function LocationDetail({
  location,
  onBack,
  onEdit,
  allLocations = [],
}: LocationDetailProps) {
  const getConnectedLocationName = (id: string) => {
    const connectedLocation = allLocations.find((loc) => loc.id === id);
    return connectedLocation ? connectedLocation.name : "Unknown Location";
  };

  const getConnectedLocationType = (id: string) => {
    const connectedLocation = allLocations.find((loc) => loc.id === id);
    return connectedLocation ? connectedLocation.type : "unknown";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Locations
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`p-2 rounded-lg ${getLocationTypeColor(location.type)}`}
            >
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{location.name}</h1>
              <Badge variant="outline" className="capitalize">
                {getLocationTypeIcon(location.type)} {location.type}
              </Badge>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Location
        </Button>
      </div>

      {/* Location Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Location Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground">{location.description}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Location Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <Badge variant="outline" className="capitalize">
                      {location.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{location.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{location.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inhabitants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Inhabitants
            </CardTitle>
            <CardDescription>
              Notable people and creatures in this location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {location.inhabitants && location.inhabitants.length > 0 ? (
              <div className="space-y-2">
                {location.inhabitants.map((inhabitant, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-muted rounded"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{inhabitant}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                No inhabitants listed for this location.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Connected Locations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              Connected Locations
            </CardTitle>
            <CardDescription>
              Places accessible from this location
            </CardDescription>
          </CardHeader>
          <CardContent>
            {location.connections && location.connections.length > 0 ? (
              <div className="space-y-2">
                {location.connections.map((connectionId) => (
                  <div
                    key={connectionId}
                    className="flex items-center gap-2 p-2 bg-muted rounded"
                  >
                    <div
                      className={`p-1 rounded ${getLocationTypeColor(getConnectedLocationType(connectionId))}`}
                    >
                      <MapPin className="h-3 w-3 text-white" />
                    </div>
                    <span>{getConnectedLocationName(connectionId)}</span>
                    <Badge
                      variant="outline"
                      className="ml-auto capitalize text-xs"
                    >
                      {getConnectedLocationType(connectionId)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                This location has no connections to other places.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Adventure Hooks & Notes</CardTitle>
          <CardDescription>
            Ideas for adventures and important details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Adventure hooks and notes coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
