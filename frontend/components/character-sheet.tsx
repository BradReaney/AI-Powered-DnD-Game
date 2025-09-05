"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Character } from "@/lib/types";
import { CharacterSheetErrorBoundary } from "./CharacterSheetErrorBoundary";
import {
  Edit,
  Heart,
  Shield,
  Zap,
  Sword,
  Scroll,
  User,
  MapPin,
  Trash2,
} from "lucide-react";

interface CharacterSheetProps {
  character: Character;
  onEdit?: () => void;
  onBack?: () => void;
  onDelete?: () => void;
}

function CharacterSheetContent({
  character,
  onEdit,
  onDelete,
}: CharacterSheetProps) {
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Validate character data
  if (!character) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No character selected
      </div>
    );
  }

  // Deep clean character data to remove problematic properties
  const deepCleanObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepCleanObject);

    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip problematic keys that might cause React errors
      if (
        key.startsWith("_") ||
        key === "__v" ||
        key === "arrivedAt" ||
        key === "toJSON" ||
        key === "toObject"
      ) {
        continue;
      }
      cleaned[key] = deepCleanObject(value);
    }
    return cleaned;
  };

  const cleanedCharacter = deepCleanObject(character);

  // Safely access character properties with fallbacks
  const safeCharacter = {
    name: cleanedCharacter?.name || "Unknown",
    level: cleanedCharacter?.level || 1,
    race: cleanedCharacter?.race || "Unknown",
    class: cleanedCharacter?.class || "Unknown",
    background: cleanedCharacter?.background || "Unknown",
    alignment: cleanedCharacter?.alignment || "Unknown",
    currentLocation: (() => {
      const location = cleanedCharacter?.currentLocation;
      if (typeof location === "string") {
        return location;
      } else if (location && typeof location === "object" && location.name) {
        return location.name;
      } else {
        return "";
      }
    })(),
    hitPoints: {
      current: cleanedCharacter?.hitPoints?.current || 0,
      maximum: cleanedCharacter?.hitPoints?.maximum || 0,
    },
    armorClass: cleanedCharacter?.armorClass || 10,
    proficiencyBonus: cleanedCharacter?.proficiencyBonus || 2,
    stats: cleanedCharacter?.stats ||
      cleanedCharacter?.attributes || {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
      },
    skills: cleanedCharacter?.skills || [],
    equipment: cleanedCharacter?.equipment || [],
    spells: cleanedCharacter?.spells || [],
    backstory: cleanedCharacter?.backstory || "",
  };

  // Validate stats object
  if (!safeCharacter.stats || typeof safeCharacter.stats !== "object") {
    return (
      <div className="p-4 text-center text-red-600">
        Invalid character data: missing stats
      </div>
    );
  }

  // Additional safety check for stats object
  const statsEntries = Object.entries(safeCharacter.stats);
  if (statsEntries.length === 0) {
    return (
      <div className="p-4 text-center text-red-600">
        Invalid character data: empty stats
      </div>
    );
  }

  const hpPercentage =
    safeCharacter.hitPoints.maximum > 0
      ? (safeCharacter.hitPoints.current / safeCharacter.hitPoints.maximum) *
        100
      : 0;

  return (
    <div className="space-y-6">
      {/* Character Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{safeCharacter.name}</CardTitle>
                <CardDescription className="text-lg">
                  Level {safeCharacter.level} {safeCharacter.race}{" "}
                  {safeCharacter.class}
                </CardDescription>
                <div className="flex gap-2">
                  <Badge variant="outline">{safeCharacter.background}</Badge>
                  <Badge variant="secondary">{safeCharacter.alignment}</Badge>
                  {safeCharacter.currentLocation &&
                    typeof safeCharacter.currentLocation === "string" && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3" />
                        {safeCharacter.currentLocation}
                      </Badge>
                    )}
                </div>
              </div>
            </div>
            {onEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Core Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Hit Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">
                  {safeCharacter.hitPoints.current}
                </span>
                <span className="text-muted-foreground">
                  / {safeCharacter.hitPoints.maximum}
                </span>
              </div>
              <Progress value={hpPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Armor Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeCharacter.armorClass}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Proficiency Bonus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{safeCharacter.proficiencyBonus}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Character Details */}
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="skills" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Skills
          </TabsTrigger>
          <TabsTrigger value="equipment" className="flex items-center gap-2">
            <Sword className="h-4 w-4" />
            Equipment
          </TabsTrigger>
          <TabsTrigger value="backstory" className="flex items-center gap-2">
            <Scroll className="h-4 w-4" />
            Backstory
          </TabsTrigger>
        </TabsList>

        {/* Ability Scores */}
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Ability Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {statsEntries.map(([stat, value]) => {
                  // Additional safety check for the value
                  if (typeof value === "object" && value !== null) {
                    return null; // Skip rendering this stat
                  }

                  const numericValue = typeof value === "number" ? value : 10;
                  return (
                    <div
                      key={stat}
                      className="text-center p-4 bg-muted rounded-lg"
                    >
                      <div className="text-sm font-medium text-muted-foreground capitalize mb-1">
                        {stat}
                      </div>
                      <div className="text-2xl font-bold mb-1">
                        {numericValue}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getModifier(numericValue)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills */}
        <TabsContent value="skills">
          <Card>
            <CardHeader>
              <CardTitle>Proficient Skills</CardTitle>
              <CardDescription>
                Skills your character is trained in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {safeCharacter.skills.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {safeCharacter.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="justify-start"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No proficient skills selected.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Equipment */}
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              {safeCharacter.equipment.length > 0 ? (
                <div className="space-y-2">
                  {safeCharacter.equipment.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded"
                    >
                      <Sword className="h-4 w-4 text-muted-foreground" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No equipment listed.</p>
              )}
            </CardContent>
          </Card>

          {safeCharacter.spells && safeCharacter.spells.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Spells</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {safeCharacter.spells.map((spell, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded"
                    >
                      <Scroll className="h-4 w-4 text-muted-foreground" />
                      <span>{spell}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Backstory */}
        <TabsContent value="backstory">
          <Card>
            <CardHeader>
              <CardTitle>Character Backstory</CardTitle>
            </CardHeader>
            <CardContent>
              {safeCharacter.backstory ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">
                    {safeCharacter.backstory}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No backstory written yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function CharacterSheet({
  character,
  onEdit,
  onDelete,
}: CharacterSheetProps) {
  return (
    <CharacterSheetErrorBoundary>
      <CharacterSheetContent
        character={character}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </CharacterSheetErrorBoundary>
  );
}
