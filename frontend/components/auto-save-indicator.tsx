"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Save,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Download,
  Upload,
} from "lucide-react";

interface AutoSaveIndicatorProps {
  onSave?: () => Promise<void>;
  onLoad?: () => Promise<void>;
  autoSaveInterval?: number; // in milliseconds
  lastSaved?: Date;
  hasUnsavedChanges?: boolean;
}

interface SaveStatus {
  status: "saved" | "saving" | "error" | "unsaved";
  message: string;
  timestamp: Date;
}

export function AutoSaveIndicator({
  onSave,
  onLoad,
  autoSaveInterval = 30000, // 30 seconds
  lastSaved,
  hasUnsavedChanges = false,
}: AutoSaveIndicatorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({
    status: "saved",
    message: "All changes saved",
    timestamp: lastSaved || new Date(),
  });
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date>(
    lastSaved || new Date(),
  );

  // Auto-save effect
  useEffect(() => {
    if (!onSave || !hasUnsavedChanges) return;

    const interval = setInterval(async () => {
      if (hasUnsavedChanges && !isAutoSaving) {
        await performAutoSave();
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [
    onSave,
    hasUnsavedChanges,
    isAutoSaving,
    autoSaveInterval,
    performAutoSave,
  ]);

  // Update status when hasUnsavedChanges changes
  useEffect(() => {
    if (hasUnsavedChanges && saveStatus.status === "saved") {
      setSaveStatus({
        status: "unsaved",
        message: "You have unsaved changes",
        timestamp: new Date(),
      });
    }
  }, [hasUnsavedChanges, saveStatus.status]);

  const performAutoSave = useCallback(async () => {
    if (!onSave) return;

    setIsAutoSaving(true);
    setSaveStatus({
      status: "saving",
      message: "Auto-saving...",
      timestamp: new Date(),
    });

    try {
      await onSave();
      setSaveStatus({
        status: "saved",
        message: "Auto-saved successfully",
        timestamp: new Date(),
      });
      setLastAutoSave(new Date());
    } catch (error) {
      setSaveStatus({
        status: "error",
        message: "Auto-save failed",
        timestamp: new Date(),
      });
    } finally {
      setIsAutoSaving(false);
    }
  }, [onSave]);

  const performManualSave = async () => {
    if (!onSave) return;

    setSaveStatus({
      status: "saving",
      message: "Saving...",
      timestamp: new Date(),
    });

    try {
      await onSave();
      setSaveStatus({
        status: "saved",
        message: "Saved successfully",
        timestamp: new Date(),
      });
      setLastAutoSave(new Date());
    } catch (error) {
      setSaveStatus({
        status: "error",
        message: "Save failed",
        timestamp: new Date(),
      });
    }
  };

  const performLoad = async () => {
    if (!onLoad) return;

    setSaveStatus({
      status: "saving",
      message: "Loading...",
      timestamp: new Date(),
    });

    try {
      await onLoad();
      setSaveStatus({
        status: "saved",
        message: "Loaded successfully",
        timestamp: new Date(),
      });
    } catch (error) {
      setSaveStatus({
        status: "error",
        message: "Load failed",
        timestamp: new Date(),
      });
    }
  };

  const getStatusIcon = () => {
    switch (saveStatus.status) {
      case "saved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "saving":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "unsaved":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (saveStatus.status) {
      case "saved":
        return "bg-green-100 text-green-800 border-green-200";
      case "saving":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "unsaved":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatTimeSince = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const formatTimeUntilNextAutoSave = () => {
    if (!hasUnsavedChanges || !isAutoSaving) return null;

    const now = new Date();
    const timeSinceLastSave = now.getTime() - lastAutoSave.getTime();
    const timeUntilNext = Math.max(0, autoSaveInterval - timeSinceLastSave);
    const seconds = Math.ceil(timeUntilNext / 1000);

    if (seconds <= 0) return "Auto-saving now...";
    return `Auto-save in ${seconds}s`;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Badge */}
      <Badge variant="outline" className={`text-xs ${getStatusColor()}`}>
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span>{saveStatus.message}</span>
        </div>
      </Badge>

      {/* Last Saved Time */}
      {saveStatus.status === "saved" && (
        <span className="text-xs text-muted-foreground">
          Last saved: {formatTimeSince(saveStatus.timestamp)}
        </span>
      )}

      {/* Auto-save Countdown */}
      {formatTimeUntilNextAutoSave() && (
        <span className="text-xs text-muted-foreground">
          {formatTimeUntilNextAutoSave()}
        </span>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-1">
        {onSave && (
          <Button
            variant="outline"
            size="sm"
            onClick={performManualSave}
            disabled={saveStatus.status === "saving" || !hasUnsavedChanges}
            className="h-6 px-2 text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
        )}

        {onLoad && (
          <Button
            variant="outline"
            size="sm"
            onClick={performLoad}
            disabled={saveStatus.status === "saving"}
            className="h-6 px-2 text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            Load
          </Button>
        )}

        {onSave && hasUnsavedChanges && (
          <Button
            variant="ghost"
            size="sm"
            onClick={performAutoSave}
            disabled={isAutoSaving}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw
              className={`h-3 w-3 ${isAutoSaving ? "animate-spin" : ""}`}
            />
            {isAutoSaving ? "Saving..." : "Auto-save"}
          </Button>
        )}
      </div>

      {/* Progress Indicator for Auto-save */}
      {isAutoSaving && (
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
      )}
    </div>
  );
}
