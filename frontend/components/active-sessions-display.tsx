"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Play, Clock, User, Bot } from "lucide-react";
import type { Campaign } from "@/lib/types";

interface ActiveSession {
  sessionId: string;
  campaignId: string;
  name: string;
  description: string;
  status: string;
  lastMessageTime: string;
  messageCount: number;
  lastMessage: string;
  lastMessageType: string;
}

interface ActiveSessionsDisplayProps {
  campaign: Campaign;
  characters: any[]; // Add characters prop
  onResumeSession: (
    sessionId: string,
    campaign: Campaign,
    character: any,
  ) => void; // Update signature
}

export default function ActiveSessionsDisplay({
  campaign,
  characters,
  onResumeSession,
}: ActiveSessionsDisplayProps) {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find a character for this campaign
  const campaignCharacter = characters.find(
    (char) => char.campaignId === campaign.id,
  );

  const fetchActiveSessions = useCallback(async () => {
    if (!campaign?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/sessions/active?campaignId=${campaign.id}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch active sessions");
      }
      const data = await response.json();
      setActiveSessions(data.activeSessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [campaign?.id]);

  useEffect(() => {
    fetchActiveSessions();
  }, [fetchActiveSessions]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - messageTime.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{campaign.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading sessions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{campaign.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-sm text-destructive mb-2">{error}</p>
            <Button onClick={fetchActiveSessions} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{campaign.name}</CardTitle>
        <CardDescription>{campaign.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {activeSessions.length > 0 ? (
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div
                key={session.sessionId}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{session.name}</h4>
                    <Badge
                      variant={
                        session.status === "active" ? "default" : "secondary"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {session.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(session.lastMessageTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {session.messageCount} messages
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    onResumeSession(
                      session.sessionId,
                      campaign,
                      campaignCharacter || characters[0],
                    )
                  }
                  size="sm"
                  className="ml-4"
                  disabled={!campaignCharacter && characters.length === 0}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Continue
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No active sessions for this campaign
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a new session from the campaign management to start playing
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
