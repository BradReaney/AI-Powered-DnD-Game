"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle,
  Circle,
  BookOpen,
  Users,
  Globe,
  Target,
  AlertTriangle,
  CheckSquare,
} from "lucide-react";
import type { StoryArc, StoryValidationReport } from "@/lib/types";

interface StoryArcDetailProps {
  storyArc: StoryArc;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onValidate?: () => Promise<StoryValidationReport>;
}

export function StoryArcDetail({
  storyArc,
  onBack,
  onEdit,
  onDelete,
  onValidate,
}: StoryArcDetailProps) {
  const [validationReport, setValidationReport] = useState<StoryValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!onValidate) return;

    try {
      setIsValidating(true);
      const report = await onValidate();
      setValidationReport(report);
    } catch (error) {
      console.error("Error validating story arc:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const progressPercentage = storyArc.totalChapters > 0
    ? (storyArc.currentChapter / storyArc.totalChapters) * 100
    : 0;

  const completedBeats = storyArc.storyBeats.filter(beat => beat.completed).length;
  const totalBeats = storyArc.storyBeats.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaign
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">Story Arc</h1>
            <Badge variant="outline" className="capitalize">
              {storyArc.tone}
            </Badge>
            <Badge variant="secondary" className="capitalize">
              {storyArc.pacing} pacing
            </Badge>
          </div>
          <p className="text-muted-foreground">{storyArc.theme}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {onValidate && (
            <Button variant="outline" onClick={handleValidate} disabled={isValidating}>
              <CheckSquare className="h-4 w-4 mr-2" />
              {isValidating ? "Validating..." : "Validate"}
            </Button>
          )}
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Story Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Chapter Progress</span>
                <span>{storyArc.currentChapter} / {storyArc.totalChapters}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{storyArc.storyBeats.length}</div>
                <div className="text-sm text-muted-foreground">Story Beats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{completedBeats}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{storyArc.characterMilestones.length}</div>
                <div className="text-sm text-muted-foreground">Milestones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{storyArc.questProgress.length}</div>
                <div className="text-sm text-muted-foreground">Quests</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Report */}
      {validationReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Validation Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">
                  {validationReport.overallScore !== null
                    ? `${Math.round(validationReport.overallScore)}%`
                    : "N/A"
                  }
                </div>
                <div>
                  <div className="font-semibold">
                    {validationReport.valid ? "Valid" : "Needs Attention"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {validationReport.summary.passedRules} / {validationReport.summary.totalRules} rules passed
                  </div>
                </div>
              </div>

              {validationReport.recommendations.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Recommendations:</h4>
                  <ul className="space-y-1">
                    {validationReport.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Arc Management Tabs */}
      <Tabs defaultValue="beats" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="beats" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Story Beats
          </TabsTrigger>
          <TabsTrigger value="milestones" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="world" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            World Changes
          </TabsTrigger>
          <TabsTrigger value="quests" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="beats">
          <Card>
            <CardHeader>
              <CardTitle>Story Beats</CardTitle>
              <CardDescription>
                Key narrative moments that drive the story forward
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storyArc.storyBeats.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No story beats created yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Story beats will be automatically generated as you play.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {storyArc.storyBeats.map((beat) => (
                    <Card key={beat.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{beat.title}</h4>
                              <Badge variant="outline" className="capitalize">
                                {beat.type}
                              </Badge>
                              <Badge
                                variant={beat.importance === "critical" ? "destructive" :
                                        beat.importance === "major" ? "default" : "secondary"}
                                className="capitalize"
                              >
                                {beat.importance}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {beat.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Chapter {beat.chapter}</span>
                              <span>Act {beat.act}</span>
                              {beat.location && <span>📍 {beat.location}</span>}
                            </div>
                          </div>
                          <div className="ml-4">
                            {beat.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="milestones">
          <Card>
            <CardHeader>
              <CardTitle>Character Milestones</CardTitle>
              <CardDescription>
                Important character development moments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storyArc.characterMilestones.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No character milestones yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Milestones will be tracked as characters develop.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {storyArc.characterMilestones.map((milestone) => (
                    <Card key={milestone.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{milestone.title}</h4>
                              <Badge variant="outline" className="capitalize">
                                {milestone.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {milestone.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Chapter {milestone.chapter}</span>
                              <span>Act {milestone.act}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            {milestone.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="world">
          <Card>
            <CardHeader>
              <CardTitle>World State Changes</CardTitle>
              <CardDescription>
                How the world evolves throughout the story
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storyArc.worldStateChanges.length === 0 ? (
                <div className="text-center py-8">
                  <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No world changes tracked yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    World changes will be recorded as the story progresses.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {storyArc.worldStateChanges.map((change) => (
                    <Card key={change.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{change.title}</h4>
                              <Badge variant="outline" className="capitalize">
                                {change.type}
                              </Badge>
                              <Badge
                                variant={change.impact === "catastrophic" ? "destructive" :
                                        change.impact === "major" ? "default" : "secondary"}
                                className="capitalize"
                              >
                                {change.impact}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {change.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Chapter {change.chapter}</span>
                              <span>Act {change.act}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quests">
          <Card>
            <CardHeader>
              <CardTitle>Quest Progress</CardTitle>
              <CardDescription>
                Track quest completion and objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              {storyArc.questProgress.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No quests tracked yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quest progress will be monitored as you play.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {storyArc.questProgress.map((quest) => (
                    <Card key={quest.id} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{quest.questName}</h4>
                              <Badge variant="outline" className="capitalize">
                                {quest.type}
                              </Badge>
                              <Badge
                                variant={quest.status === "completed" ? "default" :
                                        quest.status === "active" ? "secondary" : "destructive"}
                                className="capitalize"
                              >
                                {quest.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {quest.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Chapter {quest.chapter}</span>
                              <span>Act {quest.act}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
