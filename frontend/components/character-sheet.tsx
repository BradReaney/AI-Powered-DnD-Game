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
import {
  Edit,
  Heart,
  Shield,
  Zap,
  Sword,
  Scroll,
  User,
  MapPin,
} from "lucide-react";

interface CharacterSheetProps {
  character: Character;
  onEdit?: () => void;
  onBack?: () => void;
}

export function CharacterSheet({ character, onEdit }: CharacterSheetProps) {
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const hpPercentage =
    (character.hitPoints.current / character.hitPoints.maximum) * 100;

  return (
    <div className="space-y-6">
      {/* Character Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{character.name}</CardTitle>
                <CardDescription className="text-lg">
                  Level {character.level} {character.race} {character.class}
                </CardDescription>
                <div className="flex gap-2">
                  <Badge variant="outline">{character.background}</Badge>
                  <Badge variant="secondary">{character.alignment}</Badge>
                  {character.currentLocation && (
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="h-3 w-3" />
                      {character.currentLocation}
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
                  {character.hitPoints.current}
                </span>
                <span className="text-muted-foreground">
                  / {character.hitPoints.maximum}
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
            <div className="text-2xl font-bold">{character.armorClass}</div>
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
              +{character.proficiencyBonus}
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
                {Object.entries(character.stats).map(([stat, value]) => (
                  <div
                    key={stat}
                    className="text-center p-4 bg-muted rounded-lg"
                  >
                    <div className="text-sm font-medium text-muted-foreground capitalize mb-1">
                      {stat}
                    </div>
                    <div className="text-2xl font-bold mb-1">{value}</div>
                    <div className="text-sm text-muted-foreground">
                      {getModifier(value)}
                    </div>
                  </div>
                ))}
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
              {character.skills.length > 0 ? (
                <div className="grid gap-2 md:grid-cols-2">
                  {character.skills.map((skill) => (
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
              {character.equipment.length > 0 ? (
                <div className="space-y-2">
                  {character.equipment.map((item, index) => (
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

          {character.spells && character.spells.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Spells</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {character.spells.map((spell, index) => (
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
              {character.backstory ? (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{character.backstory}</p>
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
