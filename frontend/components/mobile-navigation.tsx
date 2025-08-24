"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  MapPin,
  BookOpen,
  Settings,
  Menu,
  X,
  ChevronUp,
} from "lucide-react";
import type { Character, Location, Campaign } from "@/lib/types";

interface MobileNavigationProps {
  character: Character;
  currentLocation?: Location;
  campaign: Campaign;
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function MobileNavigation({
  character,
  currentLocation,
  campaign,
  onNavigate,
  currentSection,
}: MobileNavigationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const navigationItems = [
    {
      id: "home",
      label: "Game",
      icon: Home,
      active: currentSection === "home",
    },
    {
      id: "characters",
      label: "Character",
      icon: Users,
      active: currentSection === "characters",
    },
    {
      id: "locations",
      label: "World",
      icon: MapPin,
      active: currentSection === "locations",
    },
    {
      id: "campaigns",
      label: "Campaign",
      icon: BookOpen,
      active: currentSection === "campaigns",
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      active: currentSection === "settings",
    },
  ];

  const quickActions = [
    {
      id: "dice",
      label: "Roll Dice",
      icon: "🎲",
      action: () => onNavigate("dice"),
    },
    {
      id: "inventory",
      label: "Inventory",
      icon: "🎒",
      action: () => onNavigate("inventory"),
    },
    {
      id: "spells",
      label: "Spells",
      icon: "✨",
      action: () => onNavigate("spells"),
    },
    {
      id: "notes",
      label: "Notes",
      icon: "📝",
      action: () => onNavigate("notes"),
    },
  ];

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={item.active ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 h-16 px-2 py-1 rounded-lg"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
                {item.active && (
                  <div className="w-1 h-1 bg-primary rounded-full" />
                )}
              </Button>
            );
          })}

          {/* Quick Actions Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="flex flex-col items-center gap-1 h-16 px-2 py-1 rounded-lg"
          >
            <Menu className="h-5 w-5" />
            <span className="text-xs">More</span>
          </Button>
        </div>
      </div>

      {/* Quick Actions Panel */}
      {showQuickActions && (
        <div className="fixed bottom-20 left-4 right-4 bg-background border border-border rounded-lg shadow-lg z-40 md:hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Quick Actions</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQuickActions(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    action.action();
                    setShowQuickActions(false);
                  }}
                  className="h-12 flex flex-col items-center gap-1"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Character Status Bar */}
      <div className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-40 md:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{character.name}</span>
              <span className="text-xs text-muted-foreground">
                Level {character.level} {character.race} {character.class}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* HP Display */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-xs font-medium">
                {character.hitPoints.current}/{character.hitPoints.maximum}
              </span>
            </div>

            {/* AC Display */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs font-medium">
                {character.armorClass}
              </span>
            </div>

            {/* Location Badge */}
            {currentLocation && (
              <Badge variant="outline" className="text-xs">
                {currentLocation.name}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Game Info Panel */}
      <div className="fixed top-16 right-4 z-30 md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 w-8 p-0 rounded-full shadow-lg"
        >
          <ChevronUp
            className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </Button>
      </div>

      {isExpanded && (
        <div className="fixed top-24 right-4 bg-background border border-border rounded-lg shadow-lg z-30 md:hidden w-64">
          <div className="p-3">
            <h4 className="text-sm font-medium mb-2">Campaign Info</h4>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium">Campaign:</span> {campaign.name}
              </div>
              <div>
                <span className="font-medium">Setting:</span> {campaign.setting}
              </div>
              <div>
                <span className="font-medium">Theme:</span> {campaign.theme}
              </div>
              <div>
                <span className="font-medium">Difficulty:</span>{" "}
                {campaign.difficulty}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t">
              <h5 className="text-xs font-medium mb-1">Character Stats</h5>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>STR: {character.stats.strength}</div>
                <div>DEX: {character.stats.dexterity}</div>
                <div>CON: {character.stats.constitution}</div>
                <div>INT: {character.stats.intelligence}</div>
                <div>WIS: {character.stats.wisdom}</div>
                <div>CHA: {character.stats.charisma}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Spacing for Mobile */}
      <div className="h-20 md:hidden" />
    </>
  );
}
