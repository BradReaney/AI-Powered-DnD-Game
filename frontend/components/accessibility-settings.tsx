"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Volume2,
  MousePointer,
  Type,
  Palette,
  ChevronDown,
  ChevronUp,
  Accessibility,
  Contrast,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

interface AccessibilitySettingsProps {
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

interface AccessibilitySettings {
  colorBlindSupport: boolean;
  colorBlindType:
    | "protanopia"
    | "deuteranopia"
    | "tritanopia"
    | "achromatopsia";
  highContrast: boolean;
  largeText: boolean;
  textSize: "small" | "medium" | "large" | "extra-large";
  soundEffects: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
  focusIndicators: boolean;
  keyboardNavigation: boolean;
}

export function AccessibilitySettings({
  onSettingsChange,
}: AccessibilitySettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    colorBlindSupport: false,
    colorBlindType: "deuteranopia",
    highContrast: false,
    largeText: false,
    textSize: "medium",
    soundEffects: true,
    screenReader: false,
    reducedMotion: false,
    focusIndicators: true,
    keyboardNavigation: true,
  });

  const applyAccessibilitySettings = useCallback(
    (newSettings: AccessibilitySettings) => {
      const root = document.documentElement;

      // Color blind support
      if (newSettings.colorBlindSupport) {
        root.style.setProperty(
          "--color-blind-filter",
          getColorBlindFilter(newSettings.colorBlindType),
        );
      } else {
        root.style.removeProperty("--color-blind-filter");
      }

      // High contrast
      if (newSettings.highContrast) {
        root.classList.add("high-contrast");
      } else {
        root.classList.remove("high-contrast");
      }

      // Large text
      if (newSettings.largeText) {
        root.classList.add("large-text");
      } else {
        root.classList.remove("large-text");
      }

      // Text size
      root.style.setProperty(
        "--text-size-multiplier",
        getTextSizeMultiplier(newSettings.textSize),
      );

      // Reduced motion
      if (newSettings.reducedMotion) {
        root.classList.add("reduced-motion");
      } else {
        root.classList.remove("reduced-motion");
      }

      // Focus indicators
      if (newSettings.focusIndicators) {
        root.classList.add("focus-visible");
      } else {
        root.classList.remove("focus-visible");
      }
    },
    [],
  );

  useEffect(() => {
    // Apply accessibility settings to the document
    applyAccessibilitySettings(settings);

    // Notify parent component of changes
    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange, applyAccessibilitySettings]);

  const getColorBlindFilter = (type: string) => {
    switch (type) {
      case "protanopia":
        return "url('#protanopia-filter')";
      case "deuteranopia":
        return "url('#deuteranopia-filter')";
      case "tritanopia":
        return "url('#tritanopia-filter')";
      case "achromatopsia":
        return "url('#achromatopsia-filter')";
      default:
        return "none";
    }
  };

  const getTextSizeMultiplier = (size: string) => {
    switch (size) {
      case "small":
        return "0.875";
      case "medium":
        return "1";
      case "large":
        return "1.125";
      case "extra-large":
        return "1.25";
      default:
        return "1";
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K],
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetToDefaults = () => {
    const defaultSettings: AccessibilitySettings = {
      colorBlindSupport: false,
      colorBlindType: "deuteranopia",
      highContrast: false,
      largeText: false,
      textSize: "medium",
      soundEffects: true,
      screenReader: false,
      reducedMotion: false,
      focusIndicators: true,
      keyboardNavigation: true,
    };
    setSettings(defaultSettings);
  };

  return (
    <>
      {/* SVG Filters for Color Blind Support */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567, 0.433, 0, 0, 0 0.558, 0.442, 0, 0, 0 0, 0.242, 0.758, 0, 0 0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625, 0.375, 0, 0, 0 0.7, 0.3, 0, 0, 0 0, 0.3, 0.7, 0, 0 0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95, 0.05, 0, 0, 0 0, 0.433, 0.567, 0, 0 0, 0.475, 0.525, 0, 0 0, 0, 0, 1, 0"
            />
          </filter>
          <filter id="achromatopsia-filter">
            <feColorMatrix
              type="matrix"
              values="0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0.299, 0.587, 0.114, 0, 0 0, 0, 0, 1, 0"
            />
          </filter>
        </defs>
      </svg>

      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Accessibility className="h-5 w-5" />
              Accessibility Settings
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-4">
              {/* Color Blind Support */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="color-blind" className="text-sm font-medium">
                    Color Blind Support
                  </Label>
                  <Switch
                    id="color-blind"
                    checked={settings.colorBlindSupport}
                    onCheckedChange={(checked) =>
                      updateSetting("colorBlindSupport", checked)
                    }
                  />
                </div>

                {settings.colorBlindSupport && (
                  <div className="pl-4 space-y-2">
                    <Label
                      htmlFor="color-blind-type"
                      className="text-xs text-muted-foreground"
                    >
                      Color Blind Type
                    </Label>
                    <Select
                      value={settings.colorBlindType}
                      onValueChange={(value: any) =>
                        updateSetting("colorBlindType", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="protanopia">
                          Protanopia (Red-Green)
                        </SelectItem>
                        <SelectItem value="deuteranopia">
                          Deuteranopia (Red-Green)
                        </SelectItem>
                        <SelectItem value="tritanopia">
                          Tritanopia (Blue-Yellow)
                        </SelectItem>
                        <SelectItem value="achromatopsia">
                          Achromatopsia (Complete)
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="text-xs text-muted-foreground">
                      Adjusts colors to be distinguishable for people with color
                      vision deficiencies
                    </div>
                  </div>
                )}
              </div>

              {/* High Contrast */}
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="text-sm font-medium">
                  High Contrast Mode
                </Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) =>
                    updateSetting("highContrast", checked)
                  }
                />
              </div>

              {/* Large Text */}
              <div className="flex items-center justify-between">
                <Label htmlFor="large-text" className="text-sm font-medium">
                  Large Text
                </Label>
                <Switch
                  id="large-text"
                  checked={settings.largeText}
                  onCheckedChange={(checked) =>
                    updateSetting("largeText", checked)
                  }
                />
              </div>

              {/* Text Size */}
              <div className="space-y-2">
                <Label htmlFor="text-size" className="text-sm font-medium">
                  Text Size
                </Label>
                <Select
                  value={settings.textSize}
                  onValueChange={(value: any) =>
                    updateSetting("textSize", value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra-large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sound Effects */}
              <div className="flex items-center justify-between">
                <Label htmlFor="sound-effects" className="text-sm font-medium">
                  Sound Effects
                </Label>
                <Switch
                  id="sound-effects"
                  checked={settings.soundEffects}
                  onCheckedChange={(checked) =>
                    updateSetting("soundEffects", checked)
                  }
                />
              </div>

              {/* Screen Reader */}
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader" className="text-sm font-medium">
                  Screen Reader Support
                </Label>
                <Switch
                  id="screen-reader"
                  checked={settings.screenReader}
                  onCheckedChange={(checked) =>
                    updateSetting("screenReader", checked)
                  }
                />
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion" className="text-sm font-medium">
                  Reduced Motion
                </Label>
                <Switch
                  id="reduced-motion"
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) =>
                    updateSetting("reducedMotion", checked)
                  }
                />
              </div>

              {/* Focus Indicators */}
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="focus-indicators"
                  className="text-sm font-medium"
                >
                  Focus Indicators
                </Label>
                <Switch
                  id="focus-indicators"
                  checked={settings.focusIndicators}
                  onCheckedChange={(checked) =>
                    updateSetting("focusIndicators", checked)
                  }
                />
              </div>

              {/* Keyboard Navigation */}
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard-nav" className="text-sm font-medium">
                  Keyboard Navigation
                </Label>
                <Switch
                  id="keyboard-nav"
                  checked={settings.keyboardNavigation}
                  onCheckedChange={(checked) =>
                    updateSetting("keyboardNavigation", checked)
                  }
                />
              </div>

              {/* Reset Button */}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDefaults}
                  className="w-full text-xs"
                >
                  Reset to Defaults
                </Button>
              </div>

              {/* Accessibility Info */}
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">
                  Accessibility Features
                </h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Color blind support with customizable filters</div>
                  <div>• High contrast mode for better visibility</div>
                  <div>• Adjustable text sizes</div>
                  <div>• Keyboard navigation support</div>
                  <div>• Focus indicators for navigation</div>
                  <div>• Reduced motion for motion sensitivity</div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </>
  );
}
