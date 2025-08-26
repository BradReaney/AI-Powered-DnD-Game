"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Play, Clock, User, Bot } from "lucide-react";
import type { Campaign, Character } from "@/lib/types";

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

interface SessionContinuityProps {
    campaign: Campaign;
    character: Character;
    onResumeSession: (sessionId: string) => void;
    onStartNewSession: () => void;
}

export function SessionContinuity({
    campaign,
    character,
    onResumeSession,
    onStartNewSession,
}: SessionContinuityProps) {
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchActiveSessions();
    }, [campaign.id]);

    const fetchActiveSessions = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/sessions/active?campaignId=${campaign.id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch active sessions');
            }

            const data = await response.json();
            setActiveSessions(data.activeSessions || []);
        } catch (err) {
            console.error('Error fetching active sessions:', err);
            setError('Failed to load active sessions');
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const messageTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    };

    const truncateMessage = (message: string, maxLength: number = 200) => {
        if (message.length <= maxLength) return message;
        return message.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading active sessions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={fetchActiveSessions} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-2">
                    {activeSessions.length > 0 ? 'Continue Your Adventure' : 'Begin Your Adventure'}
                </h2>
                <p className="text-muted-foreground mb-6">
                    {activeSessions.length > 0
                        ? `You have ${activeSessions.length} active session${activeSessions.length > 1 ? 's' : ''} to continue, or start a new adventure.`
                        : 'Choose your campaign and character to start playing with your AI Dungeon Master.'
                    }
                </p>
            </div>

            {activeSessions.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Active Sessions</h3>
                    {activeSessions.map((session) => (
                        <Card key={session.sessionId} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{session.name}</CardTitle>
                                        <CardDescription>{session.description}</CardDescription>
                                    </div>
                                    <Badge variant="secondary">{session.status}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>Last activity: {formatTimeAgo(session.lastMessageTime)}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MessageSquare className="h-4 w-4" />
                                        <span>{session.messageCount} message{session.messageCount !== 1 ? 's' : ''}</span>
                                    </div>

                                    {session.lastMessage && (
                                        <div className="bg-muted p-3 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                {session.lastMessageType === 'player' ? (
                                                    <User className="h-4 w-4 text-blue-600" />
                                                ) : (
                                                    <Bot className="h-4 w-4 text-green-600" />
                                                )}
                                                <span className="text-sm font-medium">
                                                    {session.lastMessageType === 'player' ? 'You' : 'Dungeon Master'}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimeAgo(session.lastMessageTime)}
                                                </span>
                                            </div>
                                            <p className="text-sm">{truncateMessage(session.lastMessage)}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            onClick={() => onResumeSession(session.sessionId)}
                                            className="flex-1"
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Resume Session
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="text-center pt-4">
                <Button
                    onClick={onStartNewSession}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                >
                    <Play className="h-5 w-5 mr-2" />
                    {activeSessions.length > 0 ? 'Start New Adventure' : 'Start Adventure'}
                </Button>
            </div>
        </div>
    );
}
