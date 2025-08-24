import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DiceRoller } from "./dice-roller";
import type { Character, Campaign, Location } from "@/lib/types";
import {
    Dice6,
    Sword,
    User,
    Bot,
    Heart,
    Shield,
    Zap,
    BookOpen,
    Target,
    Clock,
    MapPin,
} from "lucide-react";

interface GameToolsProps {
    character: Character;
    campaign: Campaign;
    currentLocation?: Location;
    onCombatAction?: (action: any) => void;
    onDiceRoll?: (result: any) => void;
}

export function GameTools({
    character,
    campaign,
    currentLocation,
    onCombatAction,
    onDiceRoll,
}: GameToolsProps) {
    const [activeTab, setActiveTab] = useState("dice");

    const handleDiceRoll = (result: any) => {
        onDiceRoll?.(result);
    };

    const handleCombatAction = (action: any) => {
        onCombatAction?.(action);
    };

    return (
        <Card className="w-80 h-full">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Sword className="h-5 w-5" />
                    Game Tools
                </CardTitle>
                <CardDescription>
                    Essential tools for your D&D adventure
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="dice" className="text-xs">
                            <Dice6 className="h-3 w-3 mr-1" />
                            Dice
                        </TabsTrigger>
                        <TabsTrigger value="combat" className="text-xs">
                            <Sword className="h-3 w-3 mr-1" />
                            Combat
                        </TabsTrigger>
                        <TabsTrigger value="character" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Character
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="text-xs">
                            <Bot className="h-3 w-3 mr-1" />
                            AI
                        </TabsTrigger>
                    </TabsList>

                    {/* Character Status Bar */}
                    <div className="p-4 border-b">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium truncate">{character.name}</span>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                                Lvl {character.level}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 text-red-500 flex-shrink-0" />
                                <span>{character.hitPoints?.current || 0}/{character.hitPoints?.maximum || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Shield className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                <span>AC {character.armorClass || 10}</span>
                            </div>
                        </div>
                        {currentLocation && (
                            <div className="mt-2 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3 inline mr-1 flex-shrink-0" />
                                <span className="truncate">{currentLocation.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Tab Content */}
                    <TabsContent value="dice" className="p-4 space-y-4">
                        <DiceRoller onRoll={handleDiceRoll} className="w-full" />
                    </TabsContent>

                    <TabsContent value="combat" className="p-4 space-y-4">
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">Combat Actions</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCombatAction({ type: "attack", name: "Melee Attack" })}
                                    className="text-xs"
                                >
                                    <Sword className="h-3 w-3 mr-1" />
                                    Attack
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCombatAction({ type: "defend", name: "Defend" })}
                                    className="text-xs"
                                >
                                    <Shield className="h-3 w-3 mr-1" />
                                    Defend
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCombatAction({ type: "spell", name: "Cast Spell" })}
                                    className="text-xs"
                                >
                                    <Zap className="h-3 w-3 mr-1" />
                                    Spell
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCombatAction({ type: "item", name: "Use Item" })}
                                    className="text-xs"
                                >
                                    <BookOpen className="h-3 w-3 mr-1" />
                                    Item
                                </Button>
                            </div>
                            <Separator />
                            <div className="text-xs space-y-2">
                                <div className="flex justify-between items-center min-w-0">
                                    <span className="truncate">Initiative:</span>
                                    <span className="font-mono flex-shrink-0 ml-2">
                                        +{Math.floor((character.stats?.dexterity || 10 - 10) / 2)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center min-w-0">
                                    <span className="truncate">Speed:</span>
                                    <span className="font-mono flex-shrink-0 ml-2">30 ft</span>
                                </div>
                                <div className="flex justify-between items-center min-w-0">
                                    <span className="truncate">Proficiency:</span>
                                    <span className="font-mono flex-shrink-0 ml-2">+{character.proficiencyBonus || 2}</span>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="character" className="p-4 space-y-4">
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">Character Info</h4>
                            <div className="text-xs space-y-2">
                                <div className="flex justify-between items-center min-w-0">
                                    <span className="truncate">Race:</span>
                                    <span className="font-medium truncate ml-2">{character.race}</span>
                                </div>
                                <div className="flex justify-between items-center min-w-0">
                                    <span className="truncate">Class:</span>
                                    <span className="font-medium truncate ml-2">{character.class}</span>
                                </div>
                                <div className="flex justify-between items-center min-w-0">
                                    <span className="truncate">Background:</span>
                                    <span className="font-medium truncate ml-2">{character.background}</span>
                                </div>
                                <div className="flex justify-between items-center min-w-0">
                                    <span className="truncate">Alignment:</span>
                                    <span className="font-medium truncate ml-2">{character.alignment}</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="text-xs">
                                <h5 className="font-medium mb-2">Ability Scores</h5>
                                <div className="space-y-1">
                                    {Object.entries(character.stats || {}).map(([stat, value]) => (
                                        <div key={stat} className="flex justify-between items-center min-w-0">
                                            <span className="capitalize truncate">{stat}:</span>
                                            <span className="font-mono flex-shrink-0 ml-2">
                                                {value} ({Math.floor((value - 10) / 2) >= 0 ? "+" : ""}{Math.floor((value - 10) / 2)})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="ai" className="p-4 space-y-4">
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium">AI Assistant</h4>
                            <div className="text-xs space-y-2">
                                <div className="flex items-center gap-2">
                                    <Target className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">Context Management</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">Session History</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-3 w-3 flex-shrink-0" />
                                    <span className="truncate">World State</span>
                                </div>
                            </div>
                            <Separator />
                            <div className="text-xs space-y-2">
                                <div className="p-3 bg-muted rounded-lg">
                                    <p className="text-muted-foreground text-xs leading-relaxed">
                                        AI context management is integrated into the main chat interface.
                                        The AI will remember your character's actions and maintain story consistency.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" size="sm" className="text-xs">
                                        <Target className="h-3 w-3 mr-1" />
                                        Context
                                    </Button>
                                    <Button variant="outline" size="sm" className="text-xs">
                                        <Clock className="h-3 w-3 mr-1" />
                                        History
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
