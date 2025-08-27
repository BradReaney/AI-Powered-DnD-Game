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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Character } from "@/lib/types";
import { Save, X, Dice6, Loader2 } from "lucide-react";
import type { Campaign } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface CharacterFormProps {
  character?: Character;
  onSave: (character: Partial<Character>) => void;
  onCancel: () => void;
  campaignId?: string;
  sessionId?: string;
  isSaving?: boolean;
  campaigns?: Campaign[]; // Add campaigns prop for selection
}

const RACES = [
  "Human",
  "Elf",
  "Dwarf",
  "Halfling",
  "Dragonborn",
  "Gnome",
  "Half-Elf",
  "Half-Orc",
  "Tiefling",
  "Aasimar",
  "Genasi",
  "Goliath",
  "Tabaxi",
];

const CLASSES = [
  "Barbarian",
  "Bard",
  "Cleric",
  "Druid",
  "Fighter",
  "Monk",
  "Paladin",
  "Ranger",
  "Rogue",
  "Sorcerer",
  "Warlock",
  "Wizard",
  "Artificer",
];

const BACKGROUNDS = [
  "Acolyte",
  "Criminal",
  "Folk Hero",
  "Noble",
  "Sage",
  "Soldier",
  "Charlatan",
  "Entertainer",
  "Guild Artisan",
  "Hermit",
  "Outlander",
  "Sailor",
];

const ALIGNMENTS = [
  "Lawful Good",
  "Neutral Good",
  "Chaotic Good",
  "Lawful Neutral",
  "True Neutral",
  "Chaotic Neutral",
  "Lawful Evil",
  "Neutral Evil",
  "Chaotic Evil",
];

const SKILLS = [
  "Acrobatics",
  "Animal Handling",
  "Arcana",
  "Athletics",
  "Deception",
  "History",
  "Insight",
  "Intimidation",
  "Investigation",
  "Medicine",
  "Nature",
  "Perception",
  "Performance",
  "Persuasion",
  "Religion",
  "Sleight of Hand",
  "Stealth",
  "Survival",
];

export function CharacterForm({
  character,
  onSave,
  onCancel,
  campaignId,
  sessionId,
  isSaving,
  campaigns,
}: CharacterFormProps) {
  const [formData, setFormData] = useState({
    name: character?.name || "",
    race: character?.race || "",
    class: character?.class || "",
    level: character?.level || 1,
    background: character?.background || "",
    alignment: character?.alignment || "",
    currentLocation: character?.currentLocation || "",
    hitPoints: {
      current: character?.hitPoints?.current || 8,
      maximum: character?.hitPoints?.maximum || 8,
    },
    armorClass: character?.armorClass || 10,
    attributes: character?.attributes || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    skills: character?.skills || [],
    traits: character?.personality?.traits || [],
    ideals: character?.personality?.ideals || [],
    bonds: character?.personality?.bonds || [],
    flaws: character?.personality?.flaws || [],
    equipment: character?.equipment || [],
    spells: character?.spells || [], // Add missing spells field
    backstory: character?.backstory || "",
  });

  // Add state for campaign selection when no campaignId is provided
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaignId || "",
  );
  const [showCampaignSelector, setShowCampaignSelector] = useState<boolean>(
    !campaignId && !!campaigns?.length,
  );

  const rollStats = () => {
    const rollStat = () => {
      const rolls = Array.from(
        { length: 4 },
        () => Math.floor(Math.random() * 6) + 1,
      );
      rolls.sort((a, b) => b - a);
      return rolls.slice(0, 3).reduce((sum, roll) => sum + roll, 0);
    };

    setFormData({
      ...formData,
      attributes: {
        strength: rollStat(),
        dexterity: rollStat(),
        constitution: rollStat(),
        intelligence: rollStat(),
        wisdom: rollStat(),
        charisma: rollStat(),
      },
    });
  };

  const getModifier = (score: number) => Math.floor((score - 10) / 2);

  const handleSkillToggle = (skill: string) => {
    const newSkills = formData.skills.includes(skill)
      ? formData.skills.filter((s) => s !== skill)
      : [...formData.skills, skill];
    setFormData({ ...formData, skills: newSkills });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that a campaign is selected
    if (!selectedCampaignId) {
      alert("Please select a campaign for your character");
      return;
    }

    // Transform the data to match backend API structure
    const characterData = {
      ...formData,
      id: character?.id || crypto.randomUUID(),
      createdAt: character?.createdAt || new Date(),
      updatedAt: new Date(),
      // Add required fields for backend
      campaignId: selectedCampaignId, // Use selected campaign ID
      sessionId: sessionId || "",
      createdBy: "user", // Default value
      // Transform stats to attributes
      attributes: formData.attributes,
      // Create personality object
      personality: {
        traits: formData.traits,
        ideals: formData.ideals,
        bonds: formData.bonds,
        flaws: formData.flaws,
        background: formData.background,
        alignment: formData.alignment,
      },
    };

    onSave(characterData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {character ? "Edit Character" : "Create New Character"}
        </CardTitle>
        <CardDescription>
          {character
            ? "Update your character details"
            : "Build your D&D character"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Selector - Show when no campaignId is provided */}
          {showCampaignSelector && campaigns && campaigns.length > 0 && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label htmlFor="campaign">Select Campaign</Label>
                <Select
                  value={selectedCampaignId}
                  onValueChange={setSelectedCampaignId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a campaign for your character" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        <div className="flex items-center gap-2">
                          <span>{campaign.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {campaign.theme || "Custom"}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Your character will be created in the selected campaign world.
                </p>
              </div>
            </div>
          )}

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="stats">Stats & Skills</TabsTrigger>
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="equipment">Equipment</TabsTrigger>
              <TabsTrigger value="backstory">Backstory</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Character Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter character name..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.level}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        level: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="race">Race</Label>
                  <Select
                    value={formData.race}
                    onValueChange={(value) =>
                      setFormData({ ...formData, race: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select race..." />
                    </SelectTrigger>
                    <SelectContent>
                      {RACES.map((race) => (
                        <SelectItem key={race} value={race}>
                          {race}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Select
                    value={formData.class}
                    onValueChange={(value) =>
                      setFormData({ ...formData, class: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((cls) => (
                        <SelectItem key={cls} value={cls}>
                          {cls}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="background">Background</Label>
                  <Select
                    value={formData.background}
                    onValueChange={(value) =>
                      setFormData({ ...formData, background: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select background..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BACKGROUNDS.map((bg) => (
                        <SelectItem key={bg} value={bg}>
                          {bg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alignment">Alignment</Label>
                  <Select
                    value={formData.alignment}
                    onValueChange={(value) =>
                      setFormData({ ...formData, alignment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select alignment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALIGNMENTS.map((alignment) => (
                        <SelectItem key={alignment} value={alignment}>
                          {alignment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentLocation">Current Location</Label>
                <Input
                  id="currentLocation"
                  value={formData.currentLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      currentLocation: e.target.value,
                    })
                  }
                  placeholder="Where is your character currently located?"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="hp-current">Current HP</Label>
                  <Input
                    id="hp-current"
                    type="number"
                    min="0"
                    value={formData.hitPoints.current}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hitPoints: {
                          ...formData.hitPoints,
                          current: Number.parseInt(e.target.value) || 0,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hp-max">Maximum HP</Label>
                  <Input
                    id="hp-max"
                    type="number"
                    min="1"
                    value={formData.hitPoints.maximum}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hitPoints: {
                          ...formData.hitPoints,
                          maximum: Number.parseInt(e.target.value) || 1,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ac">Armor Class</Label>
                  <Input
                    id="ac"
                    type="number"
                    min="1"
                    value={formData.armorClass}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        armorClass: Number.parseInt(e.target.value) || 10,
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Stats & Skills Tab */}
            <TabsContent value="stats" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Ability Scores</h3>
                <Button type="button" variant="outline" onClick={rollStats}>
                  <Dice6 className="h-4 w-4 mr-2" />
                  Roll Stats
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(formData.attributes).map(([stat, value]) => (
                  <div key={stat} className="space-y-2">
                    <Label htmlFor={stat} className="capitalize">
                      {stat}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={stat}
                        type="number"
                        min="1"
                        max="20"
                        value={value as number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            attributes: {
                              ...formData.attributes,
                              [stat]: Number.parseInt(e.target.value) || 10,
                            },
                          })
                        }
                        className="flex-1"
                      />
                      <div className="w-16 flex items-center justify-center bg-muted rounded-md text-sm font-medium">
                        {getModifier(value as number) >= 0 ? "+" : ""}
                        {getModifier(value as number)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills</h3>
                <div className="grid gap-2 md:grid-cols-3">
                  {SKILLS.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={skill}
                        checked={formData.skills.includes(skill)}
                        onChange={() => handleSkillToggle(skill)}
                        className="rounded border-border"
                      />
                      <Label htmlFor={skill} className="text-sm">
                        {skill}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="traits">Traits</Label>
                  <Textarea
                    id="traits"
                    value={formData.traits}
                    onChange={(e) =>
                      setFormData({ ...formData, traits: e.target.value.split(',').map(t => t.trim()).filter(t => t) })
                    }
                    placeholder="Describe your character's personality traits..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ideals">Ideals</Label>
                  <Textarea
                    id="ideals"
                    value={formData.ideals}
                    onChange={(e) =>
                      setFormData({ ...formData, ideals: e.target.value.split(',').map(t => t.trim()).filter(t => t) })
                    }
                    placeholder="What ideals drive your character?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonds">Bonds</Label>
                  <Textarea
                    id="bonds"
                    value={formData.bonds}
                    onChange={(e) =>
                      setFormData({ ...formData, bonds: e.target.value.split(',').map(t => t.trim()).filter(t => t) })
                    }
                    placeholder="What bonds connect your character to the world?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="flaws">Flaws</Label>
                  <Textarea
                    id="flaws"
                    value={formData.flaws}
                    onChange={(e) =>
                      setFormData({ ...formData, flaws: e.target.value.split(',').map(t => t.trim()).filter(t => t) })
                    }
                    placeholder="What flaws or weaknesses does your character have?"
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Equipment Tab */}
            <TabsContent value="equipment" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment (one per line)</Label>
                <Textarea
                  id="equipment"
                  value={(formData.equipment || []).join("\n")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      equipment: e.target.value
                        .split("\n")
                        .filter((item) => item.trim()),
                    })
                  }
                  placeholder="Longsword&#10;Chain Mail&#10;Shield&#10;Backpack"
                  rows={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="spells">Spells (one per line)</Label>
                <Textarea
                  id="spells"
                  value={(formData.spells || []).join("\n")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      spells: e.target.value
                        .split("\n")
                        .filter((spell) => spell.trim()),
                    })
                  }
                  placeholder="Magic Missile&#10;Shield&#10;Cure Wounds"
                  rows={6}
                />
              </div>
            </TabsContent>

            {/* Backstory Tab */}
            <TabsContent value="backstory" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backstory">Character Backstory</Label>
                <Textarea
                  id="backstory"
                  value={formData.backstory}
                  onChange={(e) =>
                    setFormData({ ...formData, backstory: e.target.value })
                  }
                  placeholder="Tell your character's story..."
                  rows={10}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {character ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {character ? "Update Character" : "Create Character"}
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
